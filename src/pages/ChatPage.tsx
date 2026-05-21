import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useChatStore, type ChatMessage } from "@/stores/chatStore";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function ChatPage() {
  const { messages, isStreaming, inputValue, addMessage, setInputValue, setStreaming, clearMessages } =
    useChatStore();
  const { runtime } = useAppStore();
  const [composing, setComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      source: "local",
    };

    addMessage(userMsg);
    setInputValue("");
    setStreaming(true);

    try {
      const response = await invoke<string>("chat_send", { message: text });
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        source: "local",
      });
    } catch (e) {
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        timestamp: new Date().toISOString(),
        source: "local",
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !composing) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAgentReady = runtime.status === "running";

  return (
    <div className="flex flex-col h-full">
      <Header title="Chat" subtitle="Talk to your agent" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/15 flex items-center justify-center mb-4">
              <Bot size={32} className="text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-2">
              Start a conversation
            </h2>
            <p className="text-sm text-zinc-500 max-w-md">
              {isAgentReady
                ? "Your agent is running and ready. Type a message below to get started."
                : "Start the agent from the Dashboard to begin chatting."}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm pl-12">
            <Loader2 size={16} className="animate-spin" />
            <span>Agent is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 p-4 bg-surface-0">
        <div className="flex items-center gap-2 mb-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            placeholder={
              isAgentReady
                ? "Type a message..."
                : "Agent is not running"
            }
            disabled={!isAgentReady}
            rows={1}
            className="flex-1 bg-surface-1 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-brand-600/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!isAgentReady || !inputValue.trim() || isStreaming}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isUser
            ? "bg-brand-600"
            : isSystem
              ? "bg-danger/15"
              : "bg-zinc-800",
        )}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot
            size={16}
            className={isSystem ? "text-danger" : "text-zinc-400"}
          />
        )}
      </div>
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-3 text-sm",
          isUser
            ? "bg-brand-600 text-white"
            : isSystem
              ? "bg-danger/10 text-danger border border-danger/20"
              : "bg-surface-1 text-zinc-300 border border-zinc-800",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.source === "telegram" && (
          <span className="text-xs opacity-60 mt-1 block">via Telegram</span>
        )}
      </div>
    </div>
  );
}
