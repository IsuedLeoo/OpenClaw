import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { ChatPage } from "@/pages/ChatPage";
import { ProvidersPage } from "@/pages/ProvidersPage";
import { TelegramPage } from "@/pages/TelegramPage";
import { PluginsPage } from "@/pages/PluginsPage";
import { PermissionsPage } from "@/pages/PermissionsPage";
import { MemoryPage } from "@/pages/MemoryPage";
import { ProfilesPage } from "@/pages/ProfilesPage";
import { MonitoringPage } from "@/pages/MonitoringPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useAppStore } from "@/stores/appStore";
import type { RuntimeInfo, RuntimeMetrics } from "@/types/runtime";
import { useTauriEvent } from "@/hooks/useTauriEvent";

export default function App() {
  const { setRuntime, setMetrics } = useAppStore();
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const loadRuntimeState = async () => {
      try {
        const runtimeInfo = await invoke<RuntimeInfo>("runtime_status");
        setRuntime(runtimeInfo);
      } catch (error) {
        console.warn("Unable to load runtime status", error);
      }

      try {
        const runtimeMetrics = await invoke<RuntimeMetrics>("runtime_metrics");
        setMetrics(runtimeMetrics);
      } catch (error) {
        // Metrics may not be available until the runtime is running.
      }
    };

    loadRuntimeState();

    const checkForUpdate = async () => {
      try {
        await checkUpdate();
      } catch (error) {
        console.warn("Update check failed", error);
      }
    };

    checkForUpdate();
    const interval = setInterval(checkForUpdate, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setRuntime, setMetrics]);

  useTauriEvent<RuntimeInfo>("runtime-status-changed", (runtimeInfo) => {
    setRuntime(runtimeInfo);
  });

  useTauriEvent<any>("tauri://update-available", (payload) => {
    const version = payload?.manifest?.version || payload?.version || "new version";
    setUpdateMessage(`Update available: ${version}. Downloading now...`);
    setUpdateReady(false);
  });

  useTauriEvent<any>("tauri://update-downloaded", (payload) => {
    const version = payload?.manifest?.version || payload?.version || "latest version";
    setUpdateMessage(`Update downloaded: ${version}. Restart to install.`);
    setUpdateReady(true);
  });

  useTauriEvent<any>("tauri://update-error", (payload) => {
    const message = payload?.message || payload?.error || "Update process failed.";
    setUpdateMessage(`Update error: ${message}`);
    setUpdateReady(false);
  });

  const handleInstallUpdate = async () => {
    try {
      await installUpdate();
    } catch (error) {
      console.error("Failed to install update", error);
      setUpdateMessage("Failed to install update. Please restart the app later.");
    }
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-surface-0 text-zinc-100 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {updateMessage && (
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 text-sm text-slate-100 flex items-center justify-between gap-4">
              <span>{updateMessage}</span>
              {updateReady && (
                <button
                  onClick={handleInstallUpdate}
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-500"
                >
                  Restart to install
                </button>
              )}
            </div>
          )}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/telegram" element={<TelegramPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
