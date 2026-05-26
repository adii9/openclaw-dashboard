"use client";

import { motion } from "framer-motion";
import { Gauge, Clock, Zap, Image, Music, Video, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface ModelQuota {
  modelName: string;
  currentIntervalTotalCount: number;
  currentIntervalUsageCount: number;
  currentWeeklyTotalCount: number;
  currentWeeklyUsageCount: number;
  weeklyRemainsTime: number;
}

interface CategoryQuota {
  category: string;
  displayName: string;
  currentIntervalTotalCount: number;
  currentIntervalUsageCount: number;
  currentWeeklyTotalCount: number;
  currentWeeklyUsageCount: number;
}

interface QuotaData {
  model_remains: ModelQuota[];
  category_remains: CategoryQuota[];
}

const iconMap: Record<string, React.ElementType> = {
  text_generation: FileText,
  speech_generation: Zap,
  image_generation: Image,
  music_generation: Music,
  video_generation: Video,
  coding_plan_vlm: Image,
  coding_plan_search: Zap,
};

const colorMap: Record<string, string> = {
  text_generation: "from-[#ff6b35] to-[#ff8c42]",
  speech_generation: "from-[#00f0ff] to-[#0891b2]",
  image_generation: "from-[#a855f7] to-[#9333ea]",
  music_generation: "from-[#10b981] to-[#059669]",
  video_generation: "from-[#f59e0b] to-[#d97706]",
  coding_plan_vlm: "from-[#00f0ff] to-[#0891b2]",
  coding_plan_search: "from-[#00f0ff] to-[#0891b2]",
};

export default function QuotaPanel() {
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchQuota = async () => {
    try {
      const response = await fetch("/api/openclaw?method=mmx.quota");
      const data = await response.json();

      if (data.base_resp?.status_msg === "success") {
        setQuotaData(data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || "Failed to fetch quota");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

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
          onClick={fetchQuota}
          className="px-4 py-2 bg-[--accent-cyan] text-[--bg-deep] rounded-lg font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const mainModel = quotaData?.model_remains?.find(m => m.model_name === "MiniMax-M*");
  const mainUsage = mainModel ? getPercentage(mainModel.current_interval_usage_count, mainModel.current_interval_total_count) : 0;
  const mainWeeklyUsage = mainModel ? getPercentage(mainModel.current_weekly_usage_count, mainModel.current_weekly_total_count) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
              <Gauge size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Usage Quota</h1>
              <p className="text-sm text-[--text-muted]">MiniMax API limits</p>
            </div>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-[--text-dim]">
              <Clock size={12} />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Model Card */}
      {mainModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-hover p-6 rounded-2xl border border-[--border-subtle] bg-[--bg-panel]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">MiniMax-M*</h2>
                <p className="text-xs text-[--text-muted]">Primary Model</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#ff6b35]">
                {formatNumber(mainModel.current_interval_total_count - mainModel.current_interval_usage_count)}
              </div>
              <div className="text-xs text-[--text-dim]">remaining today</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Daily Usage */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[--text-muted]">Daily Usage</span>
                <span className="font-medium">{mainModel.current_interval_usage_count} / {mainModel.current_interval_total_count}</span>
              </div>
              <div className="h-2 bg-[--bg-elevated] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mainUsage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]"
                />
              </div>
            </div>

            {/* Weekly Usage */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[--text-muted]">Weekly Usage</span>
                <span className="font-medium">{mainModel.current_weekly_usage_count} / {formatNumber(mainModel.current_weekly_total_count)}</span>
              </div>
              <div className="h-2 bg-[--bg-elevated] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mainWeeklyUsage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[--accent-cyan] to-[--accent-violet]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotaData?.category_remains?.filter(c => c.current_weekly_total_count > 0).map((category, index) => {
          const Icon = iconMap[category.category] || Gauge;
          const gradient = colorMap[category.category] || "from-[--accent-cyan] to-[--accent-violet]";
          const usage = getPercentage(category.current_weekly_usage_count, category.current_weekly_total_count);
          const remaining = category.current_weekly_total_count - category.current_weekly_usage_count;

          return (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4 hover:border-[--border-glow] transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{category.display_name}</h3>
                  <p className="text-xs text-[--text-dim]">Resets in {formatTimeRemaining(category.weekly_remains_time)}</p>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold">{formatNumber(remaining)}</div>
                  <div className="text-xs text-[--text-muted]">remaining</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{usage}%</div>
                  <div className="text-xs text-[--text-dim]">used</div>
                </div>
              </div>

              <div className="mt-3 h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 }}
                  className={`h-full bg-gradient-to-r ${gradient}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Model Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[--bg-panel] border border-[--border-subtle] rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-[--border-subtle]">
          <h3 className="font-medium text-sm">All Models</h3>
        </div>
        <div className="divide-y divide-[--border-subtle]">
          {quotaData?.model_remains?.filter(m => m.current_weekly_total_count > 0 || m.current_interval_total_count > 0).map((model) => {
            const dailyPct = getPercentage(model.current_interval_usage_count, model.current_interval_total_count);
            const weeklyPct = getPercentage(model.current_weekly_usage_count, model.current_weekly_total_count);

            return (
              <div key={model.model_name} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{model.model_name}</div>
                  <div className="text-xs text-[--text-muted]">
                    Daily: {model.current_interval_usage_count}/{model.current_interval_total_count} |
                    Weekly: {model.current_weekly_usage_count}/{formatNumber(model.current_weekly_total_count)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff6b35]/60 rounded-full" style={{ width: `${dailyPct}%` }} />
                  </div>
                  <span className="text-xs text-[--text-dim] w-12 text-right">{dailyPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}