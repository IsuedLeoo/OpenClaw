import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-surface-0 text-zinc-100 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
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
