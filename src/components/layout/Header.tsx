import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Cpu, MemoryStick } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { runtime, metrics, telegram } = useAppStore();

  return (
    <header className="h-14 border-b border-zinc-800 bg-surface-0 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        {subtitle && (
          <p className="text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {metrics && runtime.status === "running" && (
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Cpu size={14} />
              {metrics.cpuPercent.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <MemoryStick size={14} />
              {metrics.memoryMb.toFixed(0)} MB
            </span>
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
            telegram.connected
              ? "text-success bg-success/10"
              : "text-zinc-500 bg-zinc-800/50",
          )}
        >
          {telegram.connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>Telegram</span>
        </div>
      </div>
    </header>
  );
}
