"use client";
import React, { useState } from "react";
import { Sparkles, Check, Edit3, AlertCircle, ArrowRight, Loader2, HelpCircle } from "lucide-react";
import type { Brief, Understanding, StageStatus } from "@/lib/schemas";
import { callStage, StageError } from "@/lib/client/stream";

interface UnderstandStageProps {
  idea: string;
  initialUnderstanding?: Understanding;
  initialBrief?: Brief;
  onConfirm: (brief: Brief, understanding: Understanding) => void;
  status: StageStatus;
}

export function UnderstandStage({
  idea,
  initialUnderstanding,
  initialBrief,
  onConfirm,
  status,
}: UnderstandStageProps) {
  const [understanding, setUnderstanding] = useState<Understanding | undefined>(initialUnderstanding);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form edit state for editable fields
  const [appName, setAppName] = useState(initialBrief?.appName || initialUnderstanding?.appName || "");
  const [summary, setSummary] = useState(initialBrief?.summary || initialUnderstanding?.summary || "");
  const [targetUsers, setTargetUsers] = useState(initialBrief?.targetUsers || initialUnderstanding?.targetUsers || "");
  const [problem, setProblem] = useState(initialBrief?.problem || initialUnderstanding?.problem || "");
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (initialBrief?.answeredQuestions) {
      initialBrief.answeredQuestions.forEach((q) => {
        map[q.question] = q.answer;
      });
    } else if (initialUnderstanding?.questions) {
      initialUnderstanding.questions.forEach((q) => {
        map[q.question] = q.suggestions[0] || "";
      });
    }
    return map;
  });

  const runUnderstand = async () => {
    setLoading(true);
    setError(null);
    setProgressMsg("Analyzing app idea...");

    try {
      const res = await callStage<Understanding>(
        "/api/understand",
        { idea },
        {
          onProgress: (m) => setProgressMsg(m),
        }
      );

      const u = res.data;
      setUnderstanding(u);
      setAppName(u.appName);
      setSummary(u.summary);
      setTargetUsers(u.targetUsers);
      setProblem(u.problem);

      // Pre-populate default answers
      const defaultAnswers: Record<string, string> = {};
      u.questions.forEach((q) => {
        defaultAnswers[q.question] = q.suggestions[0] || "";
      });
      setAnswers(defaultAnswers);
    } catch (err: any) {
      setError(err?.message || "Failed to analyze idea. Try again.");
    } finally {
      setLoading(false);
      setProgressMsg("");
    }
  };

  const handleSelectSuggestion = (question: string, suggestion: string) => {
    setAnswers((prev) => ({ ...prev, [question]: suggestion }));
  };

  const handleConfirm = () => {
    if (!understanding) return;

    const brief: Brief = {
      appName: appName.trim() || understanding.appName,
      summary: summary.trim() || understanding.summary,
      targetUsers: targetUsers.trim() || understanding.targetUsers,
      problem: problem.trim() || understanding.problem,
      platform: understanding.platform,
      features: understanding.features,
      assumptions: understanding.assumptions,
      answeredQuestions: Object.entries(answers).map(([question, answer]) => ({
        question,
        answer,
      })),
    };

    onConfirm(brief, understanding);
  };

  if (!understanding && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent-line grid place-items-center mx-auto text-accent">
          <Sparkles size={24} />
        </div>
        <h2 className="text-xl font-bold text-fg">Step 1: Understand Your Idea</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          AppStudio will analyze "{idea.slice(0, 70)}..." to establish user needs, assumptions, and clarify edge cases before planning.
        </p>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
        <button onClick={runUnderstand} className="btn-primary px-6 py-2.5">
          <Sparkles size={16} />
          <span>Analyze & Interpret Idea</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-accent mx-auto" />
        <h3 className="font-bold text-fg text-base">Deconstructing Product Concept...</h3>
        <p className="text-xs text-muted">{progressMsg || "Inferring user workflows and mobile UI requirements"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Stage 1: Understand</span>
          <h2 className="text-xl font-bold text-fg mt-0.5">Confirm Product Understanding</h2>
        </div>
        <button
          onClick={runUnderstand}
          className="btn-ghost text-xs px-3 py-1.5"
          title="Re-run analysis"
        >
          Re-interpret
        </button>
      </div>

      {/* Editable Brief Fields */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-fg">
          <Edit3 size={14} className="text-accent" />
          <span>Core Product Summary (Editable)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
              App Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
              Target Users
            </label>
            <input
              type="text"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              className="input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
            One-line Summary
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="input text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
            Core Problem Solved
          </label>
          <textarea
            rows={2}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="input text-xs"
          />
        </div>
      </div>

      {/* Inferred Features & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <h4 className="text-xs font-bold text-fg uppercase tracking-wider">Inferred MVP Features</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            {understanding?.features?.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4 space-y-2">
          <h4 className="text-xs font-bold text-fg uppercase tracking-wider">Key Assumptions & Scope</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            {understanding?.assumptions?.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-subtle" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clarifying Questions */}
      {understanding?.questions && understanding.questions.length > 0 && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-fg">
            <HelpCircle size={14} className="text-accent" />
            <span>Clarifying Questions (Select or customize)</span>
          </div>

          <div className="space-y-4">
            {understanding.questions.map((q, idx) => {
              const currentAns = answers[q.question] || "";
              return (
                <div key={q.id || idx} className="p-3 bg-surface-2 rounded-xl border border-line space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-fg">{q.question}</p>
                    <span className="text-[10px] text-subtle shrink-0">Affects build</span>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {q.suggestions.map((sug, si) => {
                      const isSelected = currentAns === sug;
                      return (
                        <button
                          key={si}
                          type="button"
                          onClick={() => handleSelectSuggestion(q.question, sug)}
                          className={`chip text-[11px] ${isSelected ? "chip-active font-semibold" : ""}`}
                        >
                          {isSelected && <Check size={11} />}
                          <span>{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Action */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
        <button
          onClick={handleConfirm}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-accent/20"
        >
          <span>Confirm Understanding & Proceed to Plan</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
