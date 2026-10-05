"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, Download, ArrowLeft, RefreshCw, Layers, ShieldCheck, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useStore, useHydrated } from "@/lib/store";
import { StageStepper } from "@/components/workspace/StageStepper";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { UnderstandStage } from "@/components/stages/UnderstandStage";
import { PlanStage } from "@/components/stages/PlanStage";
import { BuildStage } from "@/components/stages/BuildStage";
import { ExplainStage } from "@/components/stages/ExplainStage";
import { LearnStage } from "@/components/stages/LearnStage";
import { PreviewStage } from "@/components/stages/PreviewStage";
import { sampleProjects } from "@/lib/samples";
import { exportProjectZip, downloadBlob } from "@/lib/export";
import type { Brief, ChatMessage, Explanation, GeneratedFile, LearningPath, Plan, Stage, Understanding } from "@/lib/schemas";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const hydrated = useHydrated();

  const storeProject = useStore((s) => s.projects[id]);
  const updateProject = useStore((s) => s.update);
  const setStageStatus = useStore((s) => s.setStage);
  const upsert = useStore((s) => s.upsert);

  const [currentStage, setCurrentStage] = useState<Stage>("understand");
  const [chatOpen, setChatOpen] = useState(true);
  const [exporting, setExporting] = useState(false);

  // If looking for a sample project not in localstore, seed it
  useEffect(() => {
    if (hydrated && !storeProject) {
      const sample = sampleProjects.find((p) => p.id === id);
      if (sample) {
        upsert(sample);
      }
    }
  }, [hydrated, storeProject, id, upsert]);

  const project = storeProject || sampleProjects.find((p) => p.id === id);

  if (!hydrated || !project) {
    return (
      <div className="flex-1 grid place-items-center text-muted text-xs">
        Loading project workspace...
      </div>
    );
  }

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const blob = await exportProjectZip(project);
      downloadBlob(blob, `${(project.brief?.appName || "app").toLowerCase().replace(/[^a-z0-9]/g, "-")}-project.zip`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmUnderstanding = (brief: Brief, understanding: Understanding) => {
    updateProject(id, () => ({
      brief,
      understanding,
      title: brief.appName,
    }));
    setStageStatus(id, "understand", "done");
    setStageStatus(id, "plan", "ready");
    setCurrentStage("plan");
  };

  const handleApprovePlan = (plan: Plan) => {
    updateProject(id, () => ({ plan }));
    setStageStatus(id, "plan", "done");
    setStageStatus(id, "build", "ready");
    setCurrentStage("build");
  };

  const handleToggleFeature = (featureId: string) => {
    updateProject(id, (p) => {
      const exists = p.disabledFeatureIds.includes(featureId);
      const next = exists
        ? p.disabledFeatureIds.filter((f) => f !== featureId)
        : [...p.disabledFeatureIds, featureId];
      return { disabledFeatureIds: next };
    });
  };

  const handleFilesGenerated = (files: GeneratedFile[]) => {
    updateProject(id, () => ({ files }));
    setStageStatus(id, "build", "done");
    setStageStatus(id, "explain", "ready");
  };

  const handleOverviewGenerated = (explainOverview: any) => {
    updateProject(id, () => ({ explainOverview }));
    setStageStatus(id, "explain", "done");
    setStageStatus(id, "learn", "ready");
  };

  const handleLearningPathGenerated = (learningPath: LearningPath) => {
    updateProject(id, () => ({ learningPath }));
    setStageStatus(id, "learn", "done");
    setStageStatus(id, "preview", "ready");
  };

  const handleSendMessage = (msg: ChatMessage) => {
    updateProject(id, (p) => ({ chat: [...p.chat, msg] }));
  };

  const handleExplainSelection = (path: string, startLine: number, endLine: number, code: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: `Explain ${path} (lines ${startLine}-${endLine}):\n\`\`\`javascript\n${code}\n\`\`\``,
      createdAt: Date.now(),
    };
    handleSendMessage(userMsg);
    setChatOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] overflow-hidden select-none bg-bg">
      {/* Top Project Bar */}
      <div className="h-11 border-b border-line bg-surface px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost p-1.5 rounded-lg text-muted hover:text-fg">
            <ArrowLeft size={13} />
          </Link>
          <span className="font-bold text-fg truncate max-w-xs">{project.brief?.appName || project.title}</span>
          <span className="text-[10px] text-subtle font-mono hidden sm:inline">({project.id})</span>
        </div>

        <div className="flex items-center gap-2">
          {project.files && project.files.length > 0 && (
            <button
              onClick={handleExportZip}
              disabled={exporting}
              className="btn-ghost px-2.5 py-1 text-xs flex items-center gap-1.5"
            >
              <Download size={12} />
              <span>{exporting ? "Zipping..." : "Export ZIP"}</span>
            </button>
          )}

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`btn-ghost px-2.5 py-1 text-xs flex items-center gap-1.5 ${
              chatOpen ? "border-accent-line text-accent" : ""
            }`}
          >
            <MessageSquare size={12} />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 3-column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail: Stage Stepper (220px) */}
        <div className="w-56 border-r border-line bg-surface p-3 overflow-y-auto shrink-0 flex flex-col justify-between">
          <StageStepper
            currentStage={currentStage}
            stageStatus={project.stageStatus}
            onSelectStage={(st) => setCurrentStage(st)}
          />

          <div className="pt-4 border-t border-line text-[11px] text-subtle">
            <p className="truncate">Active Project</p>
            <p className="text-muted font-medium truncate">{project.title}</p>
          </div>
        </div>

        {/* Center Canvas: Active Stage (Flex-1) */}
        <div className="flex-1 overflow-y-auto bg-bg/50 relative">
          {currentStage === "understand" && (
            <UnderstandStage
              idea={project.idea}
              initialUnderstanding={project.understanding}
              initialBrief={project.brief}
              onConfirm={handleConfirmUnderstanding}
              status={project.stageStatus.understand}
            />
          )}

          {currentStage === "plan" && (
            <PlanStage
              brief={project.brief || ({} as any)}
              initialPlan={project.plan}
              disabledFeatureIds={project.disabledFeatureIds}
              onToggleFeature={handleToggleFeature}
              onApprove={handleApprovePlan}
              status={project.stageStatus.plan}
            />
          )}

          {currentStage === "build" && (
            <BuildStage
              brief={project.brief || ({} as any)}
              plan={project.plan || ({} as any)}
              files={project.files}
              onFilesGenerated={handleFilesGenerated}
              onProceedToExplain={() => {
                setStageStatus(id, "explain", "ready");
                setCurrentStage("explain");
              }}
              status={project.stageStatus.build}
              onExplainSelection={handleExplainSelection}
            />
          )}

          {currentStage === "explain" && (
            <ExplainStage
              brief={project.brief || ({} as any)}
              plan={project.plan || ({} as any)}
              files={project.files}
              initialOverview={project.explainOverview}
              onOverviewGenerated={handleOverviewGenerated}
              onProceedToLearn={() => {
                setStageStatus(id, "learn", "ready");
                setCurrentStage("learn");
              }}
              status={project.stageStatus.explain}
            />
          )}

          {currentStage === "learn" && (
            <LearnStage
              brief={project.brief || ({} as any)}
              plan={project.plan || ({} as any)}
              files={project.files}
              initialLearningPath={project.learningPath}
              onLearningPathGenerated={handleLearningPathGenerated}
              onProceedToPreview={() => {
                setStageStatus(id, "preview", "ready");
                setCurrentStage("preview");
              }}
              status={project.stageStatus.learn}
            />
          )}

          {currentStage === "preview" && (
            <PreviewStage
              project={project}
              onExplainSelection={handleExplainSelection}
            />
          )}
        </div>

        {/* Right Rail: Chat with Code (320px) */}
        {chatOpen && (
          <div className="w-80 shrink-0 h-full">
            <ChatPanel
              chat={project.chat}
              files={project.files}
              plan={project.plan}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
