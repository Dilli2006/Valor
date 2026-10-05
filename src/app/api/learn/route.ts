import { z } from "zod";
import { BriefSchema, GeneratedFileSchema, LearningPathSchema, PlanSchema } from "@/lib/schemas";
import { errorResponse, hashKey, runStage } from "@/lib/ai/stream";
import { learnSystem, learnUser, LEARN_PROMPT_VERSION } from "@/lib/prompts/learn.v1";

export const maxDuration = 60;

const Body = z.object({ brief: BriefSchema, plan: PlanSchema, files: z.array(GeneratedFileSchema).min(1).max(24) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return errorResponse("bad_request", "Learn requires the brief, plan and generated files.", false);
  const { brief, plan, files } = parsed.data;

  return runStage(req, {
    stage: "learn",
    schema: LearningPathSchema,
    system: learnSystem,
    prompt: learnUser(brief, plan, files),
    maxOutputTokens: 8000,
    timeoutMs: 55_000,
    cacheKey: hashKey(LEARN_PROMPT_VERSION, plan, files.map((f) => [f.path, f.content])),
    progress: ["Finding the concepts your app uses…", "Ordering lessons to match your build steps…", "Writing exercises and a quiz…"],
    postProcess: (lp) => ({
      ...lp,
      lessons: lp.lessons.slice(0, 8),
      quiz: lp.quiz
        .filter((q) => q.options.length >= 2)
        .slice(0, 5)
        .map((q) => ({ ...q, answerIndex: Math.min(Math.max(0, Math.round(q.answerIndex)), q.options.length - 1) })),
    }),
  });
}
