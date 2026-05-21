import { create } from "zustand";
import type { RuntimeInfo, RuntimeMetrics } from "@/types/runtime";
import type { TelegramStatus } from "@/types/events";

interface AppState {
  runtime: RuntimeInfo;
  metrics: RuntimeMetrics | null;
  telegram: TelegramStatus;
  sidebarCollapsed: boolean;
  currentPage: string;

  setRuntime: (info: RuntimeInfo) => void;
  setMetrics: (metrics: RuntimeMetrics) => void;
  setTelegram: (status: TelegramStatus) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  runtime: {
    status: "stopped",
    version: null,
    uptime: null,
    pid: null,
    error: null,
  },
  metrics: null,
  telegram: {
    connected: false,
    botUsername: null,
    lastMessageAt: null,
  },
  sidebarCollapsed: false,
  currentPage: "dashboard",

  setRuntime: (info) => set({ runtime: info }),
  setMetrics: (metrics) => set({ metrics }),
  setTelegram: (status) => set({ telegram: status }),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
