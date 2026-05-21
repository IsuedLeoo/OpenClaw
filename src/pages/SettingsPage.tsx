import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  Monitor,
  Download,
  FolderOpen,
  RotateCw,
  Info,
} from "lucide-react";

type Theme = "dark" | "light" | "system";

export function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [autoStart, setAutoStart] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Application preferences" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsRow label="Theme" description="Choose your preferred color scheme">
            <div className="flex items-center gap-1 bg-surface-0 rounded-lg p-1 border border-zinc-800">
              {(
                [
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "system", icon: Monitor, label: "System" },
                ] as const
              ).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
                    theme === value
                      ? "bg-zinc-700 text-zinc-200"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Behavior */}
        <SettingsSection title="Behavior">
          <SettingsRow
            label="Start on login"
            description="Automatically start OpenClaw when you log in"
          >
            <Toggle value={autoStart} onChange={setAutoStart} />
          </SettingsRow>
          <SettingsRow
            label="Minimize to tray"
            description="Keep running in the background when the window is closed"
          >
            <Toggle value={minimizeToTray} onChange={setMinimizeToTray} />
          </SettingsRow>
          <SettingsRow
            label="Auto-update"
            description="Automatically download and install updates"
          >
            <Toggle value={autoUpdate} onChange={setAutoUpdate} />
          </SettingsRow>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsRow
            label="Usage analytics"
            description="Send anonymous usage data to help improve OpenClaw"
          >
            <Toggle value={telemetry} onChange={setTelemetry} />
          </SettingsRow>
        </SettingsSection>

        {/* Data */}
        <SettingsSection title="Data">
          <SettingsRow
            label="Export configuration"
            description="Download all settings, profiles, and configurations"
          >
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors">
              <Download size={14} />
              Export
            </button>
          </SettingsRow>
          <SettingsRow
            label="Import configuration"
            description="Restore settings from a previous export"
          >
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors">
              <FolderOpen size={14} />
              Import
            </button>
          </SettingsRow>
          <SettingsRow
            label="Reset to defaults"
            description="Clear all settings and start fresh"
          >
            <button className="flex items-center gap-2 px-3 py-1.5 bg-danger/15 hover:bg-danger/25 text-danger rounded-lg text-xs transition-colors">
              <RotateCw size={14} />
              Reset
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <div className="flex items-center gap-3 py-2">
            <Info size={16} className="text-zinc-500" />
            <div>
              <p className="text-sm text-zinc-300">OpenClaw v0.1.0</p>
              <p className="text-xs text-zinc-600">
                The open platform for personal AI agents
              </p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-1 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
      </div>
      <div className="divide-y divide-zinc-800/50">{children}</div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors shrink-0",
        value ? "bg-brand-600" : "bg-zinc-700",
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
          value ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}
