"use client";

import { motion } from "framer-motion";
import { Bot, Play, Pause, Square, Terminal, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: "running" | "idle" | "error" | "stopped";
  lastActive: string;
  description: string;
}

interface AgentsPanelProps {
  agents: Agent[];
}

export default function AgentsPanel({ agents }: AgentsPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide">Agents</h1>
          <p className="text-[--text-muted]">Manage and monitor all your Openclaw agents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--accent-cyan] text-[--bg-deep] font-medium hover:bg-[--accent-cyan]/90 transition-colors btn-press"
        >
          <Plus size={18} />
          <span>New Agent</span>
        </motion.button>
      </motion.div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedAgent(agent)}
            className={`glass-panel corner-brackets p-5 cursor-pointer transition-all duration-300 ${
              selectedAgent?.id === agent.id ? "border-[--accent-cyan]" : "hover:border-[--border-glow]"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  agent.status === "running" ? "bg-[--accent-emerald]/20" :
                  agent.status === "error" ? "bg-[--accent-rose]/20" :
                  agent.status === "idle" ? "bg-[--accent-amber]/20" :
                  "bg-[--text-muted]/20"
                }`}>
                  <Bot size={24} className={
                    agent.status === "running" ? "text-[--accent-emerald]" :
                    agent.status === "error" ? "text-[--accent-rose]" :
                    agent.status === "idle" ? "text-[--accent-amber]" :
                    "text-[--text-muted]"
                  } />
                </div>
                <div>
                  <h3 className="font-semibold text-[--text-primary]">{agent.name}</h3>
                  <p className="text-xs text-[--text-muted]">ID: {agent.id}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[--text-muted] mb-4">{agent.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === "running" ? "bg-[--accent-emerald]/10 text-[--accent-emerald]" :
                  agent.status === "error" ? "bg-[--accent-rose]/10 text-[--accent-rose]" :
                  agent.status === "idle" ? "bg-[--accent-amber]/10 text-[--accent-amber]" :
                  "bg-[--text-muted]/10 text-[--text-muted]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    agent.status === "running" ? "bg-[--accent-emerald] pulse-glow" :
                    agent.status === "error" ? "bg-[--accent-rose] pulse-glow" :
                    agent.status === "idle" ? "bg-[--accent-amber]" :
                    "bg-[--text-muted]"
                  }`} />
                  {agent.status}
                </span>
              </div>
              <span className="text-xs text-[--text-muted]">{agent.lastActive}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent Detail Panel */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed right-0 top-16 bottom-0 w-full max-w-md glass-panel border-l border-[--border-subtle] p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Agent Details</h2>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-[--text-muted] hover:text-[--text-primary]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Agent Info */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                selectedAgent.status === "running" ? "bg-[--accent-emerald]/20" :
                selectedAgent.status === "error" ? "bg-[--accent-rose]/20" :
                "bg-[--bg-elevated]"
              }`}>
                <Bot size={32} className={
                  selectedAgent.status === "running" ? "text-[--accent-emerald]" :
                  selectedAgent.status === "error" ? "text-[--accent-rose]" :
                  "text-[--text-muted]"
                } />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedAgent.name}</h3>
                <p className="text-sm text-[--text-muted]">{selectedAgent.description}</p>
              </div>
            </div>

            {/* Status */}
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[--text-muted]">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAgent.status === "running" ? "bg-[--accent-emerald]/10 text-[--accent-emerald]" :
                  selectedAgent.status === "error" ? "bg-[--accent-rose]/10 text-[--accent-rose]" :
                  selectedAgent.status === "idle" ? "bg-[--accent-amber]/10 text-[--accent-amber]" :
                  "bg-[--text-muted]/10 text-[--text-muted]"
                }`}>
                  {selectedAgent.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--accent-emerald] text-[--bg-deep] font-medium btn-press"
              >
                <Play size={16} />
                Start
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--accent-amber] text-[--bg-deep] font-medium btn-press"
              >
                <Pause size={16} />
                Pause
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--accent-rose] text-white font-medium btn-press"
              >
                <Square size={16} />
                Stop
              </motion.button>
            </div>

            {/* Logs Section */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Terminal size={14} />
                Recent Logs
              </h4>
              <div className="bg-[--bg-input] rounded-lg p-4 font-mono text-xs overflow-y-auto max-h-48">
                {selectedAgent.status === "running" ? (
                  <>
                    <p className="text-[--accent-emerald]">[12:34:56] INFO: Agent started successfully</p>
                    <p className="text-[--text-muted]">[12:34:57] INFO: Processing data stream...</p>
                    <p className="text-[--text-muted]">[12:34:58] INFO: Task completed in 2.3ms</p>
                  </>
                ) : selectedAgent.status === "error" ? (
                  <>
                    <p className="text-[--accent-rose]">[12:34:56] ERROR: Connection failed</p>
                    <p className="text-[--text-muted]">[12:34:57] INFO: Retrying in 5s...</p>
                    <p className="text-[--accent-rose]">[12:35:02] ERROR: Max retries exceeded</p>
                  </>
                ) : (
                  <p className="text-[--text-muted]">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}