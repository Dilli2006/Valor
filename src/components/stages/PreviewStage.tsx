"use client";
import React, { useState } from "react";
import { Sparkles, Download, ArrowLeft, RefreshCw, Layers, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PhonePreview } from "@/components/preview/PhonePreview";
import { FileTree } from "@/components/code/FileTree";
import { CodeViewer } from "@/components/code/CodeViewer";
import type { Brief, GeneratedFile, Plan, StageStatus } from "@/lib/schemas";
import { exportProjectZip, downloadBlob } from "@/lib/export";
import type { Project } from "@/lib/schemas";

interface PreviewStageProps {
  project: Project;
  onExplainSelection?: (path: string, startLine: number, endLine: number, code: string) => void;
}

export function PreviewStage({ project, onExplainSelection }: PreviewStageProps) {
  const [selectedPath, setSelectedPath] = useState<string>(project.files[0]?.path || "App.js");
  const [exporting, setExporting] = useState(false);

  const selectedFile = project.files.find((f) => f.path === selectedPath) || project.files[0];

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportProjectZip(project);
      const name = `${(project.brief?.appName || "app").toLowerCase().replace(/[^a-z0-9]/g, "-")}-project.zip`;
      downloadBlob(blob, name);
    } catch (e) {
      console.error("ZIP export failed", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-surface border-b border-line text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-fg flex items-center gap-1.5">
            <Sparkles size={14} className="text-accent" />
            <span>Interactive Live Studio Preview</span>
          </span>
          <span className="text-muted">· {project.files.length} project files ready for export</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>{exporting ? "Zipping..." : "Export Project ZIP"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Code view left, Phone right */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Side: Code Inspector (Col 7) */}
        <div className="col-span-7 border-r border-line grid grid-cols-12 overflow-hidden bg-surface">
          <div className="col-span-4 border-r border-line overflow-y-auto">
            <FileTree
              files={project.files}
              selectedPath={selectedPath}
              onSelect={(p) => setSelectedPath(p)}
            />
          </div>
          <div className="col-span-8 p-2 overflow-hidden flex flex-col">
            {selectedFile && (
              <CodeViewer
                file={selectedFile}
                onExplainSelection={onExplainSelection}
              />
            )}
          </div>
        </div>

        {/* Right Side: Phone Preview (Col 5) */}
        <div className="col-span-5 bg-surface/40 p-4 overflow-hidden flex items-center justify-center">
          <PhonePreview
            files={project.files}
            plan={project.plan}
            appName={project.brief?.appName || "Valor App"}
          />
        </div>
      </div>
    </div>
  );
}
