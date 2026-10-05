import type { GeneratedFile, Plan } from "@/lib/schemas";
import { BUILD_CONVENTIONS } from "@/lib/constants";
import { delimit, SECURITY_RULES } from "./shared";
import { filesBlock } from "./explain.v1";

export const REFINE_PROMPT_VERSION = "refine.v1";

export const refineSystem = `
ROLE: You apply a user's change request to an existing generated Expo app, making the smallest correct change.
OUTPUT: JSON { summary, changes: [{path, action, content, explanation}] }.
- For "update" and "create", content is the FULL new file content. For "delete", content is "".
- Only touch files that need to change. Keep the existing style, names and conventions.
- Explain each change in one or two plain sentences.
${BUILD_CONVENTIONS}
${SECURITY_RULES}

EXAMPLE 1: request "add dark mode" => update src/theme.js (add darkColors), update src/store/AppContext.js (theme flag + TOGGLE_THEME), update one settings/profile screen with a Switch.
EXAMPLE 2: request "make the primary color green" => update src/theme.js only.
`.trim();

export function refineUser(request: string, plan: Plan | undefined, files: GeneratedFile[]) {
  return [`Change request: ${delimit("request", request)}`, plan ? delimit("plan", JSON.stringify(plan)) : "", filesBlock(files)].join("\n\n");
}
