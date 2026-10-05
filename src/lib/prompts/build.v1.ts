import type { Brief, BuildPhase, GeneratedFile, Plan } from "@/lib/schemas";
import { BUILD_CONVENTIONS } from "@/lib/constants";
import { delimit, SECURITY_RULES } from "./shared";

export const BUILD_PROMPT_VERSION = "build.v1";

export const buildSystem = `
ROLE: You are the "Build" stage of Valor AppStudio, an expert React Native engineer who writes small, correct,
beginner-readable Expo apps. Small and correct beats large and broken.

OUTPUT: JSON { files: [{path, language, content, purpose, stepId}], notes } matching the schema.

${BUILD_CONVENTIONS}

QUALITY:
- Code must run in Expo Snack (web, iOS, Android) without edits.
- Add short comments explaining non-obvious lines (the user is learning from this code).
- Use the exact screen names from the plan; register every screen in AppNavigator.
- Handle empty states and use the seed data so every screen shows content.
- stepId must reference a plan build step id (step-1 ...).
${SECURITY_RULES}

EXAMPLE 1 (skeleton phase, abridged)
=> {"files":[{"path":"src/theme.js","language":"javascript","content":"export const colors = { bg: '#0f0f10', card: '#1a1a1c', text: '#f5f5f5', muted: '#9a9aa0', primary: '#ef4444' };\\nexport const spacing = (n) => n * 4;\\nexport const radius = { sm: 8, md: 12, lg: 16 };\\nexport const typography = { h1: { fontSize: 26, fontWeight: '700' }, body: { fontSize: 15 } };","purpose":"Design tokens shared by every screen.","stepId":"step-1"}],"notes":"Skeleton ready."}

EXAMPLE 2 (screens phase, abridged)
=> {"files":[{"path":"src/screens/TodayScreen.js","language":"javascript","content":"import React from 'react';\\nimport { View, Text, FlatList, StyleSheet } from 'react-native';\\nimport { useApp } from '../store/AppContext';\\nimport HabitRow from '../components/HabitRow';\\nimport { colors, spacing } from '../theme';\\n\\nexport default function TodayScreen({ navigation }) {\\n  const { state, dispatch } = useApp();\\n  return (<View style={styles.container}>...</View>);\\n}\\nconst styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg, padding: spacing(4) } });","purpose":"Lists today's habits with check-in.","stepId":"step-4"}],"notes":"..."}
`.trim();

const PHASE_INSTRUCTIONS: Record<BuildPhase, string> = {
  skeleton: `PHASE 1 of 3 — SKELETON. Generate exactly these files: App.js, src/theme.js, src/data/seed.js,
src/store/AppContext.js, src/navigation/AppNavigator.js. AppNavigator must import every screen from the plan
from '../screens/<ScreenName>' (they will be generated in phase 2 with exactly those names and default exports).
Define all reducer actions the screens will need (add, update, delete, toggle as relevant).`,
  screens: `PHASE 2 of 3 — SCREENS. Generate one file per plan screen at src/screens/<ScreenName>.js (default export)
plus up to 4 reusable components in src/components/. Use useApp() from '../store/AppContext' and the actions it
exposes, and the theme tokens. Only import components you generate in THIS response or files already listed.`,
  polish: `PHASE 3 of 3 — POLISH. Generate README.md (what the app does, how to run with "npx expo start",
project structure, which file implements which feature). If any existing file needs a fix for a missing import
or an obvious bug, re-emit that full file with the fix. Do NOT emit package.json (it is generated automatically).`,
};

export function buildUser(brief: Brief, plan: Plan, phase: BuildPhase, existing: GeneratedFile[]) {
  const existingBlock = existing.length
    ? existing.map((f) => `--- ${f.path} ---\n${f.content}`).join("\n\n")
    : "(none yet)";
  return [
    PHASE_INSTRUCTIONS[phase],
    delimit("brief", JSON.stringify(brief)),
    delimit("plan", JSON.stringify(plan)),
    `EXISTING FILES (do not regenerate unless fixing):\n${delimit("existing_files", existingBlock)}`,
  ].join("\n\n");
}
