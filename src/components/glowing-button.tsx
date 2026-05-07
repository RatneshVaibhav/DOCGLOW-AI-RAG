"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  id?: string;
}

export default function GlowingButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  type = "button",
  id,
}: GlowingButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-glow active:scale-[0.98]",
    secondary:
      "glass border border-white/10 text-white hover:border-cyan-500/30 hover:shadow-glow-sm active:scale-[0.98]",
    ghost:
      "bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5",
  };

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {variant === "primary" && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
