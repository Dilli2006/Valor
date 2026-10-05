/**
 * Schema-first design (PRD §13, §23.2).
 * Every stage output is defined here as a Zod schema; TypeScript types are inferred.
 * NOTE: array length limits are described (not enforced with .min/.max) because some
 * providers reject those JSON-schema keywords. Limits are enforced in post-processing.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Understand                                                          */
/* ------------------------------------------------------------------ */
export const ClarifyingQuestionSchema = z.object({
  id: z.string().describe("short id like q1"),
  question: z.string(),
  why: z.string().describe("why this matters for the build, one sentence"),
  suggestions: z.array(z.string()).describe("2 to 3 suggested answers, first is the recommended default"),
});

export const UnderstandingSchema = z.object({
  refused: z.boolean().describe("true only if the idea is harmful (malware, surveillance, fraud, harassment)"),
  refusalReason: z.string().describe("empty string unless refused"),
  appName: z.string(),
  summary: z.string().describe("one-line summary"),
  targetUsers: z.string(),
  problem: z.string(),
  platform: z.string().describe("e.g. Cross-platform mobile (iOS + Android) via Expo"),
  features: z.array(z.string()).describe("key features inferred, 3 to 7"),
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
  questions: z.array(ClarifyingQuestionSchema).describe("0 to 4 clarifying questions; vague ideas get more"),
});
export type Understanding = z.infer<typeof UnderstandingSchema>;
export type ClarifyingQuestion = z.infer<typeof ClarifyingQuestionSchema>;

export const BriefSchema = z.object({
  appName: z.string(),
  summary: z.string(),
  targetUsers: z.string(),
  problem: z.string(),
  platform: z.string(),
  features: z.array(z.string()),
  assumptions: z.array(z.string()),
  answeredQuestions: z.array(z.object({ question: z.string(), answer: z.string() })),
});
export type Brief = z.infer<typeof BriefSchema>;

/* ------------------------------------------------------------------ */
/* Plan                                                                */
/* ------------------------------------------------------------------ */
export const PlanFeatureSchema = z.object({
  id: z.string().describe("f1, f2 ..."),
  name: z.string(),
  description: z.string(),
  priority: z.enum(["must", "should", "could"]),
  effort: z.enum(["S", "M", "L"]),
  screenIds: z.array(z.string()),
});
export const PlanScreenSchema = z.object({
  id: z.string().describe("s1, s2 ..."),
  name: z.string().describe("PascalCase screen name, e.g. EventListScreen"),
  title: z.string().describe("human title shown in the header, e.g. Events"),
  purpose: z.string(),
  components: z.array(z.string()).describe("key UI components, e.g. SearchBar, EventCard list, SaveButton"),
  featureIds: z.array(z.string()),
});
export const PlanSchema = z.object({
  scope: z.string().describe("MVP scope statement, 1-2 sentences"),
  features: z.array(PlanFeatureSchema),
  screens: z.array(PlanScreenSchema).describe("3 to 6 screens"),
  navigation: z.object({
    type: z.enum(["stack", "tabs", "tabs+stack"]),
    tabs: z.array(z.string()).describe("screen ids shown as bottom tabs (empty if stack only)"),
    edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string() })),
  }),
  entities: z.array(
    z.object({
      name: z.string(),
      fields: z.array(z.object({ name: z.string(), type: z.string() })),
      relationships: z.array(z.string()),
    }),
  ),
  stack: z.array(z.object({ choice: z.string(), reason: z.string() })),
  buildSteps: z.array(z.object({ id: z.string(), title: z.string(), description: z.string() })).describe("6 to 10 ordered steps"),
  outOfScope: z.array(z.string()),
});
export type Plan = z.infer<typeof PlanSchema>;
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;
export type PlanScreen = z.infer<typeof PlanScreenSchema>;

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */
export const GeneratedFileSchema = z.object({
  path: z.string().describe("relative path, e.g. App.js or src/screens/HomeScreen.js"),
  language: z.string().describe("javascript | json | markdown"),
  content: z.string(),
  purpose: z.string().describe("one sentence"),
  stepId: z.string().describe("id of the plan build step this file belongs to"),
});
export const BuildPhaseSchema = z.object({
  files: z.array(GeneratedFileSchema),
  notes: z.string(),
});
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type BuildPhaseOutput = z.infer<typeof BuildPhaseSchema>;
export type BuildPhase = "skeleton" | "screens" | "polish";

