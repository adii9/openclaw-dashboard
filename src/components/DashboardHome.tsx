"use client";

import { motion } from "framer-motion";
import { Bot, Clock, ArrowRight } from "lucide-react";
import AgentCard from "./AgentCard";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: "running" | "idle" | "error" | "stopped";
  lastActive: string;
  description: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: "active" | "paused" | "error";
}

interface DashboardHomeProps {
  agents: Agent[];
  cronJobs: CronJob[];
}

export default function DashboardHome({ agents, cronJobs }: DashboardHomeProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const activeAgents = agents.filter((a) => a.status === "running").length;
  const activeCrons = cronJobs.filter((c) => c.status === "active").length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold tracking-wide">
          Welcome back
        </h1>
        <p className="text-[--text-muted] mt-2">
          Your Openclaw agents are running smoothly.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bot size={18} className="text-[--accent-cyan]" />
            <span className="text-sm text-[--text-muted]">Agents</span>
          </div>
          <span className="text-2xl font-bold">{activeAgents}</span>
          <span className="text-[--text-muted] text-sm"> / {agents.length}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock size={18} className="text-[--accent-amber]" />
            <span className="text-sm text-[--text-muted]">Schedules</span>
          </div>
          <span className="text-2xl font-bold">{activeCrons}</span>
          <span className="text-[--text-muted] text-sm"> / {cronJobs.length}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bot size={18} className="text-[--accent-emerald]" />
            <span className="text-sm text-[--text-muted]">Sessions</span>
          </div>
          <span className="text-2xl font-bold">-</span>
        </motion.div>
      </div>

      {/* Agents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Your Agents</h2>
          <button className="text-sm text-[--accent-cyan] hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>

        {agents.length > 0 ? (
          <div className="space-y-2">
            {agents.slice(0, 4).map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} onSelect={setSelectedAgent} />
            ))}
          </div>
        ) : (
          <div className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-8 text-center">
            <Bot size={32} className="mx-auto mb-3 text-[--text-dim]" />
            <p className="text-[--text-muted]">No agents found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
