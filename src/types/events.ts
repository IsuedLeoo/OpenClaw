import type { RuntimeInfo, RuntimeMetrics, LogEntry } from "./runtime";

export interface TauriEvents {
  "runtime-status-changed": RuntimeInfo;
  "runtime-metrics": RuntimeMetrics;
  "runtime-log": LogEntry;
  "telegram-status-changed": TelegramStatus;
  "telegram-message": TelegramMessage;
  "permission-request": PermissionRequest;
  "update-available": UpdateInfo;
}

export interface TelegramStatus {
  connected: boolean;
  botUsername: string | null;
  lastMessageAt: string | null;
}

export interface TelegramMessage {
  id: number;
  from: string;
  text: string;
  timestamp: string;
  direction: "incoming" | "outgoing";
}

export interface PermissionRequest {
  id: string;
  action: string;
  resource: string;
  description: string;
  requestedAt: string;
}

export interface UpdateInfo {
  version: string;
  notes: string;
  date: string;
}
