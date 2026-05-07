"use client";

import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onSourceClick?: () => void;
}

export default function MessageBubble({ message, onSourceClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1",
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600"
            : "bg-gradient-to-br from-violet-500 to-purple-600"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-5 py-3.5",
          isUser
            ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
            : "glass border border-white/5"
        )}
      >
        {isUser ? (
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose-docglow text-sm">
            {message.isStreaming && !message.content ? (
              <div className="flex items-center gap-1.5 py-1">
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Sources badge */}
        {!isUser && message.sources && message.sources.length > 0 && !message.isStreaming && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onSourceClick}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 hover:bg-violet-500/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            {message.sources.length} sources
          </motion.button>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            "text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "text-cyan-400/50 text-right" : "text-slate-600"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}
