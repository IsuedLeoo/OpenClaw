import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import {
  Play,
  Square,
  RotateCw,
  Activity,
  MessageSquare,
  Shield,
  Cpu,
  HardDrive,
  Clock,
  Send,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function DashboardPage() {
  const { runtime, metrics, telegram } = useAppStore();

  const handleStart = async () => {
    try {
      await invoke("runtime_start");
    } catch (e) {
      console.error("Failed to start runtime:", e);
    }
  };

  const handleStop = async () => {
    try {
      await invoke("runtime_stop");
    } catch (e) {
      console.error("Failed to stop runtime:", e);
    }
  };

  const handleRestart = async () => {
    try {
      await invoke("runtime_restart");
    } catch (e) {
      console.error("Failed to restart runtime:", e);
    }
  };

  const formatUptime = (seconds: number | null) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Agent control center" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Agent Status Card */}
        <div className="bg-surface-1 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  runtime.status === "running" && "bg-success/15",
                  runtime.status === "stopped" && "bg-zinc-800",
                  runtime.status === "error" && "bg-danger/15",
                  (runtime.status === "starting" ||
                    runtime.status === "stopping" ||
                    runtime.status === "installing") &&
                    "bg-warning/15",
                )}
              >
                <Activity
                  size={24}
                  className={cn(
                    runtime.status === "running" && "text-success",
                    runtime.status === "stopped" && "text-zinc-500",
                    runtime.status === "error" && "text-danger",
                    (runtime.status === "starting" ||
                      runtime.status === "stopping" ||
                      runtime.status === "installing") &&
                      "text-warning animate-pulse",
                  )}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">
                  OpenClaw Agent
                </h2>
                <p className="text-sm text-zinc-500">
                  {runtime.version
                    ? `v${runtime.version}`
                    : "Not installed"}
                  {" · "}
                  <span className="capitalize">{runtime.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {runtime.status === "stopped" || runtime.status === "error" ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Play size={16} />
                  Start Agent
                </button>
              ) : runtime.status === "running" ? (
                <>
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                  >
                    <RotateCw size={16} />
                    Restart
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-3 py-2 bg-danger/15 hover:bg-danger/25 text-danger rounded-lg text-sm transition-colors"
                  >
                    <Square size={16} />
                    Stop
                  </button>
                </>
              ) : (
                <div className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-sm">
                  {runtime.status === "starting"
                    ? "Starting..."
                    : runtime.status === "stopping"
                      ? "Stopping..."
                      : "Installing..."}
                </div>
              )}
            </div>
          </div>

          {runtime.error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              {runtime.error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Clock}
              label="Uptime"
              value={formatUptime(runtime.uptime)}
            />
            <StatCard
              icon={Cpu}
              label="CPU"
              value={
                metrics ? `${metrics.cpuPercent.toFixed(1)}%` : "—"
              }
            />
            <StatCard
              icon={HardDrive}
              label="Memory"
              value={
                metrics ? `${metrics.memoryMb.toFixed(0)} MB` : "—"
              }
            />
            <StatCard
              icon={MessageSquare}
              label="Requests/min"
              value={
                metrics
                  ? String(metrics.requestsPerMinute)
                  : "—"
              }
            />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={MessageSquare}
            title="Chat with Agent"
            description="Open a direct conversation with your local AI agent"
            href="/chat"
          />
          <QuickActionCard
            icon={Send}
            title="Telegram Setup"
            description="Connect your Telegram to chat from anywhere"
            href="/telegram"
            badge={
              telegram.connected ? "Connected" : undefined
            }
          />
          <QuickActionCard
            icon={Shield}
            title="Permissions"
            description="Review and manage agent access controls"
            href="/permissions"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-0 rounded-lg p-4 border border-zinc-800/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-zinc-500" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-lg font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className="block bg-surface-1 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-brand-600/15 flex items-center justify-center">
          <Icon size={20} className="text-brand-400" />
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 mt-1">{description}</p>
    </a>
  );
}
