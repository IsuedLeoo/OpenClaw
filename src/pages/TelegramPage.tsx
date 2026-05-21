import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import {
  Send,
  Link,
  Unlink,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Shield,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function TelegramPage() {
  const { telegram } = useAppStore();
  const [botToken, setBotToken] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!botToken.trim()) return;
    setConnecting(true);
    try {
      await invoke("telegram_connect", {
        botToken: botToken.trim(),
        userId: userId.trim() || undefined,
      });
    } catch (e) {
      console.error("Failed to connect Telegram:", e);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await invoke("telegram_disconnect");
    } catch (e) {
      console.error("Failed to disconnect Telegram:", e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Telegram"
        subtitle="Chat with your agent from your phone"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
        {/* Status Banner */}
        <div
          className={cn(
            "rounded-xl border p-5",
            telegram.connected
              ? "bg-success/5 border-success/20"
              : "bg-surface-1 border-zinc-800",
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                telegram.connected
                  ? "bg-success/15"
                  : "bg-zinc-800",
              )}
            >
              <Send
                size={24}
                className={
                  telegram.connected ? "text-success" : "text-zinc-500"
                }
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-zinc-100">
                {telegram.connected
                  ? "Telegram Connected"
                  : "Telegram Not Connected"}
              </h2>
              <p className="text-sm text-zinc-500">
                {telegram.connected
                  ? `Bot: @${telegram.botUsername}`
                  : "Set up a Telegram bot to chat with your agent remotely"}
              </p>
            </div>
            {telegram.connected && (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-3 py-2 bg-danger/15 hover:bg-danger/25 text-danger rounded-lg text-sm transition-colors"
              >
                <Unlink size={16} />
                Disconnect
              </button>
            )}
          </div>
        </div>

        {!telegram.connected && (
          <>
            {/* Setup Steps */}
            <div className="bg-surface-1 rounded-xl border border-zinc-800 p-6 space-y-6">
              <h3 className="font-semibold text-zinc-200">Quick Setup</h3>

              <div className="space-y-4">
                <SetupStep
                  number={1}
                  title="Create a Telegram Bot"
                  description='Open Telegram, search for @BotFather, and send /newbot. Follow the prompts to create your bot.'
                >
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Open BotFather guide
                    <ExternalLink size={12} />
                  </a>
                </SetupStep>

                <SetupStep
                  number={2}
                  title="Enter your Bot Token"
                  description="Paste the token BotFather gave you below."
                >
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type={tokenVisible ? "text" : "password"}
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="flex-1 bg-surface-0 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-600/50"
                    />
                    <button
                      onClick={() => setTokenVisible(!tokenVisible)}
                      className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {tokenVisible ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </SetupStep>

                <SetupStep
                  number={3}
                  title="Set your Telegram User ID (optional)"
                  description="Restrict bot access to only your account for security."
                >
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Your numeric Telegram ID"
                      className="flex-1 bg-surface-0 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-600/50"
                    />
                  </div>
                </SetupStep>
              </div>

              <button
                onClick={handleConnect}
                disabled={!botToken.trim() || connecting}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Link size={16} />
                {connecting ? "Connecting..." : "Connect Telegram Bot"}
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-surface-1 rounded-xl border border-zinc-800 p-5">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-zinc-200 text-sm mb-1">
                    Security
                  </h4>
                  <ul className="text-xs text-zinc-500 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                      Your bot token is encrypted and stored locally
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                      Only your Telegram ID can interact with the bot
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                      All messages are processed locally on your machine
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                      Sensitive actions require desktop approval
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {telegram.connected && (
          <div className="bg-surface-1 rounded-xl border border-zinc-800 p-6 space-y-4">
            <h3 className="font-semibold text-zinc-200">How to use</h3>
            <div className="flex items-start gap-3">
              <Smartphone size={20} className="text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-400">
                  Open Telegram on your phone and search for{" "}
                  <span className="text-zinc-200 font-medium">
                    @{telegram.botUsername}
                  </span>
                  . Send any message to start chatting with your local agent.
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  The agent only responds when OpenClaw is running on this
                  computer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SetupStep({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-brand-600/15 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-semibold text-brand-400">{number}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-zinc-200 text-sm">{title}</h4>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        {children}
      </div>
    </div>
  );
}
