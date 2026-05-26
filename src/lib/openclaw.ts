const API_BASE = '/api/openclaw';

export interface Agent {
  id: string;
  name: string;
  status: "running" | "idle" | "error" | "stopped";
  isDefault: boolean;
  sessions: {
    path: string;
    count: number;
    recent: Array<{
      key: string;
      updatedAt: number;
      age: number;
    }>;
  };
  lastActive?: string;
  description?: string;
}

export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  timezone: string;
  enabled: boolean;
  nextRun: string;
  nextRunMs: number;
  lastRun: string;
  lastRunStatus: "ok" | "error" | "skipped";
  lastDuration: number;
  consecutiveErrors: number;
  lastError?: string;
  status: "active" | "paused" | "error";
}

export interface GatewayCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

class OpenClawGateway {
  private formatAge(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private formatNextRun(ms: number): string {
    const now = Date.now();
    const diff = ms - now;
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `In ${hours}h`;
    const days = Math.floor(hours / 24);
    return `In ${days}d`;
  }

  async gatewayCall(method: string, params?: Record<string, unknown>): Promise<GatewayCallResult> {
    try {
      const response = await fetch(`${API_BASE}?method=${method}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async getAgents(): Promise<GatewayCallResult> {
    const result = await this.gatewayCall('health');
    if (!result.success) return result;

    const health = result.data as {
      agents: Array<{
        agentId: string;
        name?: string;
        isDefault: boolean;
        heartbeat: { enabled: boolean; every: string };
        sessions: { path: string; count: number; recent: Array<{ key: string; updatedAt: number; age: number }> };
      }>;
    };

    const agents = health.agents.map((a) => ({
      id: a.agentId,
      name: a.name || a.agentId,
      status: 'running' as const,
      isDefault: a.isDefault,
      sessions: a.sessions,
      heartbeat: a.heartbeat,
      lastActive: a.sessions?.count ? `${a.sessions.count} sessions` : 'Active',
      description: `Agent ${a.name || a.agentId}`,
    }));

    return { success: true, data: agents };
  }

  async getCronJobs(): Promise<GatewayCallResult> {
    const result = await this.gatewayCall('cron.list');
    if (!result.success) return result;

    const cronData = result.data as { jobs: Array<{
      id: string;
      name: string;
      description: string;
      enabled: boolean;
      schedule: { kind: string; expr: string; tz?: string };
      state: {
        nextRunAtMs: number;
        lastRunAtMs: number;
        lastRunStatus: 'ok' | 'error' | 'skipped';
        lastDurationMs: number;
        consecutiveErrors: number;
        lastError?: string;
      };
    }> };

    const jobs = cronData.jobs.map((j) => ({
      id: j.id,
      name: j.name,
      description: j.description,
      schedule: j.schedule.expr,
      timezone: j.schedule.tz || 'UTC',
      enabled: j.enabled,
      nextRun: this.formatNextRun(j.state.nextRunAtMs),
      nextRunMs: j.state.nextRunAtMs,
      lastRun: this.formatAge(j.state.lastRunAtMs),
      lastRunStatus: j.state.lastRunStatus,
      lastDuration: j.state.lastDurationMs,
      consecutiveErrors: j.state.consecutiveErrors,
      lastError: j.state.lastError,
      status: j.state.consecutiveErrors > 0 ? 'error' as const : j.enabled ? 'active' as const : 'paused' as const,
    }));

    return { success: true, data: jobs };
  }

  async runCronJob(jobId: string): Promise<GatewayCallResult> {
    return this.gatewayCall('cron.run', { id: jobId });
  }

  async toggleCronJob(jobId: string, enabled: boolean): Promise<GatewayCallResult> {
    return this.gatewayCall(enabled ? 'cron.enable' : 'cron.disable', { id: jobId });
  }

  async deleteCronJob(jobId: string): Promise<GatewayCallResult> {
    return this.gatewayCall('cron.rm', { id: jobId });
  }

  async getStatus(): Promise<{ connected: boolean; error?: string }> {
    const result = await this.gatewayCall('health');
    if (result.success && (result.data as { ok: boolean }).ok) {
      return { connected: true };
    }
    return {
      connected: false,
      error: result.error || 'Gateway not responding',
    };
  }
}

let gatewayInstance: OpenClawGateway | null = null;

export function getOpenClawGateway(): OpenClawGateway {
  if (!gatewayInstance) {
    gatewayInstance = new OpenClawGateway();
  }
  return gatewayInstance;
}

export { OpenClawGateway };
export default OpenClawGateway;