"use client";

import { motion } from "framer-motion";
import { Bot, Clock, ArrowRight, Zap, Image, Music, Video, FileText, Mic, Code } from "lucide-react";
import AgentCard from "./AgentCard";
import { useState, useEffect } from "react";

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

interface ModelQuota {
  model_name: string;
  current_interval_total_count: number;
  current_interval_usage_count: number;
  current_weekly_total_count: number;
  current_weekly_usage_count: number;
  weekly_remains_time: number;
}

interface QuotaData {
  model_remains: ModelQuota[];
}

const modelIcons: Record<string, React.ElementType> = {
  "MiniMax-M*": FileText,
  "speech-hd": Mic,
  "MiniMax-Hailuo-2.3-Fast-6s-768p": Video,
  "MiniMax-Hailuo-2.3-6s-768p": Video,
  "music-2.5": Music,
  "music-2.6": Music,
  "music-cover": Music,
  "lyrics_generation": Music,
  "image-01": Image,
  "coding-plan-vlm": Code,
  "coding-plan-search": Code,
};

const modelColors: Record<string, string> = {
  "MiniMax-M*": "from-[#ff6b35] to-[#ff8c42]",
  "speech-hd": "from-[#00f0ff] to-[#0891b2]",
  "MiniMax-Hailuo-2.3-Fast-6s-768p": "from-[#a855f7] to-[#9333ea]",
  "MiniMax-Hailuo-2.3-6s-768p": "from-[#a855f7] to-[#9333ea]",
  "music-2.5": "from-[#10b981] to-[#059669]",
  "music-2.6": "from-[#10b981] to-[#059669]",
  "music-cover": "from-[#10b981] to-[#059669]",
  "lyrics_generation": "from-[#10b981] to-[#059669]",
  "image-01": "from-[#a855f7] to-[#9333ea]",
  "coding-plan-vlm": "from-[#00f0ff] to-[#0891b2]",
  "coding-plan-search": "from-[#00f0ff] to-[#0891b2]",
};

export default function DashboardHome({ agents, cronJobs }: DashboardHomeProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const activeAgents = agents.filter((a) => a.status === "running").length;
  const activeCrons = cronJobs.filter((c) => c.status === "active").length;

  useEffect(() => {
    fetch('/api/openclaw?method=mmx.quota')
      .then(res => res.json())
      .then(data => {
        if (data.model_remains) {
          setQuotaData(data);
        }
      })
      .catch(console.error);
  }, []);

  const mainModel = quotaData?.model_remains?.find(m => m.model_name === "MiniMax-M*");
  const dailyRemaining = mainModel ? mainModel.current_interval_total_count - mainModel.current_interval_usage_count : null;
  const dailyTotal = mainModel?.current_interval_total_count || 0;
  const dailyUsed = mainModel?.current_interval_usage_count || 0;
  const dailyPercent = dailyTotal > 0 ? Math.round((dailyUsed / dailyTotal) * 100) : 0;

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (n: number) => n.toLocaleString();

  // Filter models that have actual quotas (either interval or weekly > 0)
  const activeModels = quotaData?.model_remains?.filter(m =>
    m.current_interval_total_count > 0 || m.current_weekly_total_count > 0
  ) || [];

  return (
    <div className="max-w-6xl">
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
      <div className="grid grid-cols-4 gap-4 mb-8">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-[#ff6b35]" />
            <span className="text-sm text-[--text-muted]">Daily Quota</span>
          </div>
          {dailyRemaining !== null ? (
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-[#ff6b35]">{dailyRemaining.toLocaleString()}</span>
              <span className="text-[--text-dim] text-sm mb-1">left</span>
            </div>
          ) : (
            <span className="text-2xl font-bold">-</span>
          )}
          <div className="mt-2 h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]"
            />
          </div>
        </motion.div>
      </div>

      {/* Agents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
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

      {/* Quota Details - Model Breakdown */}
      {activeModels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">API Quota</h2>
            <span className="text-xs text-[--text-dim]">Resets in {formatTimeRemaining(mainModel?.weekly_remains_time || 0)}</span>
          </div>

          <div className="space-y-2">
            {activeModels.map((model, index) => {
              const Icon = modelIcons[model.model_name] || Zap;
              const colorClass = modelColors[model.model_name] || "from-[--accent-cyan] to-[--accent-violet]";

              const dailyUsed = model.current_interval_usage_count;
              const dailyTotal = model.current_interval_total_count;
              const dailyPct = dailyTotal > 0 ? Math.round((dailyUsed / dailyTotal) * 100) : 0;

              const weeklyUsed = model.current_weekly_usage_count;
              const weeklyTotal = model.current_weekly_total_count;

              return (
                <motion.div
                  key={model.model_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.03 }}
                  className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4 hover:border-[--border-glow] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm truncate">{model.model_name}</h3>
                        <span className="text-xs text-[--text-dim] whitespace-nowrap ml-4">
                          {dailyUsed.toLocaleString()} / {dailyTotal.toLocaleString()} — {dailyPct}%
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[--text-dim]">Daily</span>
                            <span className="text-[--text-muted]">{dailyPct}%</span>
                          </div>
                          <div className="h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${dailyPct}%` }}
                              transition={{ duration: 0.5, delay: 0.6 + index * 0.03 }}
                              className={`h-full bg-gradient-to-r ${colorClass}`}
                            />
                          </div>
                        </div>

                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[--text-dim]">Weekly</span>
                            <span className="text-[--text-muted]">{weeklyUsed.toLocaleString()} / {weeklyTotal.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${weeklyTotal > 0 ? (weeklyUsed / weeklyTotal) * 100 : 0}%` }}
                              transition={{ duration: 0.5, delay: 0.6 + index * 0.03 }}
                              className={`h-full bg-gradient-to-r ${colorClass} opacity-60`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
