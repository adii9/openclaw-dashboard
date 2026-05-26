"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHome from "@/components/DashboardHome";
import AgentsPanel from "@/components/AgentsPanel";
import CronPanel from "@/components/CronPanel";
import ChatPanel from "@/components/ChatPanel";
import { getOpenClawGateway, Agent, CronJob } from "@/lib/openclaw";

type NavSection = "dashboard" | "agents" | "cron" | "chat";

// Local simplified types for UI
interface UIAgent {
  id: string;
  name: string;
  status: "running" | "idle" | "error" | "stopped";
  lastActive: string;
  description: string;
}

interface UICronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: "active" | "paused" | "error";
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [agents, setAgents] = useState<UIAgent[]>([]);
  const [cronJobs, setCronJobs] = useState<UICronJob[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");
  const [lastSync, setLastSync] = useState<string>("Never");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const gateway = getOpenClawGateway();

    // Fetch status
    const status = await gateway.getStatus();
    setConnectionStatus(status.connected ? "connected" : "disconnected");

    if (status.connected) {
      try {
        // Fetch agents
        const agentsResult = await gateway.getAgents();
        if (agentsResult.success && agentsResult.data) {
          const openclawAgents = agentsResult.data as Agent[];
          setAgents(openclawAgents.map((a) => ({
            id: a.id,
            name: a.name,
            status: "running" as const,
            lastActive: a.lastActive || "Active",
            description: a.description || `Agent ${a.name}`,
          })));
        }

        // Fetch cron jobs
        const cronResult = await gateway.getCronJobs();
        if (cronResult.success && cronResult.data) {
          const openclawCrons = cronResult.data as CronJob[];
          setCronJobs(openclawCrons.map((c) => ({
            id: c.id,
            name: c.name,
            schedule: c.schedule,
            nextRun: c.nextRun,
            lastRun: c.lastRun,
            status: c.status,
          })));
        }

        setLastSync("Just now");
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    }

    setLoading(false);
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle cron job actions
  const handleCronAction = async (action: "run" | "enable" | "disable" | "delete", jobId: string) => {
    const gateway = getOpenClawGateway();

    switch (action) {
      case "run":
        await gateway.runCronJob(jobId);
        break;
      case "enable":
        await gateway.toggleCronJob(jobId, true);
        break;
      case "disable":
        await gateway.toggleCronJob(jobId, false);
        break;
      case "delete":
        await gateway.deleteCronJob(jobId);
        break;
    }

    // Refresh data
    fetchData();
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[--accent-cyan] border-t-transparent rounded-full"
          />
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass-panel p-8 text-center">
          <p className="text-[--accent-rose] mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[--accent-cyan] text-[--bg-deep] rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return <DashboardHome agents={agents} cronJobs={cronJobs} />;
      case "agents":
        return <AgentsPanel agents={agents} />;
      case "cron":
        return <CronPanel cronJobs={cronJobs} onAction={handleCronAction} />;
      case "chat":
        return <ChatPanel />;
      default:
        return <DashboardHome agents={agents} cronJobs={cronJobs} />;
    }
  };

  return (
    <div className="min-h-screen bg-[--bg-deep]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        connectionStatus={connectionStatus}
        activeAgents={agents.filter((a) => a.status === "running").length}
        totalAgents={agents.length}
      />

      <main className="ml-56 min-h-screen p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}