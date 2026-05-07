"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Hash, BarChart3 } from "lucide-react";
import { cn, truncateText } from "@/lib/utils";
import type { RetrievedSource } from "@/types/chat";

interface SourceCardProps {
  source: RetrievedSource;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SourceCard({
  source,
  index,
  isExpanded,
  onToggle,
}: SourceCardProps) {
  const scorePercent = Math.round(source.score * 100);
  const scoreColor =
    scorePercent >= 80
      ? "text-emerald-400"
      : scorePercent >= 60
      ? "text-yellow-400"
      : "text-orange-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl border border-white/5 overflow-hidden hover:border-cyan-500/20 transition-colors"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={isExpanded}
        aria-label={`Source ${index + 1}: ${source.fileName}`}
      >
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <span className="text-[10px] font-bold text-cyan-400">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-400 truncate">
              {source.fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Hash className="w-3 h-3" />
            <span>P{source.pageNumber}</span>
          </div>
          <div className={cn("flex items-center gap-1 text-xs font-medium", scoreColor)}>
            <BarChart3 className="w-3 h-3" />
            <span>{scorePercent}%</span>
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-slate-500 text-xs"
          >
            ▾
          </motion.span>
        </div>
      </button>

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-1">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {isExpanded ? source.chunkText : truncateText(source.chunkText, 150)}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-600">
            <span>Chunk #{source.chunkIndex}</span>
            <span>Page {source.pageNumber}</span>
            <span>Match: {scorePercent}%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
