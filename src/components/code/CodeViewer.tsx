"use client";
import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Sparkles, Copy, Check } from "lucide-react";
import type { GeneratedFile } from "@/lib/schemas";
import { languageFor } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface CodeViewerProps {
  file: GeneratedFile;
  onExplainSelection?: (path: string, startLine: number, endLine: number, code: string) => void;
}

export function CodeViewer({ file, onExplainSelection }: CodeViewerProps) {
  const theme = useStore((s) => s.settings.theme);
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);
  const [selectedRange, setSelectedRange] = React.useState<{ start: number; end: number; text: string } | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      if (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) {
        const text = editor.getModel()?.getValueInRange(selection) || "";
        if (text.trim().length > 0) {
          setSelectedRange({
            start: selection.startLineNumber,
            end: selection.endLineNumber,
            text,
          });
          return;
        }
      }
      setSelectedRange(null);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskExplain = () => {
    if (selectedRange && onExplainSelection) {
      onExplainSelection(file.path, selectedRange.start, selectedRange.end, selectedRange.text);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] rounded-2xl border border-line overflow-hidden relative">
      {/* File Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-line text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-fg font-medium">{file.path}</span>
          {file.purpose && (
            <span className="text-subtle hidden sm:inline truncate max-w-md">· {file.purpose}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRange && onExplainSelection && (
            <button
              onClick={handleAskExplain}
              className="btn-primary px-2.5 py-1 text-xs rounded-lg animate-pulse"
              title="Explain this specific selection"
            >
              <Sparkles size={12} />
              <span>Explain Lines {selectedRange.start}–{selectedRange.end}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="btn-ghost px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5"
            title="Copy code"
          >
            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={languageFor(file.path)}
          value={file.content}
          theme={theme === "light" ? "light" : "vs-dark"}
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "var(--font-jetbrains), Menlo, Monaco, monospace",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
}
