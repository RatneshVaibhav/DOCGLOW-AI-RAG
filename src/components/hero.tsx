"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GlowingButton from "./glowing-button";
import { Sparkles, Upload } from "lucide-react";

const Hero3D = dynamic(() => import("./hero-3d"), { ssr: false });

interface HeroProps {
  onUploadClick: () => void;
}

export default function Hero({ onUploadClick }: HeroProps) {
  return (
    <section
      id="hero-section"
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/20 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">
            AI-Powered Document Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          <span className="gradient-text-vivid">Talk To Your</span>
          <br />
          <span className="text-white glow-text">Documents</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload PDFs and chat with them using grounded AI retrieval.
          <br className="hidden sm:block" />
          Powered by advanced RAG technology for accurate, source-cited answers.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <GlowingButton
            id="hero-upload-button"
            variant="primary"
            size="lg"
            onClick={onUploadClick}
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </GlowingButton>
          <GlowingButton
            id="hero-demo-button"
            variant="secondary"
            size="lg"
            onClick={onUploadClick}
          >
            <Sparkles className="w-5 h-5" />
            Try Demo
          </GlowingButton>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16 text-sm text-slate-500"
        >
          {["PDF & TXT Support", "GPT-4.1 Mini", "Real-time Streaming", "Source Citations"].map(
            (feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-500" />
                {feature}
              </div>
            )
          )}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
