"use client";
import React from "react";
import { Check, Loader2, Sparkles, Lock, Circle } from "lucide-react";
import type { Stage, StageStatus } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface StageStepperProps {
  currentStage: Stage;
  stageStatus: Record<Stage, StageStatus>;
  onSelectStage: (stage: Stage) => void;
}

const STAGE_LABELS: Record<Stage, { title: string; desc: string }> = {
  understand: { title: "1. Understand", desc: "Clarify & confirm idea" },
  plan: { title: "2. Plan", desc: "MVP features & screens" },
  build: { title: "3. Build", desc: "Generate Expo project" },
  explain: { title: "4. Explain", desc: "Plain-language walkthrough" },
  learn: { title: "5. Learn", desc: "Rebuild path & quiz" },
  preview: { title: "6. Preview", desc: "Interactive phone view" },
};

export function StageStepper({ currentStage, stageStatus, onSelectStage }: StageStepperProps) {
  const stages: Stage[] = ["understand", "plan", "build", "explain", "learn", "preview"];

  return (
    <div className="flex flex-col gap-1 w-full select-none">
      <div className="px-3 py-2 text-[10.5px] uppercase font-bold text-subtle tracking-wider">
        Pipeline Stages
      </div>

      <div className="space-y-1">
        {stages.map((st) => {
          const status = stageStatus[st];
          const isCurrent = currentStage === st;
          const isLocked = status === "locked";
          const isDone = status === "done";
          const isRunning = status === "running";

          return (
            <button
              key={st}
              disabled={isLocked}
              onClick={() => onSelectStage(st)}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all relative",
                isCurrent
                  ? "bg-accent-soft border border-accent-line shadow-sm text-fg"
                  : isLocked
                  ? "opacity-40 cursor-not-allowed hover:bg-transparent text-subtle"
                  : "hover:bg-surface-2 text-muted hover:text-fg"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg grid place-items-center text-xs shrink-0 font-bold",
                    isDone
                      ? "bg-success/20 text-success"
                      : isRunning
                      ? "bg-accent/20 text-accent animate-spin"
                      : isCurrent
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-subtle"
                  )}
                >
                  {isDone ? (
                    <Check size={13} strokeWidth={3} />
                  ) : isRunning ? (
                    <Loader2 size={13} />
                  ) : isLocked ? (
                    <Lock size={12} />
                  ) : (
                    <Circle size={10} />
                  )}
                </div>

                <div className="truncate">
                  <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                    <span>{STAGE_LABELS[st].title}</span>
                  </div>
                  <div className="text-[10px] text-subtle truncate mt-0.5">
                    {STAGE_LABELS[st].desc}
                  </div>
                </div>
              </div>

              {isCurrent && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
