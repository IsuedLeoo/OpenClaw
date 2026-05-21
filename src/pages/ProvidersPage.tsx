import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import type { ProviderKind } from "@/types/config";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  X,
  ExternalLink,
  Server,
} from "lucide-react";

interface ProviderConfig {
  id: string;
  name: string;
  kind: ProviderKind;
  icon: string;
  description: string;
  needsApiKey: boolean;
  needsBaseUrl: boolean;
  defaultBaseUrl?: string;
}

const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    kind: "openai",
    icon: "🟢",
    description: "GPT-4o, o1, o3 and more",
    needsApiKey: true,
    needsBaseUrl: false,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "anthropic",
    icon: "🟤",
    description: "Claude Opus, Sonnet, Haiku",
    needsApiKey: true,
    needsBaseUrl: false,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    kind: "openrouter",
    icon: "🔵",
    description: "Access any model through one API",
    needsApiKey: true,
    needsBaseUrl: false,
  },
  {
    id: "groq",
    name: "Groq",
    kind: "groq",
    icon: "🟡",
    description: "Ultra-fast inference",
    needsApiKey: true,
    needsBaseUrl: false,
  },
  {
    id: "ollama",
    name: "Ollama",
    kind: "ollama",
    icon: "🦙",
    description: "Run open models locally",
    needsApiKey: false,
    needsBaseUrl: true,
    defaultBaseUrl: "http://localhost:11434",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    kind: "lmstudio",
    icon: "🔮",
    description: "Local model server",
    needsApiKey: false,
    needsBaseUrl: true,
    defaultBaseUrl: "http://localhost:1234",
  },
];

interface ConfiguredProvider {
  id: string;
  kind: ProviderKind;
  name: string;
  isEnabled: boolean;
  hasKey: boolean;
}

export function ProvidersPage() {
  const [configured, setConfigured] = useState<ConfiguredProvider[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({});

  const toggleProvider = (id: string) => {
    setConfigured((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isEnabled: !p.isEnabled } : p,
      ),
    );
  };

  const removeProvider = (id: string) => {
    setConfigured((prev) => prev.filter((p) => p.id !== id));
  };

  const addProvider = (provider: ProviderConfig) => {
    if (configured.find((p) => p.id === provider.id)) return;
    setConfigured((prev) => [
      ...prev,
      {
        id: provider.id,
        kind: provider.kind,
        name: provider.name,
        isEnabled: true,
        hasKey: !provider.needsApiKey,
      },
    ]);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Model Providers"
        subtitle="Configure AI model providers and API keys"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {configured.length} provider{configured.length !== 1 ? "s" : ""} configured
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Provider
          </button>
        </div>

        {configured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
              <Server size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              No providers configured
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-4">
              Add a model provider to start using your agent. You can use cloud
              APIs or run models locally.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add your first provider
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {configured.map((provider) => {
              const config = AVAILABLE_PROVIDERS.find(
                (p) => p.id === provider.id,
              );
              return (
                <div
                  key={provider.id}
                  className="bg-surface-1 rounded-xl border border-zinc-800 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {config?.icon ?? "🔧"}
                      </span>
                      <div>
                        <h3 className="font-medium text-zinc-200">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {config?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProvider(provider.id)}
                        className={cn(
                          "relative w-10 h-6 rounded-full transition-colors",
                          provider.isEnabled
                            ? "bg-brand-600"
                            : "bg-zinc-700",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                            provider.isEnabled
                              ? "translate-x-5"
                              : "translate-x-1",
                          )}
                        />
                      </button>
                      <button
                        onClick={() => removeProvider(provider.id)}
                        className="p-2 text-zinc-500 hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {config?.needsApiKey && (
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type={
                          apiKeyVisible[provider.id]
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter API key..."
                        className="flex-1 bg-surface-0 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-600/50"
                      />
                      <button
                        onClick={() =>
                          setApiKeyVisible((prev) => ({
                            ...prev,
                            [provider.id]: !prev[provider.id],
                          }))
                        }
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {apiKeyVisible[provider.id] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button className="px-3 py-2 bg-brand-600/15 text-brand-400 rounded-lg text-sm hover:bg-brand-600/25 transition-colors">
                        Save
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Provider Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-surface-1 rounded-2xl border border-zinc-800 w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Add Provider
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {AVAILABLE_PROVIDERS.filter(
                  (p) => !configured.find((c) => c.id === p.id),
                ).map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => addProvider(provider)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-200">
                        {provider.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {provider.description}
                      </p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-zinc-600"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
