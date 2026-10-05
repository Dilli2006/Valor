import { UnderstandingSchema } from "@/lib/schemas";
import { cleanText, errorResponse, hashKey, looksHarmful, runStage } from "@/lib/ai/stream";
import { understandSystem, understandUser, UNDERSTAND_PROMPT_VERSION } from "@/lib/prompts/understand.v1";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const idea = cleanText(body.idea, 1000);
  if (idea.length < 3) return errorResponse("bad_request", "Please describe your app idea (at least a few words).", false);
  if (looksHarmful(idea)) return errorResponse("unsafe", "This idea looks like it could cause harm (e.g. malware, covert surveillance or fraud), so AppStudio can't build it. Try a different idea.", false);

  return runStage(req, {
    stage: "understand",
    schema: UnderstandingSchema,
    system: understandSystem,
    prompt: understandUser(idea),
    maxOutputTokens: 3000,
    timeoutMs: 30_000,
    cacheKey: hashKey(UNDERSTAND_PROMPT_VERSION, idea),
    progress: ["Reading your idea…", "Identifying users, problem and core features…"],
    postProcess: (u) => ({
      ...u,
      questions: u.questions.slice(0, 4).map((q) => ({ ...q, suggestions: q.suggestions.slice(0, 3) })),
    }),
  });
}
