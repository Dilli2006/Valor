import type { Brief, GeneratedFile, Level, Plan } from "@/lib/schemas";
import { delimit, LEVEL_GUIDE, SECURITY_RULES } from "./shared";

export const EXPLAIN_PROMPT_VERSION = "explain.v1";

const GROUNDING = `
GROUNDING RULES:
- Only refer to files and identifiers that appear in <project_files>. Never invent files, functions or variables.
- Always cite the file path and line numbers you refer to (lines like "12-20").
- If something is not in the code, say so plainly.
`.trim();

export function numbered(content: string) {
  return content.split("\n").map((l, i) => `${String(i + 1).padStart(3, " ")}| ${l}`).join("\n");
}

export function filesBlock(files: GeneratedFile[]) {
  return delimit("project_files", files.map((f) => `=== ${f.path} ===\n${numbered(f.content)}`).join("\n\n"));
}

export function explainOverviewSystem(level: Level) {
  return `
ROLE: You are the "Explain" stage of Valor AppStudio, a patient senior engineer and teacher.
Produce: (a) a summary for EVERY file, with key identifiers; (b) rationale for each major plan decision
(navigation type, state approach, storage, each stack choice, data model) linked to a plan item; (c) an ordered
data-flow walkthrough (user action -> screen -> context/reducer -> storage -> re-render), citing files.
${LEVEL_GUIDE[level]}
${GROUNDING}
${SECURITY_RULES}

EXAMPLE 1: fileSummaries item => {"path":"src/store/AppContext.js","summary":"Holds all app data in one place using useReducer and saves it to AsyncStorage whenever it changes.","keyIdentifiers":["AppProvider","useApp","reducer"]}
EXAMPLE 2: decisions item => {"id":"d1","title":"React Context instead of Redux","planRef":"stack: React Context + useReducer","rationale":"The app has one small store; Context avoids an extra dependency while useReducer keeps updates predictable."}
`.trim();
}

export function explainOverviewUser(brief: Brief, plan: Plan, files: GeneratedFile[]) {
  return [delimit("brief", JSON.stringify(brief)), delimit("plan", JSON.stringify(plan)), filesBlock(files)].join("\n\n");
}

export function explainTargetSystem(level: Level) {
  return `
ROLE: You explain one specific target (a file, a selected code range, or a plan decision) of a generated Expo app.
Return a short title, a plain-language explanation (markdown, ~120-250 words, bullet points welcome) and references.
${LEVEL_GUIDE[level]}
${GROUNDING}
${SECURITY_RULES}

EXAMPLE 1 (range): {"title":"Saving state with useEffect","text":"Whenever **state** changes, this effect runs...","references":[{"path":"src/store/AppContext.js","lines":"24-31","identifier":"useEffect"}]}
EXAMPLE 2 (decision): {"title":"Why bottom tabs","text":"Tabs keep the two main areas one tap away...","references":[{"path":"src/navigation/AppNavigator.js","lines":"10-28","identifier":"Tab.Navigator"}]}
`.trim();
}

export type ExplainTarget =
  | { targetType: "file"; path: string }
  | { targetType: "range"; path: string; startLine: number; endLine: number }
  | { targetType: "decision"; decisionId: string; title: string; context: string };

export function explainTargetUser(target: ExplainTarget, plan: Plan | undefined, files: GeneratedFile[]) {
  let t: string;
  if (target.targetType === "file") t = `Explain the file ${target.path} as a whole: its role, main parts, and how it connects to other files.`;
  else if (target.targetType === "range") {
    const file = files.find((f) => f.path === target.path);
    const snippet = file ? file.content.split("\n").slice(target.startLine - 1, target.endLine).join("\n") : "";
    t = `Explain lines ${target.startLine}-${target.endLine} of ${target.path} line by line where useful.\nSelected code:\n${delimit("selection", snippet)}`;
  } else t = `Explain the plan decision "${target.title}" (${target.decisionId}). Context: ${delimit("decision", target.context)}. Show where it shows up in the code.`;
  return [t, plan ? delimit("plan", JSON.stringify(plan)) : "", filesBlock(files)].join("\n\n");
}

export function chatSystem(level: Level) {
  return `
ROLE: You are "Chat with Code" inside Valor AppStudio. Answer questions about the user's generated Expo app.
Be concise (under 200 words unless asked), friendly and practical. Use markdown and short code snippets.
When suggesting changes, show the exact file path and the code to change. Encourage the user to try it themselves.
${LEVEL_GUIDE[level]}
${GROUNDING}
${SECURITY_RULES}
`.trim();
}
