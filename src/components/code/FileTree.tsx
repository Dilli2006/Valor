"use client";
import React, { useState } from "react";
import { Folder, FileCode, CheckCircle2, ChevronRight, ChevronDown } from "lucide-react";
import type { GeneratedFile } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: GeneratedFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
}

export function FileTree({ files, selectedPath, onSelect }: FileTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Group files into folder tree
  const folders: Record<string, GeneratedFile[]> = {};
  const rootFiles: GeneratedFile[] = [];

  for (const f of files) {
    const parts = f.path.split("/");
    if (parts.length === 1) {
      rootFiles.push(f);
    } else {
      const folder = parts.slice(0, -1).join("/");
      if (!folders[folder]) folders[folder] = [];
      folders[folder].push(f);
    }
  }

  const toggleFolder = (folder: string) => {
    setCollapsed((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  return (
    <div className="flex flex-col text-xs font-mono select-none overflow-y-auto">
      <div className="px-3 py-2 text-[10px] uppercase font-bold text-subtle tracking-wider flex items-center justify-between border-b border-line">
        <span>Project Files</span>
        <span className="text-[11px] font-normal text-muted">{files.length}</span>
      </div>

      <div className="p-1 space-y-0.5">
        {/* Root level files */}
        {rootFiles.map((file) => {
          const isSelected = file.path === selectedPath;
          return (
            <button
              key={file.path}
              onClick={() => onSelect(file.path)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors",
                isSelected
                  ? "bg-accent-soft text-accent font-medium border border-accent-line/40"
                  : "text-muted hover:text-fg hover:bg-surface-2"
              )}
            >
              <FileCode size={13} className={isSelected ? "text-accent" : "text-subtle"} />
              <span className="truncate">{file.path}</span>
            </button>
          );
        })}

        {/* Nested folders */}
        {Object.entries(folders).map(([folderName, folderFiles]) => {
          const isCollapsed = collapsed[folderName];
          return (
            <div key={folderName} className="space-y-0.5">
              <button
                onClick={() => toggleFolder(folderName)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-subtle hover:text-fg text-left transition-colors"
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <Folder size={13} className="text-muted" />
                <span className="font-semibold text-fg/90">{folderName}</span>
              </button>

              {!isCollapsed && (
                <div className="pl-4 border-l border-line/40 ml-3 space-y-0.5">
                  {folderFiles.map((file) => {
                    const isSelected = file.path === selectedPath;
                    const fileName = file.path.split("/").pop();
                    return (
                      <button
                        key={file.path}
                        onClick={() => onSelect(file.path)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors",
                          isSelected
                            ? "bg-accent-soft text-accent font-medium border border-accent-line/40"
                            : "text-muted hover:text-fg hover:bg-surface-2"
                        )}
                      >
                        <FileCode size={12} className={isSelected ? "text-accent" : "text-subtle"} />
                        <span className="truncate">{fileName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
