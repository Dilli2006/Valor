import { BriefSchema, PlanSchema } from "@/lib/schemas";
import { cleanText, errorResponse, hashKey, runStage } from "@/lib/ai/stream";
import { planSystem, planUser, PLAN_PROMPT_VERSION } from "@/lib/prompts/plan.v1";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const brief = BriefSchema.safeParse(body.brief);
  if (!brief.success) return errorResponse("bad_request", "A confirmed project brief is required.", false);
  const removed: string[] = Array.isArray(body.removedFeatures) ? body.removedFeatures.map((s: unknown) => cleanText(s, 120)).slice(0, 12) : [];
  const feedback = cleanText(body.feedback, 600);

  return runStage(req, {
    stage: "plan",
    schema: PlanSchema,
    system: planSystem,
    prompt: planUser(brief.data, removed, feedback),
    maxOutputTokens: 6000,
    timeoutMs: 50_000,
    cacheKey: hashKey(PLAN_PROMPT_VERSION, brief.data, removed, feedback),
    progress: ["Scoping the MVP…", "Mapping features to screens…", "Choosing a stack and build order…"],
    postProcess: (p) => ({ ...p, screens: p.screens.slice(0, 6), buildSteps: p.buildSteps.slice(0, 10) }),
  });
}
