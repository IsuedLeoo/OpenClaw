import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Activity,
  Shield,
  Puzzle,
  Brain,
  Server,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "providers", label: "Providers", icon: Server, path: "/providers" },
  { id: "telegram", label: "Telegram", icon: Send, path: "/telegram" },
  { id: "plugins", label: "Plugins", icon: Puzzle, path: "/plugins" },
  { id: "permissions", label: "Permissions", icon: Shield, path: "/permissions" },
  { id: "memory", label: "Memory", icon: Brain, path: "/memory" },
  { id: "profiles", label: "Profiles", icon: Users, path: "/profiles" },
  { id: "monitoring", label: "Monitoring", icon: Activity, path: "/monitoring" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, runtime } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface-0 border-r border-zinc-800 transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">OC</span>
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-zinc-100 truncate">OpenClaw</span>
        )}
      </div>

      <div className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-brand-600/15 text-brand-400"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                sidebarCollapsed && "justify-center px-0",
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              runtime.status === "running" && "bg-success",
              runtime.status === "stopped" && "bg-zinc-500",
              runtime.status === "error" && "bg-danger",
              (runtime.status === "starting" || runtime.status === "stopping") &&
                "bg-warning animate-pulse",
              runtime.status === "installing" && "bg-brand-400 animate-pulse",
            )}
          />
          {!sidebarCollapsed && (
            <span className="text-xs text-zinc-500 capitalize truncate">
              Agent {runtime.status}
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>
    </aside>
  );
}
