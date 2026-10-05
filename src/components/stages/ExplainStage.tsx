"use client";
import React, { useState } from "react";
import { BookOpen, Sparkles, Code2, ArrowRight, Loader2, GitCommit, FileText, ChevronRight } from "lucide-react";
import type { Brief, ExplainOverview, Explanation, GeneratedFile, Level, Plan, StageStatus } from "@/lib/schemas";
import { callStage } from "@/lib/client/stream";
import { useStore } from "@/lib/store";

interface ExplainStageProps {
  brief: Brief;
  plan: Plan;
  files: GeneratedFile[];
  initialOverview?: ExplainOverview;
  onOverviewGenerated: (overview: ExplainOverview) => void;
  onProceedToLearn: () => void;
  status: StageStatus;
}

export function ExplainStage({
  brief,
  plan,
  files,
  initialOverview,
  onOverviewGenerated,
  onProceedToLearn,
  status,
}: ExplainStageProps) {
  const level = useStore((s) => s.settings.level);
  const setSettings = useStore((s) => s.setSettings);

  const [overview, setOverview] = useState<ExplainOverview | undefined>(initialOverview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"files" | "decisions" | "flow">("files");

  const runExplainOverview = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await callStage<ExplainOverview>("/api/explain", {
        mode: "overview",
        level,
        brief,
        plan,
        files,
      });
      setOverview(res.data);
      onOverviewGenerated(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to generate plain-language explanations.");
    } finally {
      setLoading(false);
    }
  };

  if (!overview && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent-line grid place-items-center mx-auto text-accent">
          <BookOpen size={24} />
        </div>
        <h2 className="text-xl font-bold text-fg">Step 4: Understand the Code You Built</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Generating code is commodity. AppStudio breaks down every file, architectural decision, and data flow step in plain language.
        </p>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
        <button onClick={runExplainOverview} className="btn-primary px-6 py-2.5">
          <Sparkles size={16} />
          <span>Explain Project Files & Architectural Decisions</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-accent mx-auto" />
        <h3 className="font-bold text-fg text-base">Synthesizing Plain-Language Explanations...</h3>
        <p className="text-xs text-muted">Tracing state management flows, file dependencies, and rationale</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Stage 4: Explain</span>
          <h2 className="text-xl font-bold text-fg mt-0.5">Plain-Language Project Explanations</h2>
        </div>

        {/* Level Switcher (FR-11) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-line text-xs">
            <button
              onClick={() => setSettings({ level: "beginner" })}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                level === "beginner" ? "bg-accent text-white" : "text-muted hover:text-fg"
              }`}
            >
              Beginner Friendly
            </button>
            <button
              onClick={() => setSettings({ level: "intermediate" })}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                level === "intermediate" ? "bg-accent text-white" : "text-muted hover:text-fg"
              }`}
            >
              Intermediate
            </button>
          </div>

          <button
            onClick={runExplainOverview}
            className="btn-ghost text-xs px-2.5 py-1.5"
            title="Refresh explanations"
          >
            Re-explain
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-line pb-2 text-xs">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "files" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <FileText size={13} />
          <span>File Summaries ({overview?.fileSummaries?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("decisions")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "decisions" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <GitCommit size={13} />
          <span>Architectural Decisions ({overview?.decisions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("flow")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "flow" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <Code2 size={13} />
          <span>Data Flow Walkthrough ({overview?.dataFlow?.length || 0})</span>
        </button>
      </div>

      {/* Tab: File Summaries */}
      {activeTab === "files" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {overview?.fileSummaries?.map((fs) => (
            <div key={fs.path} className="card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-accent font-semibold">{fs.path}</span>
                <p className="text-xs text-muted mt-1 leading-relaxed">{fs.summary}</p>
              </div>

              {fs.keyIdentifiers && fs.keyIdentifiers.length > 0 && (
                <div className="pt-2 border-t border-line/40 flex flex-wrap gap-1">
                  {fs.keyIdentifiers.map((id, i) => (
                    <span key={i} className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded font-mono text-fg/80">
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Decisions */}
      {activeTab === "decisions" && (
        <div className="space-y-3">
          {overview?.decisions?.map((dec) => (
            <div key={dec.id} className="card p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-fg">{dec.title}</h4>
                <span className="text-[10px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                  {dec.planRef}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{dec.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Data Flow Walkthrough */}
      {activeTab === "flow" && (
        <div className="card p-5 space-y-4">
          <div className="space-y-3">
            {overview?.dataFlow?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-accent-soft border border-accent-line text-accent text-xs font-bold grid place-items-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-fg">{step.step}</span>
                    <span className="text-[10px] font-mono text-subtle">in {step.file}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed Action */}
      <div className="flex items-center justify-end pt-4 border-t border-line">
        <button
          onClick={onProceedToLearn}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-accent/20"
        >
          <span>Continue to Personalized Learning Path</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
