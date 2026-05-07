"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { UploadStatus } from "@/types/document";

interface LoadingStateProps {
  status: UploadStatus;
  label?: string;
}

export default function LoadingState({ status, label }: LoadingStateProps) {
  if (status === "idle" || status === "ready") return null;

  const messages: Record<string, string> = {
    uploading: "Uploading your document...",
    extracting: "Extracting text content...",
    chunking: "Chunking document into segments...",
    embedding: "Generating AI embeddings...",
    storing: "Storing vectors in database...",
    error: "Something went wrong",
  };

  const message = label || messages[status] || "Processing...";
  const isError = status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl glass border border-white/5"
    >
      {isError ? (
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-xs">!</span>
        </div>
      ) : (
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
      )}
      <span className="text-sm text-slate-300">{message}</span>
      {!isError && (
        <div className="ml-auto flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-cyan-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
