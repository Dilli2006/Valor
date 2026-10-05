import {
  campusIdea,
  campusUnderstanding,
  campusBrief,
  campusPlan,
  campusFiles,
  campusExplain,
  campusLearn,
} from "./campus";
import type { Project } from "@/lib/schemas";

export { campusIdea, campusUnderstanding, campusBrief, campusPlan, campusFiles, campusExplain, campusLearn };

export const sampleCampusProject: Project = {
  id: "sample-campus-events",
  title: "CampusPulse — Campus Events",
  createdAt: 1728140400000,
  updatedAt: 1728140400000,
  idea: campusIdea,
  isSample: true,
  understanding: campusUnderstanding,
  brief: campusBrief,
  plan: campusPlan,
  disabledFeatureIds: [],
  files: campusFiles,
  explainOverview: campusExplain,
  explanations: [],
  learningPath: campusLearn,
  chat: [
    {
      id: "c1",
      role: "assistant",
      content:
        "Welcome to **CampusPulse**! I can answer questions about the React Native navigation structure, how `useApp()` manages state with AsyncStorage, or how `EventCard` renders. What would you like to explore?",
      createdAt: 1728140400000,
    },
  ],
  refineHistory: [],
  stageStatus: {
    understand: "done",
    plan: "done",
    build: "done",
    explain: "done",
    learn: "done",
    preview: "done",
  },
};

export const sampleHabitProject: Project = {
  id: "sample-habit-tracker",
  title: "Streakly — Habit Tracker",
  createdAt: 1728140400000 - 3600000,
  updatedAt: 1728140400000 - 3600000,
  idea: "A daily habit tracker that keeps you on a streak with progress stats and check-ins.",
  isSample: true,
  understanding: {
    refused: false,
    refusalReason: "",
    appName: "Streakly",
    summary: "Build momentum with daily check-ins, streak counts and progress visuals.",
    targetUsers: "Students and builders creating reliable daily habits",
    problem: "People give up on routines when their daily consistency isn't tracked visually.",
    platform: "Cross-platform mobile (iOS + Android) via Expo",
    features: ["Add habits with icons", "Daily check-in toggle", "Current & best streaks", "Weekly progress bar"],
    assumptions: ["Single user on-device", "Offline first with AsyncStorage"],
    risks: ["Users churn if checking in feels tedious"],
    questions: [
      {
        id: "q1",
        question: "Should habits repeat daily or have custom schedules?",
        why: "Influences storage schema and completion logic.",
        suggestions: ["Daily only", "Specific days of week", "Custom frequency"],
      },
    ],
  },
  brief: {
    appName: "Streakly",
    summary: "Build momentum with daily check-ins, streak counts and progress visuals.",
    targetUsers: "Students and builders creating reliable daily habits",
    problem: "People give up on routines when their daily consistency isn't tracked visually.",
    platform: "Cross-platform mobile (iOS + Android) via Expo",
    features: ["Add habits with icons", "Daily check-in toggle", "Current & best streaks", "Weekly progress bar"],
    assumptions: ["Single user on-device", "Offline first with AsyncStorage"],
    answeredQuestions: [{ question: "Schedule type?", answer: "Daily only" }],
  },
  plan: {
    scope: "An offline-first habit builder with daily check-in buttons and streak analytics.",
    features: [
      { id: "hf1", name: "Habit List & Check-in", description: "Quick tap check-ins", priority: "must", effort: "S", screenIds: ["hs1"] },
      { id: "hf2", name: "Habit Creation", description: "Add title and category icon", priority: "must", effort: "S", screenIds: ["hs2"] },
      { id: "hf3", name: "Streak Analytics", description: "View best streaks and completion %", priority: "should", effort: "M", screenIds: ["hs3"] },
    ],
    screens: [
      { id: "hs1", name: "TodayScreen", title: "Today's Habits", purpose: "Daily check-off", components: ["StreakHeader", "HabitList"], featureIds: ["hf1"] },
      { id: "hs2", name: "NewHabitScreen", title: "New Habit", purpose: "Create habit modal", components: ["HabitForm", "IconSelector"], featureIds: ["hf2"] },
      { id: "hs3", name: "StatsScreen", title: "Analytics", purpose: "Streak performance overview", components: ["StreakChart", "MetricCards"], featureIds: ["hf3"] },
    ],
    navigation: {
      type: "tabs+stack",
      tabs: ["hs1", "hs3"],
      edges: [{ from: "hs1", to: "hs2", label: "Tap + floating button" }],
    },
    entities: [
      { name: "Habit", fields: [{ name: "id", type: "string" }, { name: "name", type: "string" }, { name: "history", type: "string[]" }], relationships: [] },
    ],
    stack: [
      { choice: "Expo + React Native", reason: "Frictionless cross-platform compilation" },
      { choice: "AsyncStorage", reason: "Local storage for habit streak history" },
      { choice: "React Context", reason: "Global habit list state management" },
    ],
    buildSteps: [
      { id: "step-1", title: "Skeleton & Tokens", description: "App.js and theme.js" },
      { id: "step-2", title: "Habit Context", description: "State reducer for toggle and add" },
      { id: "step-3", title: "Today Screen", description: "Interactive check-ins" },
      { id: "step-4", title: "Analytics Screen", description: "Streak math and summary cards" },
    ],
    outOfScope: ["Push reminders", "Cloud account sync", "Social habit challenges"],
  },
  disabledFeatureIds: [],
  files: campusFiles, // fallback demo files
  explainOverview: campusExplain,
  explanations: [],
  learningPath: campusLearn,
  chat: [],
  refineHistory: [],
  stageStatus: {
    understand: "done",
    plan: "done",
    build: "done",
    explain: "done",
    learn: "done",
    preview: "done",
  },
};

export const sampleProjects: Project[] = [sampleCampusProject, sampleHabitProject];
