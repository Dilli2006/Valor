"use client";
import type { ErrorKind, StreamEvent } from "@/lib/schemas";

export class StageError extends Error {
  kind: ErrorKind;
  retryable: boolean;
  constructor(kind: ErrorKind, message: string, retryable: boolean) {
    super(message);
    this.kind = kind;
    this.retryable = retryable;
  }
}

type Handlers<T> = {
  onProgress?: (msg: string) => void;
  onPartial?: (data: Partial<T>) => void;
  signal?: AbortSignal;
};

/** Calls a stage endpoint and consumes its NDJSON stream. Resolves with the validated final object. */
export async function callStage<T>(endpoint: string, body: unknown, h: Handlers<T> = {}): Promise<{ data: T; meta: { model: string; repaired: boolean; cached: boolean; ms: number } }> {
  let res: Response;
  try {
    res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: h.signal });
  } catch {
    throw new StageError("model_failure", "Network error — check your connection and retry.", true);
  }
  if (!res.body) throw new StageError("model_failure", "Empty response from server.", true);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let final: { data: T; meta: { model: string; repaired: boolean; cached: boolean; ms: number } } | null = null;

  const handle = (line: string) => {
    if (!line.trim()) return;
    let ev: StreamEvent<T>;
    try {
      ev = JSON.parse(line);
    } catch {
      return;
    }
    if (ev.type === "progress") h.onProgress?.(ev.message);
    else if (ev.type === "partial") h.onPartial?.(ev.data as Partial<T>);
    else if (ev.type === "final") final = { data: ev.data, meta: ev.meta };
    else if (ev.type === "error") throw new StageError(ev.error.kind, ev.error.message, ev.error.retryable);
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      handle(line);
    }
  }
  handle(buf);
  if (!final) throw new StageError("model_failure", "The stream ended before a result was produced.", true);
  return final;
}

/** Streams plain text (chat). */
export async function streamTextCall(endpoint: string, body: unknown, onChunk: (full: string) => void, signal?: AbortSignal) {
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
  const ct = res.headers.get("content-type") ?? "";
  if (!res.ok || ct.includes("ndjson")) {
    const t = await res.text();
    try {
      const ev = JSON.parse(t.split("\n")[0]);
      throw new StageError(ev.error.kind, ev.error.message, ev.error.retryable);
    } catch (e) {
      if (e instanceof StageError) throw e;
      throw new StageError("model_failure", "Chat failed.", true);
    }
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk(full);
  }
  return full;
}
