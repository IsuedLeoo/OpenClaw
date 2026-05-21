import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { useTauriEvent } from "@/hooks/useTauriEvent";
import type { LogEntry } from "@/types/runtime";
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  ArrowDown,
  Filter,
  Trash2,
} from "lucide-react";

type LogLevel = "all" | "debug" | "info" | "warn" | "error";

export function MonitoringPage() {
  const { runtime, metrics } = useAppStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogLevel>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useTauriEvent<LogEntry>("runtime-log", (entry) => {
    setLogs((prev) => [...prev.slice(-499), entry]);
  });

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs =
    logFilter === "all"
      ? logs
      : logs.filter((l) => l.level === logFilter);

  return (
    <div className="flex flex-col h-full">
      <Header title="Monitoring" subtitle="Runtime metrics and logs" />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 p-6 pb-0">
          <MetricCard
            icon={Activity}
            label="Status"
            value={runtime.status}
            color={
              runtime.status === "running"
                ? "text-success"
                : runtime.status === "error"
                  ? "text-danger"
                  : "text-zinc-400"
            }
          />
          <MetricCard
            icon={Cpu}
            label="CPU Usage"
            value={metrics ? `${metrics.cpuPercent.toFixed(1)}%` : "—"}
            bar={metrics ? metrics.cpuPercent : undefined}
          />
          <MetricCard
            icon={HardDrive}
            label="Memory"
            value={metrics ? `${metrics.memoryMb.toFixed(0)} MB` : "—"}
          />
          <MetricCard
            icon={Network}
            label="Req/min"
            value={metrics ? String(metrics.requestsPerMinute) : "—"}
          />
        </div>

        {/* Log Viewer */}
        <div className="flex-1 flex flex-col m-6 mt-4 bg-surface-1 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-zinc-500" />
              <div className="flex items-center gap-1 bg-surface-0 rounded-lg p-0.5">
                {(["all", "debug", "info", "warn", "error"] as const).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setLogFilter(level)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs transition-colors capitalize",
                        logFilter === level
                          ? "bg-zinc-700 text-zinc-200"
                          : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      {level}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors",
                  autoScroll
                    ? "bg-brand-600/15 text-brand-400"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                <ArrowDown size={12} />
                Auto-scroll
              </button>
              <button
                onClick={() => setLogs([])}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600">
                {runtime.status === "running"
                  ? "Waiting for logs..."
                  : "Start the agent to see logs"}
              </div>
            ) : (
              filteredLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-3 py-0.5 px-2 hover:bg-zinc-800/30 rounded"
                >
                  <span className="text-zinc-600 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 w-12 uppercase",
                      log.level === "error" && "text-danger",
                      log.level === "warn" && "text-warning",
                      log.level === "info" && "text-brand-400",
                      log.level === "debug" && "text-zinc-600",
                    )}
                  >
                    {log.level}
                  </span>
                  <span className="text-zinc-500 shrink-0">
                    [{log.source}]
                  </span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bar,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color?: string;
  bar?: number;
}) {
  return (
    <div className="bg-surface-1 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-zinc-500" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className={cn("text-lg font-semibold capitalize", color ?? "text-zinc-200")}>
        {value}
      </p>
      {bar !== undefined && (
        <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              bar > 80
                ? "bg-danger"
                : bar > 50
                  ? "bg-warning"
                  : "bg-brand-500",
            )}
            style={{ width: `${Math.min(bar, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