/* ------------------------------------------------------------------ */
/* Explain                                                             */
/* ------------------------------------------------------------------ */
export const ExplainOverviewSchema = z.object({
  fileSummaries: z.array(z.object({ path: z.string(), summary: z.string(), keyIdentifiers: z.array(z.string()) })),
  decisions: z.array(
    z.object({ id: z.string(), title: z.string(), planRef: z.string().describe("plan item this relates to"), rationale: z.string() }),
  ),
  dataFlow: z.array(z.object({ step: z.string(), file: z.string(), detail: z.string() })).describe("ordered walkthrough of how data moves"),
});
export type ExplainOverview = z.infer<typeof ExplainOverviewSchema>;

export const ExplanationSchema = z.object({
  title: z.string(),
  text: z.string().describe("plain-language explanation, markdown allowed"),
  references: z.array(z.object({ path: z.string(), lines: z.string(), identifier: z.string() })),
});
export type ExplanationResult = z.infer<typeof ExplanationSchema>;
export type Level = "beginner" | "intermediate";

export type Explanation = {
  id: string;
  targetType: "file" | "range" | "decision";
  targetRef: string;
  level: Level;
  result: ExplanationResult;
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* Learn                                                               */
/* ------------------------------------------------------------------ */
export const LearningPathSchema = z.object({
  concepts: z.array(z.object({ name: z.string(), definition: z.string(), file: z.string(), snippet: z.string() })),
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      goal: z.string(),
      buildStepId: z.string(),
      files: z.array(z.string()),
      steps: z.array(z.string()),
      exercise: z.object({ prompt: z.string(), hints: z.array(z.string()), expectedOutcome: z.string() }),
    }),
  ).describe("5 to 8 lessons in build-step order"),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).describe("exactly 4 options"),
      answerIndex: z.number().describe("0-based index of the correct option"),
      explanation: z.string(),
    }),
  ).describe("exactly 5 questions"),
  nextSteps: z.array(z.object({ title: z.string(), description: z.string(), url: z.string() })),
});
export type LearningPath = z.infer<typeof LearningPathSchema>;

/* ------------------------------------------------------------------ */
/* Refine                                                              */
/* ------------------------------------------------------------------ */
export const RefineSchema = z.object({
  summary: z.string(),
  changes: z.array(
    z.object({
      path: z.string(),
      action: z.enum(["create", "update", "delete"]),
      content: z.string().describe("full new file content (empty for delete)"),
      explanation: z.string(),
    }),
  ),
});
export type RefineResult = z.infer<typeof RefineSchema>;

/* ------------------------------------------------------------------ */
/* Project (persisted)                                                 */
/* ------------------------------------------------------------------ */
export const STAGES = ["understand", "plan", "build", "explain", "learn", "preview"] as const;
export type Stage = (typeof STAGES)[number];
export type StageStatus = "locked" | "ready" | "running" | "done" | "error";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: number };
export type RefineEntry = {
  id: string;
  request: string;
  summary: string;
  diffs: { path: string; action: "create" | "update" | "delete"; before: string; after: string; explanation: string }[];
  createdAt: number;
};

export type Project = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  idea: string;
  isSample?: boolean;
  understanding?: Understanding;
  brief?: Brief;
  plan?: Plan;
  disabledFeatureIds: string[];
  files: GeneratedFile[];
  buildNotes?: string[];
  validation?: ValidationReport;
  explainOverview?: ExplainOverview;
  explanations: Explanation[];
  learningPath?: LearningPath;
  quizResults?: { answers: number[]; score: number; at: number };
  chat: ChatMessage[];
  refineHistory: RefineEntry[];
  stageStatus: Record<Stage, StageStatus>;
};

export type ValidationIssue = { level: "error" | "warning"; path: string; message: string };
export type ValidationReport = { ok: boolean; issues: ValidationIssue[]; checkedAt: number; featureCoverage: { featureId: string; name: string; covered: boolean }[] };

/* ------------------------------------------------------------------ */
/* Stream protocol (server -> client NDJSON)                           */
/* ------------------------------------------------------------------ */
export type ErrorKind = "validation" | "rate_limit" | "model_failure" | "timeout" | "bad_request" | "unsafe" | "no_api_key";
export type StreamEvent<T = unknown> =
  | { type: "progress"; message: string }
  | { type: "partial"; data: unknown }
  | { type: "final"; data: T; meta: { model: string; repaired: boolean; cached: boolean; ms: number } }
  | { type: "error"; error: { kind: ErrorKind; message: string; retryable: boolean } };
