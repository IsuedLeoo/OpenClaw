import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import type { Plugin, PluginCategory } from "@/types/plugin";
import { Puzzle, Search, Download, Power, Trash2 } from "lucide-react";

const SAMPLE_PLUGINS: Plugin[] = [
  { id: "web-search", name: "Web Search", version: "1.0.0", description: "Search the web and retrieve information", author: "OpenClaw", isEnabled: true, isInstalled: true, requiredPermissions: ["net_fetch"], category: "tools" },
  { id: "code-exec", name: "Code Executor", version: "0.9.0", description: "Execute code snippets in a sandboxed environment", author: "OpenClaw", isEnabled: false, isInstalled: true, requiredPermissions: ["shell_exec"], category: "tools" },
  { id: "file-manager", name: "File Manager", version: "1.1.0", description: "Read, write, and organize files", author: "OpenClaw", isEnabled: true, isInstalled: true, requiredPermissions: ["fs_read_project", "fs_write_project"], category: "tools" },
  { id: "slack-integration", name: "Slack", version: "0.5.0", description: "Send and receive messages in Slack workspaces", author: "Community", isEnabled: false, isInstalled: false, requiredPermissions: ["net_api"], category: "integrations" },
  { id: "notion-sync", name: "Notion Sync", version: "0.3.0", description: "Read and write Notion pages and databases", author: "Community", isEnabled: false, isInstalled: false, requiredPermissions: ["net_api"], category: "integrations" },
];

const CATEGORIES: { value: PluginCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tools", label: "Tools" },
  { value: "providers", label: "Providers" },
  { value: "integrations", label: "Integrations" },
  { value: "skills", label: "Skills" },
];

export function PluginsPage() {
  const [plugins, setPlugins] = useState(SAMPLE_PLUGINS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PluginCategory | "all">("all");

  const filtered = plugins.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())),
  );

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Plugins" subtitle="Extend your agent's capabilities" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins..."
              className="w-full bg-surface-1 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-600/50"
            />
          </div>
          <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1 border border-zinc-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs transition-colors",
                  category === cat.value
                    ? "bg-zinc-700 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-surface-1 rounded-xl border border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-0 flex items-center justify-center">
                    <Puzzle size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200">{plugin.name}</h3>
                    <p className="text-xs text-zinc-600">
                      v{plugin.version} by {plugin.author}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 capitalize">
                  {plugin.category}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">{plugin.description}</p>
              <div className="flex items-center justify-between">
                {plugin.isInstalled ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlugin(plugin.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                        plugin.isEnabled
                          ? "bg-success/15 text-success"
                          : "bg-zinc-800 text-zinc-500",
                      )}
                    >
                      <Power size={12} />
                      {plugin.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                    <button className="p-1.5 text-zinc-600 hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs transition-colors">
                    <Download size={12} />
                    Install
                  </button>
                )}
                <span className="text-[10px] text-zinc-600">
                  {plugin.requiredPermissions.length} permission{plugin.requiredPermissions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
