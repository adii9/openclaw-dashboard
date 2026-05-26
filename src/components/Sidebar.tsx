"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  History,
  Sparkles,
} from "lucide-react";
import ThemeButton from "./ThemeButton";

type NavSection = "dashboard" | "agents" | "cron" | "chat";

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  connectionStatus: "connected" | "disconnected";
  activeAgents: number;
  totalAgents: number;
}

const navItems = [
  { id: "dashboard" as NavSection, label: "Dashboard", icon: LayoutDashboard },
  { id: "agents" as NavSection, label: "Agents", icon: Bot },
  { id: "cron" as NavSection, label: "Schedules", icon: History },
  { id: "chat" as NavSection, label: "Chat", icon: Sparkles },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  connectionStatus,
  activeAgents,
  totalAgents,
}: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-56 bg-[--bg-panel] border-r border-[--border-subtle] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-5 border-b border-[--border-subtle]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--accent-cyan] to-[--accent-violet] flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">Openclaw</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[--accent-cyan]/10 text-[--accent-cyan]"
                  : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated]"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[--accent-cyan]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-[--border-subtle] space-y-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-[--accent-emerald]"
                : "bg-[--accent-rose]"
            }`}
          />
          <span className="text-xs text-[--text-muted]">
            {connectionStatus === "connected" ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Agents Count */}
        <div className="text-xs text-[--text-muted]">
          <span className="text-[--accent-cyan] font-medium">{activeAgents}</span>
          <span> / </span>
          <span>{totalAgents}</span>
          <span> agents active</span>
        </div>

        {/* Theme Toggle */}
        <ThemeButton />
      </div>
    </motion.aside>
  );
}
