"use client";
import React, { useState } from "react";
import { Hammer, Sparkles, AlertCircle, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Brief, BuildPhase, BuildPhaseOutput, GeneratedFile, Plan, StageStatus } from "@/lib/schemas";
import { callStage } from "@/lib/client/stream";
import { FileTree } from "@/components/code/FileTree";
import { CodeViewer } from "@/components/code/CodeViewer";
import { PhonePreview } from "@/components/preview/PhonePreview";
import { validateProject, buildPackageJson } from "@/lib/validate/build";

interface BuildStageProps {
  brief: Brief;
  plan: Plan;
  files: GeneratedFile[];
  onFilesGenerated: (files: GeneratedFile[]) => void;
  onProceedToExplain: () => void;
  status: StageStatus;
  onExplainSelection?: (path: string, startLine: number, endLine: number, code: string) => void;
}

export function BuildStage({
  brief,
  plan,
  files,
  onFilesGenerated,
  onProceedToExplain,
  status,
  onExplainSelection,
}: BuildStageProps) {
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path || "App.js");
  const [building, setBuilding] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BuildPhase | "idle">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedFile = files.find((f) => f.path === selectedPath) || files[0];

  const runBuild = async () => {
    setBuilding(true);
    setError(null);
    let cumulativeFiles: GeneratedFile[] = [];

    try {
      // 1. Skeleton Phase
      setCurrentPhase("skeleton");
      setProgressMsg("Phase 1/3: Scaffolding App.js, theme, and store context...");
      const skeletonRes = await callStage<BuildPhaseOutput>("/api/build", {
        brief,
        plan,
        phase: "skeleton",
        existing: cumulativeFiles,
      });
      cumulativeFiles = [...skeletonRes.data.files];
      onFilesGenerated(cumulativeFiles);

      // 2. Screens Phase
      setCurrentPhase("screens");
      setProgressMsg("Phase 2/3: Implementing screens and navigation routes...");
      const screensRes = await callStage<BuildPhaseOutput>("/api/build", {
        brief,
        plan,
        phase: "screens",
        existing: cumulativeFiles,
      });

      // Merge files, updating duplicates
      const screenFiles = screensRes.data.files;
      const fileMap = new Map<string, GeneratedFile>();
      cumulativeFiles.forEach((f) => fileMap.set(f.path, f));
      screenFiles.forEach((f) => fileMap.set(f.path, f));
      cumulativeFiles = Array.from(fileMap.values());
      onFilesGenerated(cumulativeFiles);

      // 3. Polish Phase
      setCurrentPhase("polish");
      setProgressMsg("Phase 3/3: Validating dependency constraints and README...");
      const polishRes = await callStage<BuildPhaseOutput>("/api/build", {
        brief,
        plan,
        phase: "polish",
        existing: cumulativeFiles,
      });

      polishRes.data.files.forEach((f) => fileMap.set(f.path, f));
      cumulativeFiles = Array.from(fileMap.values());

      // Auto-attach package.json
      if (!fileMap.has("package.json")) {
        cumulativeFiles.push(buildPackageJson(brief.appName, cumulativeFiles));
      }

      onFilesGenerated(cumulativeFiles);
    } catch (err: any) {
      setError(err?.message || "Generation halted. Please retry.");
    } finally {
      setBuilding(false);
      setCurrentPhase("idle");
      setProgressMsg("");
    }
  };

  const validation = files.length > 0 ? validateProject(files, plan) : null;

  if (files.length === 0 && !building) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent-line grid place-items-center mx-auto text-accent">
          <Hammer size={24} />
        </div>
        <h2 className="text-xl font-bold text-fg">Step 3: Staged Code Generation</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Generate an Expo (React Native) project for "{brief.appName}". Code is synthesized in 3 stages: Skeleton → Screens → Polish.
        </p>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-md mx-auto">
            {error}
          </div>
        )}
        <button onClick={runBuild} className="btn-primary px-6 py-2.5">
          <Sparkles size={16} />
          <span>Start 3-Phase App Build</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] select-none">
      {/* Top action status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-line text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-fg flex items-center gap-1.5">
            <Hammer size={14} className="text-accent" />
            <span>Generated Expo Project</span>
          </span>
          <span className="text-muted">· {files.length} files</span>
          {validation && (
            <span
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                validation.ok
                  ? "border-success/30 text-success bg-success/10"
                  : "border-warning/30 text-warning bg-warning/10"
              }`}
            >
              <ShieldCheck size={11} />
              <span>{validation.ok ? "Quality Gate: Passed" : `${validation.issues.length} warnings`}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {building ? (
            <div className="flex items-center gap-2 text-accent text-xs">
              <Loader2 size={13} className="animate-spin" />
              <span>{progressMsg}</span>
            </div>
          ) : (
            <button
              onClick={runBuild}
              className="btn-ghost px-2.5 py-1 text-xs"
              title="Re-run 3-stage generation"
            >
              Regenerate Code
            </button>
          )}

          <button
            onClick={onProceedToExplain}
            className="btn-primary px-3 py-1 text-xs flex items-center gap-1.5"
          >
            <span>Proceed to Explain</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Main 3-column layout: FileTree | CodeViewer | PhonePreview */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* File Tree (Col 2.5) */}
        <div className="col-span-2 border-r border-line bg-surface overflow-y-auto">
          <FileTree
            files={files}
            selectedPath={selectedPath}
            onSelect={(p) => setSelectedPath(p)}
          />
        </div>

        {/* Code Viewer (Col 6.5) */}
        <div className="col-span-6 p-2 overflow-hidden flex flex-col">
          {selectedFile ? (
            <CodeViewer
              file={selectedFile}
              onExplainSelection={onExplainSelection}
            />
          ) : (
            <div className="grid place-items-center h-full text-muted text-xs">
              Select a file to inspect
            </div>
          )}
        </div>

        {/* Phone Preview (Col 3.5) */}
        <div className="col-span-4 border-l border-line bg-surface/50 p-2 overflow-hidden flex items-center justify-center">
          <PhonePreview
            files={files}
            plan={plan}
            appName={brief.appName}
          />
        </div>
      </div>
    </div>
  );
}
