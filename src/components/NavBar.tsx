"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Clock,
  MessageSquare,
  Activity,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import ThemeButton from "./ThemeButton";
import OpenClawLogo from "./OpenClawLogo";

type NavSection = "dashboard" | "agents" | "cron" | "chat";

interface NavBarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  connectionStatus?: "connected" | "disconnected";
  lastSync?: string;
  activeAgents?: number;
  totalAgents?: number;
}

const navItems: { id: NavSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "cron", label: "Cron Jobs", icon: Clock },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

export default function NavBar({
  activeSection,
  onSectionChange,
  connectionStatus = "connected",
  lastSync = "Just now",
  activeAgents = 3,
  totalAgents = 5,
}: NavBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[--border-subtle]"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <OpenClawLogo size={40} />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-[--text-primary]">
            OPENCLAW
          </span>
        </motion.div>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors btn-press
                  ${isActive
                    ? "text-[--accent-cyan]"
                    : "text-[--text-muted] hover:text-[--text-primary]"
                  }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[--accent-cyan]"
                    style={{ boxShadow: "0 0 10px var(--accent-cyan)" }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right side - Theme, Status */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeButton />

          {/* Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden sm:flex items-center gap-3 text-sm"
          >
            <div className="w-px h-4 bg-[--border-subtle]" />
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" ? (
                <Wifi size={16} className="text-[--accent-emerald]" />
              ) : (
                <WifiOff size={16} className="text-[--accent-rose]" />
              )}
              <span className="text-[--text-muted]">
                {connectionStatus === "connected" ? "Online" : "Offline"}
              </span>
            </div>
            <div className="w-px h-4 bg-[--border-subtle]" />
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[--accent-cyan]" />
              <span className="text-[--text-muted]">
                {activeAgents}/{totalAgents} agents
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile nav - bottom fixed */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-[--border-subtle] px-2 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors
                  ${isActive ? "text-[--accent-cyan]" : "text-[--text-muted]"}`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}