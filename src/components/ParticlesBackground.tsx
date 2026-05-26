"use client";

import { useEffect, useState } from "react";

interface ParticleData {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  color: string;
}

export default function ParticlesBackground() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const colors = isDark
      ? ["#00f0ff", "#a855f7", "#f59e0b"]
      : ["#0891b2", "#7c3aed", "#b45309"];
    const data: ParticleData[] = [];
    for (let i = 0; i < 800; i++) {
      data.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 6 + 3,
        delay: Math.random() * 8,
        color: colors[i % 3],
      });
    }
    setParticles(data);
  }, []);

  return (
    <div
      className="particles-container"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle particle-${p.id % 8}`}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: 0.7,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        .particles-container .particle {
          animation: particle-float 15s ease-in-out infinite;
        }
        .particles-container .particle-0 { --x-move: 20px; --y-move: -40px; }
        .particles-container .particle-1 { --x-move: -25px; --y-move: -35px; }
        .particles-container .particle-2 { --x-move: 30px; --y-move: -50px; }
        .particles-container .particle-3 { --x-move: -15px; --y-move: -45px; }
        .particles-container .particle-4 { --x-move: 25px; --y-move: -30px; }
        .particles-container .particle-5 { --x-move: -30px; --y-move: -55px; }
        .particles-container .particle-6 { --x-move: 15px; --y-move: -40px; }
        .particles-container .particle-7 { --x-move: -20px; --y-move: -35px; }

        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
          }
          25% {
            transform: translate(var(--x-move), var(--y-move)) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translate(calc(var(--x-move) * 0.5), calc(var(--y-move) * 1.2)) scale(0.9);
            opacity: 0.6;
          }
          75% {
            transform: translate(calc(var(--x-move) * -0.5), calc(var(--y-move) * 0.8)) scale(1.1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}