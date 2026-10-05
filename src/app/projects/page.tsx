"use client";
import React from "react";
import Link from "next/link";
import { FolderOpen, ArrowRight, Sparkles, Trash2, Smartphone } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { sampleProjects } from "@/lib/samples";
import { Footer } from "@/components/layout/Footer";
import { timeAgo } from "@/lib/utils";

export default function ProjectsPage() {
  const hydrated = useHydrated();
  const rawProjects = useStore((s) => s.projects);
  const projects = React.useMemo(() => {
    return Object.values(rawProjects).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [rawProjects]);
  const remove = useStore((s) => s.remove);

  return (
    <div className="flex-1 flex flex-col justify-between select-none">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 w-full space-y-8">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">Your Projects</h1>
            <p className="text-xs text-muted mt-1">Saved locally in your browser storage</p>
          </div>
          <Link href="/" className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>New App</span>
          </Link>
        </div>

        {/* User created projects */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-fg uppercase tracking-wider">
            Workspace Projects ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="card p-8 text-center text-muted text-xs space-y-2">
              <FolderOpen size={24} className="mx-auto text-subtle" />
              <p>No user projects created yet.</p>
              <Link href="/" className="text-accent hover:underline font-medium inline-block">
                Start by entering an app idea
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="card p-4 flex flex-col justify-between hover:border-line-strong transition-all relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/project/${p.id}`} className="font-bold text-sm text-fg hover:text-accent transition-colors">
                        {p.title}
                      </Link>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-subtle hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{p.idea}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-line/40 flex items-center justify-between text-[11px] text-subtle">
                    <span>Updated {timeAgo(p.updatedAt)}</span>
                    <Link href={`/project/${p.id}`} className="text-accent flex items-center gap-1 hover:underline font-medium">
                      <span>Open Studio</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sample benchmark projects */}
        <div className="space-y-4 pt-6 border-t border-line/60">
          <h3 className="text-xs font-bold text-fg uppercase tracking-wider">
            Official Pre-Built Example Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sampleProjects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="card card-hover p-4 flex items-center justify-between border-line"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <h4 className="text-xs font-bold text-fg">{p.title}</h4>
                  </div>
                  <p className="text-xs text-muted line-clamp-1 mt-0.5">{p.idea}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-surface-2 border border-line grid place-items-center text-muted shrink-0">
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
