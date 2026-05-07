"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { UploadStatus } from "@/types/document";
import GlowingButton from "./glowing-button";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  selectedFile: File | null;
  onClearFile: () => void;
  error?: string;
}

const PROCESSING_STEPS = [
  { key: "uploading", label: "Uploading file...", icon: Upload },
  { key: "extracting", label: "Extracting text...", icon: FileText },
  { key: "chunking", label: "Chunking document...", icon: FileText },
  { key: "embedding", label: "Generating embeddings...", icon: Loader2 },
  { key: "storing", label: "Storing vectors...", icon: Loader2 },
  { key: "ready", label: "Ready to chat!", icon: CheckCircle2 },
];

export default function UploadZone({
  onFileUpload,
  uploadStatus,
  selectedFile,
  onClearFile,
  error,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: uploadStatus !== "idle" && uploadStatus !== "error",
  });

  const isProcessing = !["idle", "ready", "error"].includes(uploadStatus);
  const currentStepIndex = PROCESSING_STEPS.findIndex(
    (s) => s.key === uploadStatus
  );

  return (
    <motion.div
      id="upload-zone"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {uploadStatus === "idle" || uploadStatus === "error" ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative group cursor-pointer rounded-2xl p-10 transition-all duration-300",
                "glass border-2 border-dashed",
                isDragActive
                  ? "border-cyan-400/60 bg-cyan-500/5 shadow-glow"
                  : "border-white/10 hover:border-cyan-500/30 hover:shadow-glow-sm",
                uploadStatus === "error" && "border-red-500/30"
              )}
            >
              <input {...getInputProps()} id="file-upload-input" />

              <div className="flex flex-col items-center gap-4 text-center">
                <motion.div
                  className={cn(
                    "p-4 rounded-2xl transition-colors duration-300",
                    isDragActive ? "bg-cyan-500/10" : "bg-white/5 group-hover:bg-cyan-500/5"
                  )}
                  animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                >
                  <Upload
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isDragActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                    )}
                  />
                </motion.div>

                <div>
                  <p className="text-base font-medium text-white mb-1">
                    {isDragActive ? "Drop your file here" : "Drag & drop your document"}
                  </p>
                  <p className="text-sm text-slate-500">
                    or click to browse · PDF, TXT up to 20MB
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-8 border border-white/10"
          >
            {/* File info */}
            {selectedFile && (
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {uploadStatus === "ready" && (
                  <button
                    onClick={onClearFile}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Processing steps */}
            <div className="space-y-3">
              {PROCESSING_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.key === uploadStatus;
                const isComplete = index < currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                      isActive && "bg-cyan-500/5 border border-cyan-500/20",
                      isComplete && "opacity-60",
                      isPending && "opacity-30"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        isActive ? "text-cyan-300 font-medium" : "text-slate-400"
                      )}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="status-glow w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Ready state */}
            {uploadStatus === "ready" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-white/5 text-center"
              >
                <p className="text-sm text-emerald-400 mb-1 font-medium">
                  ✨ Document processed successfully!
                </p>
                <p className="text-xs text-slate-500">
                  You can now start chatting with your document below.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
