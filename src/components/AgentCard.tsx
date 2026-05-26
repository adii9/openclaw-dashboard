"use client";

import { motion } from "framer-motion";
import { Bot, Clock, AlertTriangle, CheckCircle, XCircle, Play, Pause, Trash2 } from "lucide-react";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: "running" | "idle" | "error" | "stopped";
  lastActive: string;
  description: string;
}

interface AgentCardProps {
  agent: Agent;
  index: number;
  onSelect: (agent: Agent) => void;
}

const statusConfig = {
  running: {
    color: "text-[--accent-emerald]",
    bg: "bg-[--accent-emerald]",
    icon: Play,
    label: "Running",
    pulse: true,
  },
  idle: {
    color: "text-[--accent-amber]",
    bg: "bg-[--accent-amber]",
    icon: Pause,
    label: "Idle",
    pulse: false,
  },
  error: {
    color: "text-[--accent-rose]",
    bg: "bg-[--accent-rose]",
    icon: XCircle,
    label: "Error",
    pulse: true,
  },
  stopped: {
    color: "text-[--text-muted]",
    bg: "bg-[--text-muted]",
    icon: Pause,
    label: "Stopped",
    pulse: false,
  },
};

export default function AgentCard({ agent, index, onSelect }: AgentCardProps) {
  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onSelect(agent)}
      className="glass-panel corner-brackets p-5 cursor-pointer transition-all duration-300 hover:border-[--border-glow]"
      style={{ "--hover-glow": "0 0 30px rgba(0, 240, 255, 0.2)" } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${config.bg}/20 flex items-center justify-center`}>
            <Bot size={20} className={config.color} />
          </div>
          <div>
            <h3 className="font-semibold text-[--text-primary]">{agent.name}</h3>
            <p className="text-sm text-[--text-muted]">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`relative flex items-center gap-2 px-2 py-1 rounded-full ${config.bg}/10`}>
            <div className={`w-2 h-2 rounded-full ${config.bg} ${config.pulse ? "pulse-glow" : ""}`}
                 style={{ color: config.bg }} />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>
        </div>
        <span className="text-xs text-[--text-muted]">Last: {agent.lastActive}</span>
      </div>
    </motion.div>
  );
}