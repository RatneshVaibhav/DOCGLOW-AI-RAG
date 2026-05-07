"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import AnimatedBackground from "@/components/animated-background";
import Hero from "@/components/hero";
import UploadZone from "@/components/upload-zone";
import ChatPanel from "@/components/chat-panel";
import Sidebar from "@/components/sidebar";
import SourcesPanel, { SourcesToggle } from "@/components/sources-panel";
import type { UploadedDocument, UploadStatus } from "@/types/document";
import type { RetrievedSource } from "@/types/chat";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [sources, setSources] = useState<RetrievedSource[]>([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setSelectedFile(file);
    setError(undefined);
    setUploadStatus("uploading");

    try {
      // Simulate step progression for UI
      await delay(400);
      setUploadStatus("extracting");
      await delay(300);
      setUploadStatus("chunking");

      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus("embedding");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      setUploadStatus("storing");
      await delay(500);

      const data = await res.json();

      setUploadStatus("ready");
      setDocumentId(data.documentId);
      setDocument({
        id: data.documentId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        totalChunks: data.totalChunks,
        uploadedAt: new Date().toISOString(),
        status: "ready",
        extractedTextPreview: data.textPreview,
      });

      // Switch to dashboard
      await delay(800);
      setView("dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setUploadStatus("error");
    }
  }, []);

  const handleClear = useCallback(() => {
    setView("landing");
    setUploadStatus("idle");
    setSelectedFile(null);
    setDocument(null);
    setDocumentId(null);
    setError(undefined);
    setSources([]);
    setSourcesOpen(false);
  }, []);

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-base text-white tracking-tight">
              DocGlow<span className="text-cyan-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {view === "dashboard" && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
            {view === "dashboard" && (
              <button
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                New Document
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="pt-14">
              <Hero onUploadClick={scrollToUpload} />
              <div ref={uploadRef} className="py-16 px-4">
                <UploadZone
                  onFileUpload={handleFileUpload}
                  uploadStatus={uploadStatus}
                  uploadProgress={uploadProgress}
                  selectedFile={selectedFile}
                  onClearFile={handleClear}
                  error={error}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-14 h-screen flex"
          >
            <Sidebar
              document={document}
              onClear={handleClear}
              isOpen={sidebarOpen}
            />
            <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-56px)]">
              <ChatPanel
                documentId={documentId}
                isReady={uploadStatus === "ready"}
                onSourcesUpdate={setSources}
                onOpenSources={() => setSourcesOpen(true)}
              />
            </div>
            <SourcesToggle
              onClick={() => setSourcesOpen(true)}
              sourceCount={sources.length}
            />
            <SourcesPanel
              sources={sources}
              isOpen={sourcesOpen}
              onClose={() => setSourcesOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
