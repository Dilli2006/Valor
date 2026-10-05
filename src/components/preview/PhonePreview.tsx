"use client";
import React, { useState } from "react";
import { Smartphone, ExternalLink, RefreshCw, Layers, Sparkles } from "lucide-react";
import type { GeneratedFile, Plan } from "@/lib/schemas";
import { buildPackageJson } from "@/lib/validate/build";

interface PhonePreviewProps {
  files: GeneratedFile[];
  plan?: Plan;
  appName?: string;
}

export function PhonePreview({ files, plan, appName = "Generated App" }: PhonePreviewProps) {
  const [mode, setMode] = useState<"interactive" | "snack">("interactive");
  const [selectedScreenId, setSelectedScreenId] = useState<string>(
    plan?.screens?.[0]?.id || "s1"
  );
  const [activeTab, setActiveTab] = useState<string>(
    plan?.navigation?.tabs?.[0] || plan?.screens?.[0]?.id || "s1"
  );

  // Filter for screens in plan
  const activeScreen = plan?.screens?.find((s) => s.id === selectedScreenId) || plan?.screens?.[0];

  // Prepare code for Expo Snack embed
  const appJs = files.find((f) => f.path === "App.js")?.content || "";
  const encodedCode = encodeURIComponent(appJs);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-sm mx-auto select-none py-2">
      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-line mb-3 text-xs">
        <button
          onClick={() => setMode("interactive")}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            mode === "interactive" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          Mockup Live View
        </button>
        <button
          onClick={() => setMode("snack")}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            mode === "snack" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          Expo Snack Embed
        </button>
      </div>

      {/* Phone Frame */}
      <div className="w-[310px] h-[620px] bg-black rounded-[42px] border-[6px] border-[#222] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1a1a] rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-white/10 mr-3" />
          <div className="w-2 h-2 rounded-full bg-[#0d2238] ring-1 ring-blue-500/20" />
        </div>

        {/* Content View */}
        <div className="flex-1 w-full bg-[#0b0b0f] text-fg flex flex-col pt-8 pb-4 px-4 overflow-y-auto">
          {mode === "snack" ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
              <Sparkles size={28} className="text-accent mb-2 animate-bounce" />
              <h4 className="font-bold text-sm text-fg">Expo Snack Embed</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Render the full multi-file Expo project directly in the official Expo web runtime.
              </p>
              <a
                href={`https://snack.expo.dev?code=${encodedCode}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-4 text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <span>Open in Snack</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Screen Header */}
              <div className="flex items-center justify-between border-b border-line/40 pb-2 mb-3">
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                  {appName}
                </span>
                <span className="text-[10px] text-muted font-mono">{activeScreen?.name || "Screen"}</span>
              </div>

              {/* Screen Body */}
              <div className="flex-1 flex flex-col space-y-3">
                <div className="bg-surface-2 p-3 rounded-2xl border border-line">
                  <h3 className="font-bold text-base text-fg">{activeScreen?.title || "Welcome"}</h3>
                  <p className="text-xs text-muted mt-1">{activeScreen?.purpose}</p>
                </div>

                {/* Simulated Components */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold uppercase text-subtle tracking-wider">
                    Key Components ({activeScreen?.components?.length || 0})
                  </div>
                  {activeScreen?.components?.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-surface border border-line/60 flex items-center justify-between text-xs hover:border-accent-line transition-colors"
                    >
                      <span className="font-medium text-fg">{c}</span>
                      <span className="text-[10px] text-accent">Active</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Demo Action */}
                <div className="mt-auto pt-4">
                  <div className="p-3 bg-surface rounded-xl border border-line text-center">
                    <p className="text-xs text-muted mb-2">Simulate screen switch:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {plan?.screens?.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedScreenId(s.id)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] truncate transition-colors ${
                            selectedScreenId === s.id
                              ? "bg-accent text-white font-medium"
                              : "bg-surface-2 text-muted hover:text-fg"
                          }`}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Simulation */}
              {plan?.navigation?.tabs && plan.navigation.tabs.length > 0 && (
                <div className="mt-3 pt-2 border-t border-line flex items-center justify-around bg-surface -mx-4 -mb-4 px-2 py-2">
                  {plan.navigation.tabs.map((tabId) => {
                    const tabScreen = plan.screens.find((s) => s.id === tabId);
                    const isActive = selectedScreenId === tabId;
                    return (
                      <button
                        key={tabId}
                        onClick={() => setSelectedScreenId(tabId)}
                        className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] transition-colors ${
                          isActive ? "text-accent font-bold" : "text-subtle hover:text-fg"
                        }`}
                      >
                        <Layers size={14} className={isActive ? "text-accent" : "text-subtle"} />
                        <span>{tabScreen?.title || tabId}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Home Indicator bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
