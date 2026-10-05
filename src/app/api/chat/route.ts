import { z } from "zod";
import { streamText } from "ai";
import { GeneratedFileSchema, PlanSchema } from "@/lib/schemas";
import { classify, errorResponse, rateLimited } from "@/lib/ai/stream";
import { getModels } from "@/lib/ai/provider";
import { chatSystem, filesBlock } from "@/lib/prompts/explain.v1";
import { delimit } from "@/lib/prompts/shared";

export const maxDuration = 60;

const Body = z.object({
  level: z.enum(["beginner", "intermediate"]).default("beginner"),
  plan: PlanSchema.optional(),
  files: z.array(GeneratedFileSchema).max(24),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).min(1).max(20),
});

/** Chat with Code: streams plain text grounded in the generated files. */
export async function POST(req: Request) {
  if (rateLimited(req)) return errorResponse("rate_limit", "Too many requests. Please wait a minute.", true, 429);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return errorResponse("bad_request", "Invalid chat request.", false);
  const models = getModels();
  if (!models.length) return errorResponse("no_api_key", "No AI provider configured (set GEMINI_API_KEY).", false, 503);
  const { level, plan, files, messages } = parsed.data;

  const context = [plan ? delimit("plan", JSON.stringify(plan)) : "", filesBlock(files)].join("\n\n");
  const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.role === "user" ? delimit("question", m.content) : m.content }));

  for (const m of models) {
    try {
      const result = streamText({
        model: m.model,
        system: `${chatSystem(level)}\n\nPROJECT CONTEXT:\n${context}`,
        messages: history,
        maxOutputTokens: 1500,
        temperature: 0.3,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(45_000),
        providerOptions: m.providerOptions as never,
      });
      // Pull the first chunk to surface provider errors before committing to this model.
      const reader = result.textStream[Symbol.asyncIterator]();
      const first = await reader.next();
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            if (!first.done) controller.enqueue(encoder.encode(first.value));
            for (let n = await reader.next(); !n.done; n = await reader.next()) controller.enqueue(encoder.encode(n.value));
          } catch {
            controller.enqueue(encoder.encode("\n\n_(The response was interrupted. Please try again.)_"));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Model": m.id } });
    } catch (err) {
      console.warn(JSON.stringify({ evt: "chat_fail", model: m.id, ...classify(err) }));
    }
  }
  return errorResponse("model_failure", "The AI provider is unavailable right now. Please retry.", true, 502);
}
