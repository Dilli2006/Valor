import { z } from "zod";
import { BriefSchema, ExplainOverviewSchema, ExplanationSchema, GeneratedFileSchema, PlanSchema } from "@/lib/schemas";
import { errorResponse, hashKey, runStage } from "@/lib/ai/stream";
import { EXPLAIN_PROMPT_VERSION, explainOverviewSystem, explainOverviewUser, explainTargetSystem, explainTargetUser, type ExplainTarget } from "@/lib/prompts/explain.v1";

export const maxDuration = 60;

const Body = z.object({
  mode: z.enum(["overview", "target"]),
  level: z.enum(["beginner", "intermediate"]).default("beginner"),
  brief: BriefSchema.optional(),
  plan: PlanSchema.optional(),
  files: z.array(GeneratedFileSchema).min(1).max(24),
  target: z
    .union([
      z.object({ targetType: z.literal("file"), path: z.string() }),
      z.object({ targetType: z.literal("range"), path: z.string(), startLine: z.number().int().min(1), endLine: z.number().int().min(1) }),
      z.object({ targetType: z.literal("decision"), decisionId: z.string(), title: z.string().max(200), context: z.string().max(1500) }),
    ])
    .optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return errorResponse("bad_request", "Invalid explain request.", false);
  const { mode, level, brief, plan, files, target } = parsed.data;

  if (mode === "overview") {
    if (!brief || !plan) return errorResponse("bad_request", "Overview needs brief and plan.", false);
    return runStage(req, {
      stage: "explain:overview",
      schema: ExplainOverviewSchema,
      system: explainOverviewSystem(level),
      prompt: explainOverviewUser(brief, plan, files),
      maxOutputTokens: 6000,
      timeoutMs: 55_000,
      cacheKey: hashKey(EXPLAIN_PROMPT_VERSION, "overview", level, plan, files.map((f) => [f.path, f.content])),
      progress: ["Reading every generated file…", "Linking code back to plan decisions…"],
    });
  }

  if (!target) return errorResponse("bad_request", "Target required.", false);
  return runStage(req, {
    stage: `explain:${target.targetType}`,
    schema: ExplanationSchema,
    system: explainTargetSystem(level),
    prompt: explainTargetUser(target as ExplainTarget, plan, files),
    maxOutputTokens: 1500,
    timeoutMs: 25_000,
    cacheKey: hashKey(EXPLAIN_PROMPT_VERSION, "target", level, target, files.map((f) => [f.path, f.content])),
    progress: ["Explaining…"],
  });
}
