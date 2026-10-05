"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { Project, Stage, StageStatus } from "@/lib/schemas";

/**
 * Repository interface (PRD §13): v1 is browser-local via Zustand persist.
 * Swap `storage` for a remote adapter later without touching components.
 */
export interface ProjectRepository {
  list(): Project[];
  get(id: string): Project | undefined;
  save(p: Project): void;
  remove(id: string): void;
}

export const initialStageStatus = (): Record<Stage, StageStatus> => ({
  understand: "ready",
  plan: "locked",
  build: "locked",
  explain: "locked",
  learn: "locked",
  preview: "locked",
});

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function newProject(idea: string): Project {
  const now = Date.now();
  return {
    id: uid(),
    title: idea.slice(0, 48) || "Untitled app",
    createdAt: now,
    updatedAt: now,
    idea,
    disabledFeatureIds: [],
    files: [],
    explanations: [],
    chat: [],
    refineHistory: [],
    stageStatus: initialStageStatus(),
  };
}

type Settings = { theme: "dark" | "light"; level: "beginner" | "intermediate" };

type State = {
  projects: Record<string, Project>;
  settings: Settings;
  upsert: (p: Project) => void;
  update: (id: string, fn: (p: Project) => Partial<Project>) => void;
  setStage: (id: string, stage: Stage, status: StageStatus) => void;
  remove: (id: string) => void;
  setSettings: (s: Partial<Settings>) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      projects: {},
      settings: { theme: "dark", level: "beginner" },
      upsert: (p) => set((s) => ({ projects: { ...s.projects, [p.id]: { ...p, updatedAt: Date.now() } } })),
      update: (id, fn) =>
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          return { projects: { ...s.projects, [id]: { ...p, ...fn(p), updatedAt: Date.now() } } };
        }),
      setStage: (id, stage, status) =>
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          return { projects: { ...s.projects, [id]: { ...p, stageStatus: { ...p.stageStatus, [stage]: status }, updatedAt: Date.now() } } };
        }),
      remove: (id) =>
        set((s) => {
          const next = { ...s.projects };
          delete next[id];
          return { projects: next };
        }),
      setSettings: (v) => set((s) => ({ settings: { ...s.settings, ...v } })),
    }),
    {
      name: "lunor-appstudio",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Never persist transient "running" status — it would be stuck after a reload.
      partialize: (s) => ({
        settings: s.settings,
        projects: Object.fromEntries(
          Object.entries(s.projects).map(([k, p]) => [
            k,
            { ...p, stageStatus: Object.fromEntries(Object.entries(p.stageStatus).map(([st, v]) => [st, v === "running" ? "ready" : v])) as Record<Stage, StageStatus> },
          ]),
        ),
      }),
    },
  ),
);

export const localRepository: ProjectRepository = {
  list: () => Object.values(useStore.getState().projects).sort((a, b) => b.updatedAt - a.updatedAt),
  get: (id) => useStore.getState().projects[id],
  save: (p) => useStore.getState().upsert(p),
  remove: (id) => useStore.getState().remove(id),
};

/** True once persisted state has been rehydrated on the client (avoids SSR mismatch). */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    if (useStore.persist.hasHydrated()) setH(true);
    const unsub = useStore.persist.onFinishHydration(() => setH(true));
    return unsub;
  }, []);
  return h;
}
