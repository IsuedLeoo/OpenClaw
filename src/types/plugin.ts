export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  isEnabled: boolean;
  isInstalled: boolean;
  requiredPermissions: string[];
  icon?: string;
  category: PluginCategory;
}

export type PluginCategory =
  | "tools"
  | "providers"
  | "integrations"
  | "skills"
  | "themes";
