"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, CheckCircle2, Clock, Hash, Layers } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { UploadedDocument } from "@/types/document";

interface SidebarProps {
  document: UploadedDocument | null;
  onClear: () => void;
  isOpen: boolean;
}

export default function Sidebar({ document, onClear, isOpen }: SidebarProps) {
  return (
    <motion.aside
      id="sidebar"
      initial={false}
      animate={{
        width: isOpen ? 280 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="hidden lg:flex flex-col border-r border-white/5 glass-strong overflow-hidden flex-shrink-0"
    >
      <div className="p-5 w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-cyan-500/10">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Document</h2>
        </div>

        {document ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* File card */}
            <div className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex-shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {document.fileName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Processed
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2.5">
              <MetadataItem
                icon={<Hash className="w-3 h-3" />}
                label="Chunks"
                value={document.totalChunks.toString()}
              />
              <MetadataItem
                icon={<FileText className="w-3 h-3" />}
                label="Type"
                value={document.fileType.split("/").pop()?.toUpperCase() || "FILE"}
              />
              <MetadataItem
                icon={<Clock className="w-3 h-3" />}
                label="Uploaded"
                value={new Date(document.uploadedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>

            {/* Text preview */}
            {document.extractedTextPreview && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2 font-medium">
                  Preview
                </p>
                <div className="bg-black/30 rounded-lg p-3 max-h-40 overflow-y-auto border border-white/5">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                    {document.extractedTextPreview}
                  </p>
                </div>
              </div>
            )}

            {/* Clear button */}
            <button
              onClick={onClear}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors mt-2"
            >
              <Trash2 className="w-3 h-3" />
              Remove Document
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-slate-800 mb-3" />
            <p className="text-xs text-slate-600">
              Upload a document to get started
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02]">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-slate-300">{value}</span>
    </div>
  );
}
