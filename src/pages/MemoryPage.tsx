import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Brain, Search, Trash2, Clock, Tag } from "lucide-react";

interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  source: string;
}

const SAMPLE_MEMORIES: MemoryEntry[] = [
  { id: "1", content: "User prefers TypeScript over JavaScript for all projects", category: "preference", createdAt: "2026-05-19T10:30:00Z", source: "conversation" },
  { id: "2", content: "Project uses pnpm as package manager", category: "project", createdAt: "2026-05-19T11:00:00Z", source: "observation" },
  { id: "3", content: "User's name is Leon", category: "identity", createdAt: "2026-05-18T09:00:00Z", source: "introduction" },
];

export function MemoryPage() {
  const [memories, setMemories] = useState(SAMPLE_MEMORIES);
  const [search, setSearch] = useState("");

  const filtered = memories.filter(
    (m) =>
      search === "" ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()),
  );

  const removeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Memory" subtitle="Agent knowledge and context" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="w-full bg-surface-1 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-600/50"
            />
          </div>
          <button
            onClick={() => setMemories([])}
            className="flex items-center gap-2 px-3 py-2 bg-danger/15 hover:bg-danger/25 text-danger rounded-lg text-sm transition-colors"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        <p className="text-xs text-zinc-600">
          {filtered.length} memor{filtered.length !== 1 ? "ies" : "y"} stored
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
              <Brain size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              No memories yet
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Your agent will build memories as you interact with it.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((memory) => (
              <div
                key={memory.id}
                className="bg-surface-1 rounded-xl border border-zinc-800 p-4 group"
              >
                <p className="text-sm text-zinc-300 mb-3">{memory.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      {memory.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMemory(memory.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-danger transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
