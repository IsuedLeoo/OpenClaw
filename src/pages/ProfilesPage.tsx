import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { Plus, Check, Settings, Copy, Trash2 } from "lucide-react";

interface AgentProfile {
  id: string;
  name: string;
  description: string;
  personality: string;
  model: string;
  isActive: boolean;
  color: string;
}

const SAMPLE_PROFILES: AgentProfile[] = [
  { id: "default", name: "Default", description: "General-purpose assistant", personality: "Helpful, concise, and technical", model: "claude-sonnet-4-6", isActive: true, color: "bg-brand-600" },
  { id: "coder", name: "Coder", description: "Software development focused", personality: "Expert programmer, writes clean code", model: "claude-sonnet-4-6", isActive: false, color: "bg-emerald-600" },
  { id: "writer", name: "Writer", description: "Creative and professional writing", personality: "Eloquent, creative, detail-oriented", model: "claude-sonnet-4-6", isActive: false, color: "bg-purple-600" },
];

export function ProfilesPage() {
  const [profiles, setProfiles] = useState(SAMPLE_PROFILES);

  const setActiveProfile = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => ({ ...p, isActive: p.id === id })),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Profiles" subtitle="Manage agent personalities and configurations" />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            New Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={cn(
                "bg-surface-1 rounded-xl border overflow-hidden transition-colors",
                profile.isActive
                  ? "border-brand-600/50"
                  : "border-zinc-800 hover:border-zinc-700",
              )}
            >
              <div className={cn("h-1.5", profile.color)} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-200">{profile.name}</h3>
                  {profile.isActive && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-600/15 text-brand-400">
                      <Check size={12} />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mb-2">{profile.description}</p>
                <p className="text-xs text-zinc-600 mb-4">
                  Model: {profile.model}
                </p>

                <div className="flex items-center gap-2">
                  {!profile.isActive && (
                    <button
                      onClick={() => setActiveProfile(profile.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-600/15 text-brand-400 rounded-lg text-xs hover:bg-brand-600/25 transition-colors"
                    >
                      <Check size={12} />
                      Activate
                    </button>
                  )}
                  <button className="p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors">
                    <Settings size={14} />
                  </button>
                  <button className="p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors">
                    <Copy size={14} />
                  </button>
                  {profile.id !== "default" && (
                    <button className="p-1.5 text-zinc-600 hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
