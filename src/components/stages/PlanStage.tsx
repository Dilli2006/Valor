"use client";
import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, ToggleLeft, ToggleRight, Layers, Cpu, Compass, Loader2 } from "lucide-react";
import type { Brief, Plan, PlanFeature, StageStatus } from "@/lib/schemas";
import { callStage } from "@/lib/client/stream";
import { traceability } from "@/lib/validate/build";

interface PlanStageProps {
  brief: Brief;
  initialPlan?: Plan;
  disabledFeatureIds: string[];
  onToggleFeature: (featureId: string) => void;
  onApprove: (plan: Plan) => void;
  status: StageStatus;
}

export function PlanStage({
  brief,
  initialPlan,
  disabledFeatureIds,
  onToggleFeature,
  onApprove,
  status,
}: PlanStageProps) {
  const [plan, setPlan] = useState<Plan | undefined>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const runPlan = async (removed: string[] = []) => {
    setLoading(true);
    setError(null);
    setProgressMsg("Designing MVP architecture...");

    try {
      const res = await callStage<Plan>(
        "/api/plan",
        {
          brief,
          removedFeatures: removed,
        },
        {
          onProgress: (m) => setProgressMsg(m),
        }
      );
      setPlan(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to generate plan. Please retry.");
    } finally {
      setLoading(false);
      setProgressMsg("");
    }
  };

  if (!plan && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent-line grid place-items-center mx-auto text-accent">
          <Layers size={24} />
        </div>
        <h2 className="text-xl font-bold text-fg">Step 2: Plan the MVP Architecture</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Translate "{brief.appName}" into a concrete specification: MoSCoW features, screens, navigation graph, and technical stack rationale.
        </p>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
        <button onClick={() => runPlan()} className="btn-primary px-6 py-2.5">
          <Sparkles size={16} />
          <span>Generate MVP Architecture Plan</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-accent mx-auto" />
        <h3 className="font-bold text-fg text-base">Synthesizing Technical Architecture...</h3>
        <p className="text-xs text-muted">{progressMsg || "Structuring screen flows and data entities"}</p>
      </div>
    );
  }

  const trace = plan ? traceability(plan, disabledFeatureIds) : { ok: true, orphanFeatures: [], orphanScreens: [] };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Stage 2: Plan</span>
          <h2 className="text-xl font-bold text-fg mt-0.5">Approved Architecture Plan</h2>
        </div>
        <button
          onClick={() => runPlan(disabledFeatureIds)}
          className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
          title="Regenerate plan taking toggled features into account"
        >
          <Sparkles size={12} className="text-accent" />
          <span>Regenerate Plan</span>
        </button>
      </div>

      {/* Scope Statement */}
      <div className="card p-4 border-l-4 border-l-accent">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">MVP Scope</span>
        <p className="text-xs text-fg mt-1 leading-relaxed">{plan?.scope}</p>
      </div>

      {/* MoSCoW Feature Toggles (P1 FR-06) */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ToggleRight size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider">Features & Effort (Toggle on/off)</h3>
          </div>
          <span className="text-[11px] text-muted">Click to toggle for rebuild</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {plan?.features?.map((ft) => {
            const isOff = disabledFeatureIds.includes(ft.id);
            return (
              <div
                key={ft.id}
                onClick={() => onToggleFeature(ft.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isOff
                    ? "bg-surface/40 border-line/40 opacity-50"
                    : "bg-surface-2 border-line hover:border-accent-line"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        ft.priority === "must"
                          ? "bg-red-500/20 text-red-400"
                          : ft.priority === "should"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {ft.priority}
                    </span>
                    <span className="text-xs font-bold text-fg">{ft.name}</span>
                  </div>
                  <p className="text-[11px] text-muted leading-tight">{ft.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-subtle">Effort {ft.effort}</span>
                  <div className={`w-2 h-2 rounded-full ${isOff ? "bg-subtle" : "bg-accent"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Flow Diagram */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-accent" />
          <h3 className="text-xs font-bold text-fg uppercase tracking-wider">Screens & Navigation Map</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plan?.screens?.map((scr) => (
            <div key={scr.id} className="p-3 bg-surface-2 rounded-xl border border-line flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-accent">{scr.id}</span>
                <h4 className="text-xs font-bold text-fg mt-0.5">{scr.name}</h4>
                <p className="text-[11px] text-muted mt-1 leading-snug">{scr.purpose}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-line/40">
                <span className="text-[9px] uppercase tracking-wider text-subtle block mb-1">Components</span>
                <div className="flex flex-wrap gap-1">
                  {scr.components.map((c, i) => (
                    <span key={i} className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-muted font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation edges */}
        {plan?.navigation?.edges && plan.navigation.edges.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-subtle tracking-wider block mb-1.5">
              Screen Transitions ({plan.navigation.type})
            </span>
            <div className="flex flex-wrap gap-2">
              {plan.navigation.edges.map((e, idx) => (
                <div key={idx} className="p-2 bg-surface rounded-lg border border-line text-[11px] flex items-center gap-2">
                  <span className="font-mono text-accent">{e.from}</span>
                  <ArrowRight size={11} className="text-subtle" />
                  <span className="font-mono text-accent">{e.to}</span>
                  <span className="text-muted text-[10px]">({e.label})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Technology Stack & Rationale */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-accent" />
          <h3 className="text-xs font-bold text-fg uppercase tracking-wider">Tech Stack & Rationale</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan?.stack?.map((st, i) => (
            <div key={i} className="p-3 bg-surface-2 rounded-xl border border-line space-y-1">
              <span className="text-xs font-bold text-accent">{st.choice}</span>
              <p className="text-xs text-muted leading-relaxed">{st.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation & Traceability */}
      <div className="flex items-center justify-between pt-4 border-t border-line">
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${trace.ok ? "bg-success" : "bg-warning"}`} />
          <span className="text-muted">
            {trace.ok ? "Traceability check passed: 0 orphan screens or features" : "Traceability warning: some screens/features unlinked"}
          </span>
        </div>

        <button
          onClick={() => plan && onApprove(plan)}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-accent/20"
        >
          <span>Approve Plan & Proceed to Build</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
