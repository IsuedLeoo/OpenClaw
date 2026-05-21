import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  Globe,
  Terminal,
  Monitor,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

interface PermissionGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  label: string;
  description: string;
  granted: boolean;
  level: "safe" | "moderate" | "sensitive";
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "filesystem",
    label: "File System",
    icon: FolderOpen,
    description: "Read and write files on your computer",
    permissions: [
      { id: "fs_read_home", label: "Read home directory", description: "Read files in your home folder", granted: true, level: "moderate" },
      { id: "fs_read_project", label: "Read project files", description: "Read files in designated project directories", granted: true, level: "safe" },
      { id: "fs_write_project", label: "Write project files", description: "Create and modify files in project directories", granted: false, level: "moderate" },
      { id: "fs_delete", label: "Delete files", description: "Delete files and directories", granted: false, level: "sensitive" },
    ],
  },
  {
    id: "network",
    label: "Network",
    icon: Globe,
    description: "Make network requests and access web services",
    permissions: [
      { id: "net_api", label: "API requests", description: "Call AI model provider APIs", granted: true, level: "safe" },
      { id: "net_fetch", label: "Web fetch", description: "Download content from URLs", granted: false, level: "moderate" },
      { id: "net_browse", label: "Browser automation", description: "Control a web browser", granted: false, level: "sensitive" },
    ],
  },
  {
    id: "shell",
    label: "Shell & Terminal",
    icon: Terminal,
    description: "Execute commands and scripts",
    permissions: [
      { id: "shell_safe", label: "Safe commands", description: "Run read-only commands (ls, cat, etc.)", granted: false, level: "moderate" },
      { id: "shell_exec", label: "Execute scripts", description: "Run arbitrary shell commands", granted: false, level: "sensitive" },
    ],
  },
  {
    id: "apps",
    label: "Applications",
    icon: Monitor,
    description: "Control desktop applications",
    permissions: [
      { id: "app_list", label: "List applications", description: "See which apps are running", granted: true, level: "safe" },
      { id: "app_control", label: "Control applications", description: "Click, type, and interact with apps", granted: false, level: "sensitive" },
    ],
  },
];

export function PermissionsPage() {
  const [groups, setGroups] = useState(PERMISSION_GROUPS);
  const [expandedGroup, setExpandedGroup] = useState<string | null>("filesystem");

  const togglePermission = (groupId: string, permId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              permissions: g.permissions.map((p) =>
                p.id === permId ? { ...p, granted: !p.granted } : p,
              ),
            }
          : g,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Permissions"
        subtitle="Control what your agent can access"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-3 max-w-2xl">
        {groups.map((group) => {
          const isExpanded = expandedGroup === group.id;
          const grantedCount = group.permissions.filter((p) => p.granted).length;

          return (
            <div
              key={group.id}
              className="bg-surface-1 rounded-xl border border-zinc-800 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedGroup(isExpanded ? null : group.id)
                }
                className="flex items-center gap-4 w-full px-5 py-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-0 flex items-center justify-center">
                  <group.icon size={20} className="text-zinc-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-zinc-200">{group.label}</p>
                  <p className="text-xs text-zinc-500">{group.description}</p>
                </div>
                <span className="text-xs text-zinc-500">
                  {grantedCount}/{group.permissions.length}
                </span>
                <ChevronRight
                  size={16}
                  className={cn(
                    "text-zinc-600 transition-transform",
                    isExpanded && "rotate-90",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-800 divide-y divide-zinc-800/50">
                  {group.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between px-5 py-3 pl-16"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-zinc-300">{perm.label}</p>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase",
                              perm.level === "safe" &&
                                "bg-success/10 text-success",
                              perm.level === "moderate" &&
                                "bg-warning/10 text-warning",
                              perm.level === "sensitive" &&
                                "bg-danger/10 text-danger",
                            )}
                          >
                            {perm.level}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">{perm.description}</p>
                      </div>
                      <button
                        onClick={() => togglePermission(group.id, perm.id)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          perm.granted
                            ? "bg-success/15 text-success"
                            : "bg-zinc-800 text-zinc-600 hover:text-zinc-400",
                        )}
                      >
                        {perm.granted ? (
                          <Check size={16} />
                        ) : (
                          <X size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
