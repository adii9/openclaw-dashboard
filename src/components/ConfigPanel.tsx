"use client";

import { motion } from "framer-motion";
import { Settings, FileJson, Save, RotateCcw, ChevronRight, Folder, File } from "lucide-react";
import { useState } from "react";

export default function ConfigPanel() {
  const [configTree, setConfigTree] = useState([
    {
      id: "agents",
      label: "agents",
      type: "folder",
      children: [
        { id: "data-processor", label: "data-processor.json", type: "file" },
        { id: "file-watcher", label: "file-watcher.json", type: "file" },
        { id: "api-monitor", label: "api-monitor.json", type: "file" },
      ],
    },
    {
      id: "cron",
      label: "cron",
      type: "folder",
      children: [
        { id: "schedules", label: "schedules.json", type: "file" },
      ],
    },
    {
      id: "openclaw",
      label: "openclaw.config.json",
      type: "file",
    },
    {
      id: "env",
      label: ".env",
      type: "file",
    },
  ]);
  const [selectedFile, setSelectedFile] = useState("openclaw.config.json");
  const [configContent, setConfigContent] = useState(`{
  "name": "openclaw",
  "version": "1.0.0",
  "agents": {
    "maxConcurrent": 5,
    "defaultTimeout": 30000,
    "retryAttempts": 3
  },
  "logging": {
    "level": "info",
    "format": "json",
    "output": "file"
  },
  "security": {
    "enableAuthentication": true,
    "apiKeyRotation": 90
  },
  "performance": {
    "maxMemoryUsage": "512MB",
    "enableCaching": true,
    "cacheTTL": 3600
  }
}`);

  const [expandedFolders, setExpandedFolders] = useState<string[]>(["agents", "cron"]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const renderTree = (items: typeof configTree, depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.05 }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.id);
            } else {
              setSelectedFile(item.label);
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
            selectedFile === item.label
              ? "bg-[--accent-cyan]/10 text-[--accent-cyan]"
              : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated]"
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {item.type === "folder" ? (
            <>
              <ChevronRight
                size={14}
                className={`transition-transform ${expandedFolders.includes(item.id) ? "rotate-90" : ""}`}
              />
              <Folder size={16} />
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File size={16} />
            </>
          )}
          <span className="text-sm">{item.label}</span>
        </motion.button>
        {item.type === "folder" && expandedFolders.includes(item.id) && item.children && (
          <div className="mt-1">{renderTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide">Configuration</h1>
          <p className="text-[--text-muted]">Manage Openclaw settings and agent configurations</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 glass-panel p-4"
        >
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <FileJson size={16} className="text-[--accent-cyan]" />
            Configuration Files
          </h2>
          <div className="space-y-1">{renderTree(configTree)}</div>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 glass-panel p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileJson size={18} className="text-[--accent-cyan]" />
              <h2 className="font-semibold">{selectedFile}</h2>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[--border-subtle] text-sm text-[--text-muted] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors btn-press"
              >
                <RotateCcw size={14} />
                Discard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[--accent-cyan] text-[--bg-deep] text-sm font-medium btn-press"
              >
                <Save size={14} />
                Save Changes
              </motion.button>
            </div>
          </div>

          {/* JSON Editor */}
          <div className="relative">
            <textarea
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              className="w-full h-96 bg-[--bg-input] border border-[--border-subtle] rounded-lg p-4 font-mono text-sm resize-none focus:border-[--accent-cyan] focus:ring-2 focus:ring-[--accent-cyan]/20 transition-all"
              spellCheck={false}
            />
            {/* Line numbers overlay (decorative) */}
            <div className="absolute left-4 top-4 bottom-4 w-8 text-right font-mono text-xs text-[--text-dim] pointer-events-none">
              {configContent.split("\n").map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Validation */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-[--accent-emerald]" />
              <span className="text-[--text-muted]">Valid JSON</span>
            </div>
            <div className="text-sm text-[--text-muted]">
              Last modified: Just now
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}