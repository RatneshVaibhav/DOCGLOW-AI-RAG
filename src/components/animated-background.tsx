"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#030712]" />

      {/* Large ambient glow blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, -50, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
