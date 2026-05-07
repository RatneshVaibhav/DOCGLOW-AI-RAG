"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronRight } from "lucide-react";
import SourceCard from "./source-card";
import type { RetrievedSource } from "@/types/chat";

interface SourcesPanelProps {
  sources: RetrievedSource[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SourcesPanel({ sources, isOpen, onClose }: SourcesPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            id="sources-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50 glass-strong border-l border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-500/10">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Retrieved Context
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {sources.length} source{sources.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                aria-label="Close sources panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sources list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">No sources yet</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Ask a question to see retrieved context
                  </p>
                </div>
              ) : (
                sources.map((source, index) => (
                  <SourceCard
                    key={index}
                    source={source}
                    index={index}
                    isExpanded={expandedIndex === index}
                    onToggle={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  />
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Toggle button for desktop
export function SourcesToggle({
  onClick,
  sourceCount,
}: {
  onClick: () => void;
  sourceCount: number;
}) {
  if (sourceCount === 0) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 glass rounded-xl px-3 py-4 border border-white/10 hover:border-cyan-500/30 transition-all group flex flex-col items-center gap-2 hover:shadow-glow-sm"
      aria-label="Open sources panel"
    >
      <BookOpen className="w-4 h-4 text-violet-400" />
      <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-medium">
        {sourceCount}
      </span>
      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
    </motion.button>
  );
}
