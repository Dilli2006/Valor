import { z } from "zod";
import { GeneratedFileSchema, PlanSchema, RefineSchema } from "@/lib/schemas";
import { cleanText, errorResponse, looksHarmful, runStage } from "@/lib/ai/stream";
import { refineSystem, refineUser } from "@/lib/prompts/refine.v1";
import { MAX_FILE_LINES } from "@/lib/constants";

export const maxDuration = 120;

const Body = z.object({ request: z.string(), plan: PlanSchema.optional(), files: z.array(GeneratedFileSchema).min(1).max(24) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return errorResponse("bad_request", "Refine needs a change request and project files.", false);
  const request = cleanText(parsed.data.request, 600);
  if (request.length < 3) return errorResponse("bad_request", "Describe the change you want.", false);
  if (looksHarmful(request)) return errorResponse("unsafe", "That change request looks harmful and can't be applied.", false);

  return runStage(req, {
    stage: "refine",
    schema: RefineSchema,
    system: refineSystem,
    prompt: refineUser(request, parsed.data.plan, parsed.data.files),
    maxOutputTokens: 8192,
    timeoutMs: 110_000,
    progress: ["Finding the files affected by your change…", "Applying the smallest correct edit…"],
    postProcess: (r) => ({
      ...r,
      changes: r.changes
        .filter((c) => c.path && !c.path.includes("..") && c.path !== "package.json")
        .map((c) => ({ ...c, path: c.path.replace(/^\.?\//, ""), content: c.content.split("\n").slice(0, MAX_FILE_LINES).join("\n") })),
    }),
  });
}
