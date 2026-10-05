import { z } from "zod";
import { BriefSchema, BuildPhaseSchema, GeneratedFileSchema, PlanSchema, type BuildPhase } from "@/lib/schemas";
import { errorResponse, hashKey, runStage } from "@/lib/ai/stream";
import { buildSystem, buildUser, BUILD_PROMPT_VERSION } from "@/lib/prompts/build.v1";
import { MAX_FILE_LINES } from "@/lib/constants";

export const maxDuration = 120;

const Body = z.object({
  brief: BriefSchema,
  plan: PlanSchema,
  phase: z.enum(["skeleton", "screens", "polish"]),
  existing: z.array(GeneratedFileSchema).max(20).default([]),
});

const PROGRESS: Record<BuildPhase, string[]> = {
  skeleton: ["Creating App.js, theme and seed data…", "Wiring state + AsyncStorage and navigation…"],
  screens: ["Generating each screen from the plan…", "Building reusable components…"],
  polish: ["Writing README and checking imports…"],
};

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return errorResponse("bad_request", "Build requires an approved plan and brief.", false);
  const { brief, plan, phase, existing } = parsed.data;

  return runStage(req, {
    stage: `build:${phase}`,
    schema: BuildPhaseSchema,
    system: buildSystem,
    prompt: buildUser(brief, plan, phase, existing),
    maxOutputTokens: phase === "screens" ? 20000 : 10000,
    timeoutMs: 110_000,
    cacheKey: hashKey(BUILD_PROMPT_VERSION, phase, brief, plan, existing.map((f) => [f.path, f.content.length])),
    progress: PROGRESS[phase],
    postProcess: (out) => ({
      ...out,
      files: out.files
        .filter((f) => f.path && f.path !== "package.json" && !f.path.includes(".."))
        .map((f) => ({ ...f, path: f.path.replace(/^\.?\//, ""), content: f.content.split("\n").slice(0, MAX_FILE_LINES).join("\n") })),
    }),
  });
}
