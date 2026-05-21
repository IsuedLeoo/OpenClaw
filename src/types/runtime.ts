export type RuntimeStatus =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error"
  | "installing";

export interface RuntimeInfo {
  status: RuntimeStatus;
  version: string | null;
  uptime: number | null;
  pid: number | null;
  error: string | null;
}

export interface RuntimeMetrics {
  cpuPercent: number;
  memoryMb: number;
  activeConnections: number;
  requestsPerMinute: number;
}

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  source: string;
}
