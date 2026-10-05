"use client";
import React, { useState } from "react";
import { GraduationCap, Sparkles, Check, HelpCircle, ArrowRight, Lightbulb, ExternalLink, RefreshCw, Loader2, Award } from "lucide-react";
import type { Brief, GeneratedFile, LearningPath, Plan, StageStatus } from "@/lib/schemas";
import { callStage } from "@/lib/client/stream";

interface LearnStageProps {
  brief: Brief;
  plan: Plan;
  files: GeneratedFile[];
  initialLearningPath?: LearningPath;
  onLearningPathGenerated: (path: LearningPath) => void;
  onProceedToPreview: () => void;
  status: StageStatus;
}

export function LearnStage({
  brief,
  plan,
  files,
  initialLearningPath,
  onLearningPathGenerated,
  onProceedToPreview,
  status,
}: LearnStageProps) {
  const [learningPath, setLearningPath] = useState<LearningPath | undefined>(initialLearningPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"curriculum" | "concepts" | "quiz">("curriculum");

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Exercise hint reveals
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});

  const runLearn = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await callStage<LearningPath>("/api/learn", {
        brief,
        plan,
        files,
      });
      setLearningPath(res.data);
      onLearningPathGenerated(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to generate learning path.");
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (lessonId: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || 0) + 1,
    }));
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateScore = () => {
    if (!learningPath?.quiz) return 0;
    return learningPath.quiz.reduce((acc, q, i) => {
      return acc + (selectedAnswers[i] === q.answerIndex ? 1 : 0);
    }, 0);
  };

  if (!learningPath && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent-line grid place-items-center mx-auto text-accent">
          <GraduationCap size={24} />
        </div>
        <h2 className="text-xl font-bold text-fg">Step 5: Master Your App's Code</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Generate an app-specific curriculum: real lessons matching your build steps, hands-on mini exercises with progressive hints, and a 5-question scored quiz.
        </p>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
        <button onClick={runLearn} className="btn-primary px-6 py-2.5">
          <Sparkles size={16} />
          <span>Generate Personalized Curriculum & Quiz</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-accent mx-auto" />
        <h3 className="font-bold text-fg text-base">Creating Personalized Rebuild Lessons...</h3>
        <p className="text-xs text-muted">Analyzing your app's component tree, state reducer, and quiz items</p>
      </div>
    );
  }

  const score = calculateScore();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Stage 5: Learn</span>
          <h2 className="text-xl font-bold text-fg mt-0.5">Learn to Build this App from Scratch</h2>
        </div>

        <button
          onClick={runLearn}
          className="btn-ghost text-xs px-2.5 py-1.5"
          title="Regenerate curriculum"
        >
          Regenerate Lessons
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 text-xs">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "curriculum" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <GraduationCap size={13} />
          <span>Rebuild Curriculum ({learningPath?.lessons?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("concepts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "concepts" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <Lightbulb size={13} />
          <span>Core Concepts ({learningPath?.concepts?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "quiz" ? "bg-surface-2 text-accent border border-accent-line/40" : "text-muted hover:text-fg"
          }`}
        >
          <HelpCircle size={13} />
          <span>Knowledge Check Quiz (5 Questions)</span>
        </button>
      </div>

      {/* Tab 1: Curriculum / Lessons */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {learningPath?.lessons?.map((les, idx) => {
            const hintCount = revealedHints[les.id] || 0;
            return (
              <div key={les.id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                      Lesson {idx + 1} · {les.buildStepId}
                    </span>
                    <h3 className="text-sm font-bold text-fg mt-0.5">{les.title}</h3>
                    <p className="text-xs text-muted mt-1">{les.goal}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                    {les.files.map((f, fi) => (
                      <span key={fi} className="text-[10px] font-mono bg-surface-2 px-1.5 py-0.5 rounded text-subtle">
                        {f.split("/").pop()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="p-3 bg-surface-2 rounded-xl border border-line space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-subtle tracking-wider block">
                    Step-by-step implementation:
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-xs text-muted">
                    {les.steps.map((st, si) => (
                      <li key={si}>{st}</li>
                    ))}
                  </ol>
                </div>

                {/* Exercise with Progressive Hints */}
                <div className="p-3.5 bg-accent-soft/40 border border-accent-line/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                      <Sparkles size={13} />
                      <span>Hands-On Challenge</span>
                    </div>
                    <button
                      onClick={() => toggleHint(les.id)}
                      disabled={hintCount >= les.exercise.hints.length}
                      className="text-[11px] text-muted hover:text-fg underline disabled:opacity-50"
                    >
                      {hintCount === 0
                        ? "Show hint"
                        : hintCount < les.exercise.hints.length
                        ? `Next hint (${hintCount}/${les.exercise.hints.length})`
                        : "All hints revealed"}
                    </button>
                  </div>

                  <p className="text-xs text-fg leading-relaxed">{les.exercise.prompt}</p>

                  {/* Revealed hints */}
                  {hintCount > 0 && (
                    <div className="pt-2 border-t border-accent-line/20 space-y-1">
                      {les.exercise.hints.slice(0, hintCount).map((h, hi) => (
                        <p key={hi} className="text-[11px] text-muted italic flex items-center gap-1.5">
                          <span>💡</span>
                          <span>{h}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 text-[11px] text-subtle">
                    <span className="font-semibold text-fg/80">Expected outcome: </span>
                    <span>{les.exercise.expectedOutcome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Core Concepts */}
      {activeTab === "concepts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {learningPath?.concepts?.map((con, i) => (
            <div key={i} className="card p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-fg">{con.name}</h4>
                  <span className="text-[10px] font-mono text-accent">{con.file}</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{con.definition}</p>
              </div>

              {con.snippet && (
                <div className="bg-[#0b0b0f] p-2.5 rounded-lg border border-line font-mono text-[11px] text-fg/90 overflow-x-auto">
                  <pre>{con.snippet}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Quiz (FR-13) */}
      {activeTab === "quiz" && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold text-fg">Knowledge Check Quiz</h3>
              <p className="text-xs text-muted">5 questions derived from your app's actual code and architecture</p>
            </div>

            {submittedQuiz && (
              <div className="flex items-center gap-2 bg-accent-soft border border-accent-line px-3 py-1.5 rounded-xl text-accent font-bold text-xs">
                <Award size={14} />
                <span>Score: {score} / 5</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {learningPath?.quiz?.map((q, qIndex) => {
              const selected = selectedAnswers[qIndex];
              const isCorrect = selected === q.answerIndex;

              return (
                <div key={qIndex} className="space-y-3">
                  <h4 className="text-xs font-bold text-fg flex items-start gap-2">
                    <span className="text-accent">{qIndex + 1}.</span>
                    <span>{q.question}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => {
                      const isOptionSelected = selected === optIndex;
                      const isOptionCorrect = optIndex === q.answerIndex;

                      let btnStyle = "bg-surface-2 border-line text-muted hover:text-fg hover:border-line-strong";
                      if (submittedQuiz) {
                        if (isOptionCorrect) {
                          btnStyle = "bg-success/20 border-success/40 text-success font-semibold";
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle = "bg-red-500/20 border-red-500/40 text-red-400";
                        }
                      } else if (isOptionSelected) {
                        btnStyle = "bg-accent-soft border-accent-line text-accent font-medium";
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={submittedQuiz}
                          onClick={() => handleSelectQuizOption(qIndex, optIndex)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                        >
                          <span className="font-mono mr-2 font-bold opacity-60">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="p-3 bg-surface-2 rounded-xl border border-line text-xs text-muted leading-relaxed">
                      <span className="font-semibold text-fg">Explanation: </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            {!submittedQuiz ? (
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(selectedAnswers).length < (learningPath?.quiz?.length || 5)}
                className="btn-primary px-6 py-2.5 text-xs disabled:opacity-40"
              >
                Submit Quiz Answers
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setSubmittedQuiz(false);
                }}
                className="btn-ghost px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>Retry Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Proceed Action */}
      <div className="flex items-center justify-end pt-4 border-t border-line">
        <button
          onClick={onProceedToPreview}
          className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm shadow-lg shadow-accent/20"
        >
          <span>Open Full Interactive Preview</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
