import "server-only";
import { APICallError, generateObject, NoObjectGeneratedError, RetryError, streamObject } from "ai";
import type { z } from "zod";
import { createHash } from "crypto";
import { getModels, type ModelHandle } from "./provider";
import type { ErrorKind, StreamEvent } from "@/lib/schemas";

/* ---------------- rate limiting + cache (in-memory, per instance) ---------------- */
const hits = new Map<string, number[]>();
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MIN ?? 40);

export function rateLimited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT;
}

const cache = new Map<string, unknown>();
export const hashKey = (...parts: unknown[]) => createHash("sha256").update(JSON.stringify(parts)).digest("hex");

/* ---------------- error classification ---------------- */
export function classify(err: unknown): { kind: ErrorKind; message: string; retryable: boolean } {
  const e = err instanceof RetryError ? err.lastError : err;
  if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return { kind: "timeout", message: "The model took too long to respond.", retryable: true };
  if (APICallError.isInstance(e)) {
    if (e.statusCode === 429) return { kind: "rate_limit", message: "The AI provider is rate-limiting requests (free tier). Try again in a moment or load a sample project.", retryable: true };
    if (e.statusCode === 401 || e.statusCode === 403) return { kind: "no_api_key", message: "The AI provider rejected the API key.", retryable: false };
    return { kind: "model_failure", message: `Model error (${e.statusCode ?? "network"}): ${e.message.slice(0, 160)}`, retryable: true };
  }
  if (NoObjectGeneratedError.isInstance(e)) return { kind: "validation", message: "The model returned output that did not match the expected structure.", retryable: true };
  return { kind: "model_failure", message: e instanceof Error ? e.message.slice(0, 200) : "Unknown model error", retryable: true };
}

/* ---------------- NDJSON helpers ---------------- */
export function ndjsonResponse(run: (send: (ev: StreamEvent) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(ev) + "\n"));
      try {
        await run(send);
      } catch (err) {
        send({ type: "error", error: classify(err) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}

export function errorResponse(kind: ErrorKind, message: string, retryable: boolean, status = 400) {
  return new Response(JSON.stringify({ type: "error", error: { kind, message, retryable } }) + "\n", { status, headers: { "Content-Type": "application/x-ndjson" } });
}

/* ---------------- the core stage runner ---------------- */
type RunOpts<S extends z.ZodTypeAny> = {
  stage: string;
  schema: S;
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  cacheKey?: string;
  progress?: string[];
  postProcess?: (obj: z.infer<S>) => z.infer<S>;
};

/**
 * Streams a structured object: partials -> validate -> one repair call on failure -> typed error.
 * Tries each configured model in order (primary, then fallback) on provider errors.
 */
export function runStage<S extends z.ZodTypeAny>(req: Request, opts: RunOpts<S>) {
  if (rateLimited(req)) return errorResponse("rate_limit", "Too many requests from your IP. Please wait a minute.", true, 429);
  const models = getModels();
  if (!models.length) return errorResponse("no_api_key", "No AI provider is configured on the server (set GEMINI_API_KEY). You can still explore the sample projects.", false, 503);

  return ndjsonResponse(async (send) => {
    const t0 = Date.now();
    if (opts.cacheKey && cache.has(opts.cacheKey)) {
      send({ type: "final", data: cache.get(opts.cacheKey), meta: { model: "cache", repaired: false, cached: true, ms: 0 } });
      return;
    }
    for (const msg of opts.progress ?? []) send({ type: "progress", message: msg });

    let lastErr: unknown;
    for (const m of models) {
      try {
        const { object, repaired } = await attempt(m, opts, send);
        const finalObj = opts.postProcess ? opts.postProcess(object) : object;
        if (opts.cacheKey) cache.set(opts.cacheKey, finalObj);
        const ms = Date.now() - t0;
        console.log(JSON.stringify({ evt: "stage_ok", stage: opts.stage, model: m.id, ms, repaired }));
        send({ type: "final", data: finalObj, meta: { model: m.id, repaired, cached: false, ms } });
        return;
      } catch (err) {
        lastErr = err;
        const c = classify(err);
        console.warn(JSON.stringify({ evt: "stage_fail", stage: opts.stage, model: m.id, kind: c.kind, msg: c.message }));
        if (c.kind === "validation") break; // already repaired once; don't burn quota on other models
        send({ type: "progress", message: `Primary model unavailable (${c.kind}), trying fallback…` });
      }
    }
    send({ type: "error", error: classify(lastErr) });
  });
}

async function attempt<S extends z.ZodTypeAny>(m: ModelHandle, opts: RunOpts<S>, send: (ev: StreamEvent) => void) {
  const signal = AbortSignal.timeout(opts.timeoutMs ?? 85_000);
  const result = streamObject({
    model: m.model,
    schema: opts.schema,
    system: opts.system,
    prompt: opts.prompt,
    maxOutputTokens: opts.maxOutputTokens ?? 8000,
    temperature: 0.4,
    maxRetries: 1,
    abortSignal: signal,
    providerOptions: m.providerOptions as never,
    onError: () => {},
  });

  let last = 0;
  for await (const partial of result.partialObjectStream) {
    const now = Date.now();
    if (now - last > 180) {
      send({ type: "partial", data: partial });
      last = now;
    }
  }

  try {
    return { object: (await result.object) as z.infer<S>, repaired: false };
  } catch (err) {
    if (!NoObjectGeneratedError.isInstance(err)) throw err;
    // One automatic repair call with the validation error (PRD §11).
    send({ type: "progress", message: "Output failed validation — running one automatic repair…" });
    const repairedObj = await generateObject({
      model: m.model,
      schema: opts.schema,
      system: opts.system,
      prompt: `${opts.prompt}\n\nYour previous answer failed schema validation.\nERROR: ${String(err.cause ?? err.message).slice(0, 1500)}\nPREVIOUS OUTPUT (may be truncated):\n${(err.text ?? "").slice(0, 6000)}\n\nReturn a corrected, complete JSON object that matches the schema exactly.`,
      maxOutputTokens: opts.maxOutputTokens ?? 8000,
      temperature: 0.2,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(60_000),
      providerOptions: m.providerOptions as never,
    });
    return { object: repairedObj.object as z.infer<S>, repaired: true };
  }
}

/* ---------------- input sanitisation ---------------- */
export function cleanText(v: unknown, max: number) {
  if (typeof v !== "string") return "";
  // strip control chars except newline/tab
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max).trim();
}

const HARMFUL = /\b(malware|ransomware|keylogger|spyware|stalkerware|botnet|ddos|phishing|credit card skimm|steal (passwords|credentials)|track (my )?(wife|husband|girlfriend|boyfriend|partner) (secretly|without)|secretly (track|record|monitor)|without (their|them) knowing|fake (id|passport)|launder)/i;
export function looksHarmful(text: string) {
  return HARMFUL.test(text);
}
