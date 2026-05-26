"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface OpenClawLogoProps {
  size?: number;
  className?: string;
}

export default function OpenClawLogo({ size = 40, className = "" }: OpenClawLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Start with slight rotation to create entry effect
  const initialRotate = mounted ? 0 : -180;

  return (
    <div className="relative">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ originX: "center", originY: "center" }}
      >
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            {/* Orange gradient matching OpenClaw's branding */}
            <linearGradient id="openclaw-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="50%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#ff8c42" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body */}
          <path
            d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
            fill="url(#openclaw-gradient)"
            filter="url(#glow)"
          />

          {/* Left Claw */}
          <path
            d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
            fill="url(#openclaw-gradient)"
            filter="url(#glow)"
          />

          {/* Right Claw */}
          <path
            d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
            fill="url(#openclaw-gradient)"
            filter="url(#glow)"
          />

          {/* Left Antenna */}
          <path
            d="M45 15 Q35 5 30 8"
            stroke="#ff6b35"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right Antenna */}
          <path
            d="M75 15 Q85 5 90 8"
            stroke="#ff6b35"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Eye - white pupil */}
          <circle cx="45" cy="35" r="6" fill="#050810" />
          <circle cx="46" cy="34" r="2.5" fill="#ffffff" />

          {/* Right Eye - white pupil */}
          <circle cx="75" cy="35" r="6" fill="#050810" />
          <circle cx="76" cy="34" r="2.5" fill="#ffffff" />
        </svg>
      </motion.div>
    </div>
  );
}