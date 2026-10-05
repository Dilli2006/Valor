"use client";
import React, { useState } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import type { ChatMessage, GeneratedFile, Plan } from "@/lib/schemas";
import { streamTextCall } from "@/lib/client/stream";
import { uid } from "@/lib/store";

interface ChatPanelProps {
  chat: ChatMessage[];
  files: GeneratedFile[];
  plan?: Plan;
  onSendMessage: (msg: ChatMessage) => void;
}

export function ChatPanel({ chat, files, plan, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };
    onSendMessage(userMsg);
    setInput("");
    setLoading(true);
    setStreamBuffer("");

    try {
      const allMessages = [...chat, userMsg];
      let assistantText = "";

      await streamTextCall(
        "/api/chat",
        {
          files,
          plan,
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        },
        (chunk) => {
          assistantText = chunk;
          setStreamBuffer(chunk);
        }
      );

      onSendMessage({
        id: uid(),
        role: "assistant",
        content: assistantText,
        createdAt: Date.now(),
      });
    } catch (err: any) {
      onSendMessage({
        id: uid(),
        role: "assistant",
        content: `Error: ${err?.message || "Failed to reach assistant"}`,
        createdAt: Date.now(),
      });
    } finally {
      setLoading(false);
      setStreamBuffer("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-line text-xs">
      <div className="p-3 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="font-bold text-fg">Chat with Code</span>
        </div>
        <span className="text-[10px] text-muted">{files.length} files in context</span>
      </div>

      {/* Message history */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {chat.length === 0 && !loading && (
          <div className="text-center py-8 text-subtle space-y-2">
            <Bot size={24} className="mx-auto text-muted/60" />
            <p>Ask anything about this project!</p>
            <p className="text-[11px] text-muted">
              "How does navigation work?" or "Where is the state saved?"
            </p>
          </div>
        )}

        {chat.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-5 h-5 rounded-md bg-accent-soft border border-accent-line grid place-items-center shrink-0 mt-0.5">
                <Bot size={11} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed break-words whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface-2 border border-line text-fg"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-5 h-5 rounded-md bg-surface-2 border border-line grid place-items-center shrink-0 mt-0.5">
                <User size={11} className="text-muted" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-5 h-5 rounded-md bg-accent-soft border border-accent-line grid place-items-center shrink-0 mt-0.5">
              <Bot size={11} className="text-accent" />
            </div>
            <div className="max-w-[85%] rounded-xl p-2.5 bg-surface-2 border border-line text-fg">
              {streamBuffer ? (
                <div className="whitespace-pre-wrap leading-relaxed">{streamBuffer}</div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted">
                  <Loader2 size={12} className="animate-spin text-accent" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input prompt */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-line flex gap-2 bg-surface-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the code..."
          disabled={loading}
          className="flex-1 bg-surface border border-line rounded-xl px-3 py-2 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-accent-line"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-3 py-2 rounded-xl text-white disabled:opacity-50"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}
