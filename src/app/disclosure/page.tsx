"use client";
import React from "react";
import { ShieldCheck, Cpu, Code2, Layers, BookOpen, ExternalLink, Terminal, Sparkles } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export default function DisclosurePage() {
  return (
    <div className="flex-1 flex flex-col justify-between select-none">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface-2 text-xs text-muted mb-3">
            <ShieldCheck size={14} className="text-accent" />
            <span>Integrity & Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-fg">Valor AI Tools & Technologies Disclosure</h1>
          <p className="text-sm text-muted mt-2">
            In accordance with PRD Section 20, this document itemizes all AI foundation models, orchestration engines, and software dependencies powering Valor AppStudio.
          </p>
        </div>

        {/* Section 1: Foundation Models & AI Architecture */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-fg flex items-center gap-2">
            <Cpu size={16} className="text-accent" />
            <span>1. Foundation Models & Orchestration Architecture</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-1">
              <span className="font-bold text-accent">Google Gemini API (Primary Engine)</span>
              <p className="text-muted leading-relaxed">
                Valor AppStudio harnesses <code>gemini-2.5-flash</code> as its primary intelligence engine. Generates structured JSON outputs for product understanding, architecture plans, Expo source code, plain-language explanations, and rebuild curricula.
              </p>
            </div>
            <div className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-1">
              <span className="font-bold text-accent">Vercel AI SDK Core (Streaming & Schema Repair)</span>
              <p className="text-muted leading-relaxed">
                Utilizes <code>ai</code> and <code>@ai-sdk/google</code> for NDJSON object streaming, typed schema validation via Zod, and single-pass automatic repair calls when model output malforms.
              </p>
            </div>
            <div className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-1">
              <span className="font-bold text-accent">Client-Side Project Engine</span>
              <p className="text-muted leading-relaxed">
                Stores state locally in browser storage via Zustand persist. Zero user data is persisted server-side. Export bundles are assembled in-memory using <code>JSZip</code>.
              </p>
            </div>
            <div className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-1">
              <span className="font-bold text-accent">Sandboxed Code Preview</span>
              <p className="text-muted leading-relaxed">
                Renders interactive components in an iPhone mockup frame and bridges directly into the official Expo Snack web runtime for interactive testing without native build tools.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Frameworks & Libraries */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-fg flex items-center gap-2">
            <Layers size={16} className="text-accent" />
            <span>2. Frameworks & UI Stack</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">Next.js 16+ (App Router)</span>
              <span className="text-muted text-[11px]">Full-stack web application</span>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">TypeScript</span>
              <span className="text-muted text-[11px]">Strict typed development</span>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">Tailwind CSS v4</span>
              <span className="text-muted text-[11px]">Valor dark design tokens</span>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">Monaco Editor</span>
              <span className="text-muted text-[11px]">Syntax-highlighted code viewer</span>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">Zustand</span>
              <span className="text-muted text-[11px]">Client state & persistence</span>
            </div>
            <div className="p-3 bg-surface-2 rounded-xl border border-line">
              <span className="font-bold text-fg block">Zod v3</span>
              <span className="text-muted text-[11px]">Schema-first validation</span>
            </div>
          </div>
        </div>

        {/* Section 3: Responsible AI Commitments */}
        <div className="card p-6 space-y-4 border-l-4 border-l-accent">
          <h2 className="text-base font-bold text-fg flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            <span>3. Safety & Responsible AI Commitments</span>
          </h2>
          <ul className="space-y-2 text-xs text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Dependency Allow-List:</strong> A hardcoded allow-list prevents generation of unapproved native dependencies or unauthorized network calls.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Harmful Prompt Rejection:</strong> An automated keyword and heuristic filter intercepts surveillance, malware, or credential theft ideas before model execution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Grounding Guarantee:</strong> Explain and Chat responses are strictly grounded in the generated project source code and will not hallucinate non-existent files.</span>
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
