"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  BookOpen,
  Layers,
  CheckCircle2,
  Zap,
  Terminal,
  Cpu,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useStore, useHydrated, newProject } from "@/lib/store";
import { sampleProjects } from "@/lib/samples";
import { Footer } from "@/components/layout/Footer";

const EXAMPLE_PROMPTS = [
  "A campus events app where students can browse, save and get reminders for events.",
  "A daily habit tracker with visual streak momentum and offline AsyncStorage stats.",
  "An expense splitter for roommates: track shared costs, calculate balances, and settle up.",
  "A minimalist pomodoro focus timer with ambient soundscapes and session logs.",
];

export default function HomePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const upsert = useStore((s) => s.upsert);
  const rawProjects = useStore((s) => s.projects);
  const projects = React.useMemo(() => Object.values(rawProjects), [rawProjects]);

  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!idea.trim() || loading) return;

    setLoading(true);
    const p = newProject(idea.trim());
    upsert(p);
    router.push(`/project/${p.id}`);
  };

  const handleSelectPrompt = (prompt: string) => {
    setIdea(prompt);
  };

  return (
    <div className="flex-1 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background Architectural Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] hero-glow pointer-events-none" />

      {/* Hero Section */}
      <div className="relative pt-20 pb-14 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center space-y-6">
        {/* Floating Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface/80 backdrop-blur-md text-xs text-muted shadow-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-bold text-fg tracking-wide">Valor AI</span>
          <span className="text-subtle">·</span>
          <span>Next-Generation App Development Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-fg max-w-3xl mx-auto leading-[1.12]">
          From plain English to a <span className="text-gradient">native mobile app</span> — with every line explained.
        </h1>

        <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
          Generating code is commodity. Valor AppStudio guides you through Understand → Plan → Build → Explain → Learn with interactive Expo phone simulations.
        </p>

        {/* Main Prompt Box */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mt-6 card p-3 bg-surface/95 border-line shadow-2xl relative focus-within:border-accent-line focus-within:ring-2 focus-within:ring-accent/15 transition-all"
        >
          <div className="relative">
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value.slice(0, 1000))}
              placeholder="Describe your mobile app concept (e.g., A campus events hub with notifications, RSVP tracking, and category filters)..."
              className="w-full bg-transparent text-sm sm:text-base text-fg placeholder:text-subtle p-3 outline-none resize-none"
            />

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between px-3 pt-2 border-t border-line/60 text-xs">
              <span className="text-subtle text-[11px] font-mono">
                {idea.length} / 1,000 characters
              </span>

              <button
                type="submit"
                disabled={!idea.trim() || loading}
                className="btn-primary px-5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
              >
                <span>Launch Pipeline</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </form>

        {/* Prompt Inspiration Chips */}
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-subtle font-medium">Try an archetype:</span>
          {EXAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              className="chip text-[11px] hover:border-accent-line"
            >
              <Sparkles size={11} className="text-accent" />
              <span className="truncate max-w-[210px]">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instant Demo Benchmarks */}
      <div className="max-w-5xl mx-auto px-4 py-8 w-full border-t border-line/60 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} className="text-accent" />
              <span>Verified Benchmark Projects</span>
            </h3>
            <p className="text-xs text-muted">Explore pre-compiled Expo apps with complete lesson curricula</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleProjects.map((sample) => (
            <Link
              key={sample.id}
              href={`/project/${sample.id}`}
              className="card card-hover p-4 flex items-center justify-between border-line group relative overflow-hidden"
            >
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <h4 className="text-xs font-bold text-fg group-hover:text-accent transition-colors">
                    {sample.title}
                  </h4>
                </div>
                <p className="text-xs text-muted line-clamp-1">{sample.idea}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-subtle">
                  <span>6 Stages Complete</span>
                  <span>·</span>
                  <span>{sample.files.length} Expo React Native Files</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-surface-2 border border-line grid place-items-center group-hover:border-accent-line text-muted group-hover:text-accent shrink-0 z-10 transition-colors">
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Workspace Inventory */}
      {hydrated && projects.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-8 w-full border-t border-line/60 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider">
              Local Workspace Inventory ({projects.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="card card-hover p-3.5 space-y-1.5 border-line"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-fg truncate">{p.title}</h4>
                  <span className="text-[10px] text-accent font-mono">
                    {p.files.length > 0 ? `${p.files.length} files` : "Draft"}
                  </span>
                </div>
                <p className="text-[11px] text-muted line-clamp-2">{p.idea}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Pillars */}
      <div className="max-w-5xl mx-auto px-4 py-12 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-line/60 relative z-10">
        <div className="card p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-line/40 grid place-items-center text-accent">
            <Shield size={18} />
          </div>
          <h4 className="text-xs font-bold text-fg">Human-In-The-Loop Control</h4>
          <p className="text-xs text-muted leading-relaxed">
            Confirm the inferred product definition and toggle MoSCoW features before a single line of code is produced.
          </p>
        </div>

        <div className="card p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-line/40 grid place-items-center text-accent">
            <Cpu size={18} />
          </div>
          <h4 className="text-xs font-bold text-fg">Multi-Phase Generation</h4>
          <p className="text-xs text-muted leading-relaxed">
            Staged compiler flow (Skeleton → Screens → Polish) enforces strict dependency allow-lists and local state persistence.
          </p>
        </div>

        <div className="card p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-line/40 grid place-items-center text-accent">
            <BookOpen size={18} />
          </div>
          <h4 className="text-xs font-bold text-fg">Builder + Personal Tutor</h4>
          <p className="text-xs text-muted leading-relaxed">
            Deconstruct every plan decision and line range, offering an app-specific rebuild curriculum and knowledge check quiz.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
