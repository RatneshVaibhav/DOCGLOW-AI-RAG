"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageBubble from "./message-bubble";
import GlowingButton from "./glowing-button";
import { SUGGESTED_PROMPTS } from "@/lib/prompts";
import type { ChatMessage, RetrievedSource } from "@/types/chat";

interface ChatPanelProps {
  documentId: string | null;
  isReady: boolean;
  onSourcesUpdate: (sources: RetrievedSource[]) => void;
  onOpenSources: () => void;
}

export default function ChatPanel({ documentId, isReady, onSourcesUpdate, onOpenSources }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (query?: string) => {
    const message = query || input.trim();
    if (!message || !documentId || isLoading) return;
    setInput("");

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: message, timestamp: new Date().toISOString() };
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date().toISOString(), isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: message, documentId }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Chat failed"); }

      const sourcesHeader = res.headers.get("X-Sources");
      let sources: RetrievedSource[] = [];
      if (sourcesHeader) { try { sources = JSON.parse(atob(sourcesHeader)); onSourcesUpdate(sources); } catch {} }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((m) => m.id === assistantMsg.id ? { ...m, content: fullContent, isStreaming: true } : m));
        }
        setMessages((prev) => prev.map((m) => m.id === assistantMsg.id ? { ...m, content: fullContent, isStreaming: false, sources } : m));
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => prev.map((m) => m.id === assistantMsg.id ? { ...m, content: `⚠️ Error: ${errMsg}`, isStreaming: false } : m));
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  useEffect(() => { if (inputRef.current) { inputRef.current.style.height = "auto"; inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px"; } }, [input]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 && isReady ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 mb-4"><MessageSquare className="w-8 h-8 text-cyan-400" /></div>
            <h3 className="text-lg font-display font-semibold text-white mb-2">Start a conversation</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">Ask anything about your document. Answers are grounded in your uploaded content.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <motion.button key={prompt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSend(prompt)} disabled={isLoading}
                  className="px-4 py-2 rounded-xl glass border border-white/5 text-xs text-slate-400 hover:text-white hover:border-cyan-500/20 transition-all hover:shadow-glow-sm">
                  <Sparkles className="w-3 h-3 inline mr-1.5 text-cyan-500" />{prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : messages.map((msg) => <MessageBubble key={msg.id} message={msg} onSourceClick={onOpenSources} />)}
        {!isReady && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageSquare className="w-10 h-10 text-slate-800 mb-3" /><p className="text-sm text-slate-600">Upload a document to start chatting</p>
          </div>
        )}
      </div>
      <div className="border-t border-white/5 p-4 sm:px-6">
        <div className={cn("flex items-end gap-3 glass rounded-2xl px-4 py-3 border transition-colors", isReady ? "border-white/10 focus-within:border-cyan-500/30 focus-within:shadow-glow-sm" : "border-white/5 opacity-50")}>
          <textarea ref={inputRef} id="chat-input" rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={!isReady || isLoading}
            placeholder={isReady ? "Ask about your document..." : "Upload a document first"} className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none focus:outline-none min-h-[20px] max-h-[120px] leading-relaxed" />
          <GlowingButton id="send-button" variant="primary" size="sm" onClick={() => handleSend()} disabled={!input.trim() || !isReady || isLoading} className="flex-shrink-0 !rounded-xl !px-3"><Send className="w-4 h-4" /></GlowingButton>
        </div>
        <p className="text-[10px] text-slate-700 text-center mt-2">Answers are grounded in your uploaded document · Powered by Grok + RAG</p>
      </div>
    </div>
  );
}
