"use client";

import { motion } from "framer-motion";
import { Clock, Play, Pause, Edit2, Trash2, Plus, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: "active" | "paused" | "error";
}

interface CronPanelProps {
  cronJobs: CronJob[];
  onAction: (action: "run" | "enable" | "disable" | "delete", jobId: string) => Promise<void>;
}

const statusConfig = {
  active: { icon: CheckCircle, color: "text-[--accent-emerald]", bg: "bg-[--accent-emerald]/10" },
  paused: { icon: Pause, color: "text-[--accent-amber]", bg: "bg-[--accent-amber]/10" },
  error: { icon: XCircle, color: "text-[--accent-rose]", bg: "bg-[--accent-rose]/10" },
};

export default function CronPanel({ cronJobs, onAction }: CronPanelProps) {
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide">Cron Jobs</h1>
          <p className="text-[--text-muted]">Schedule and manage recurring tasks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--accent-cyan] text-[--bg-deep] font-medium hover:bg-[--accent-cyan]/90 transition-colors btn-press"
        >
          <Plus size={18} />
          <span>New Job</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[--accent-emerald]/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-[--accent-emerald]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{cronJobs.filter(c => c.status === "active").length}</p>
              <p className="text-sm text-[--text-muted]">Active Jobs</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[--accent-amber]/20 flex items-center justify-center">
              <Pause size={20} className="text-[--accent-amber]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{cronJobs.filter(c => c.status === "paused").length}</p>
              <p className="text-sm text-[--text-muted]">Paused</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[--accent-rose]/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-[--accent-rose]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{cronJobs.filter(c => c.status === "error").length}</p>
              <p className="text-sm text-[--text-muted]">Errors</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Jobs Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-panel overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[--border-subtle]">
                <th className="text-left p-4 text-sm font-semibold text-[--text-muted]">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-[--text-muted]">Schedule</th>
                <th className="text-left p-4 text-sm font-semibold text-[--text-muted]">Next Run</th>
                <th className="text-left p-4 text-sm font-semibold text-[--text-muted]">Last Run</th>
                <th className="text-left p-4 text-sm font-semibold text-[--text-muted]">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-[--text-muted]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cronJobs.map((job, index) => {
                const StatusIcon = statusConfig[job.status].icon;
                return (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-[--border-subtle] hover:bg-[--bg-elevated]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[--accent-cyan]/10 flex items-center justify-center">
                          <Clock size={16} className="text-[--accent-cyan]" />
                        </div>
                        <span className="font-medium">{job.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-[--bg-input] px-2 py-1 rounded font-mono">
                        {job.schedule}
                      </code>
                    </td>
                    <td className="p-4 text-sm text-[--text-muted]">{job.nextRun}</td>
                    <td className="p-4 text-sm text-[--text-muted]">{job.lastRun}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[job.status].bg} ${statusConfig[job.status].color}`}>
                        <StatusIcon size={12} />
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setActionLoading(job.id + "-run");
                            await onAction("run", job.id);
                            setActionLoading(null);
                          }}
                          disabled={actionLoading === job.id + "-run"}
                          className="p-2 rounded-lg hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--accent-emerald] transition-colors disabled:opacity-50"
                          title="Run now"
                        >
                          <Play size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setActionLoading(job.id + "-toggle");
                            await onAction(job.status === "active" ? "disable" : "enable", job.id);
                            setActionLoading(null);
                          }}
                          disabled={actionLoading === job.id + "-toggle"}
                          className="p-2 rounded-lg hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--accent-amber] transition-colors disabled:opacity-50"
                          title={job.status === "active" ? "Pause" : "Resume"}
                        >
                          {job.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete this cron job?")) {
                              setActionLoading(job.id + "-delete");
                              await onAction("delete", job.id);
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === job.id + "-delete"}
                          className="p-2 rounded-lg hover:bg-[--accent-rose]/10 text-[--text-muted] hover:text-[--accent-rose] transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Empty State */}
      {cronJobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[--bg-elevated] mx-auto mb-4 flex items-center justify-center">
            <Clock size={32} className="text-[--text-muted]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cron jobs yet</h3>
          <p className="text-[--text-muted] mb-4">Create your first scheduled task to get started</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-[--accent-cyan] text-[--bg-deep] font-medium btn-press"
          >
            Create Job
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}