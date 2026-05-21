export interface ModelProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl?: string;
  isEnabled: boolean;
  models: string[];
}

export type ProviderKind =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "ollama"
  | "lmstudio"
  | "custom";

export interface ApiKey {
  id: string;
  providerId: string;
  label: string;
  maskedValue: string;
  createdAt: string;
}

export interface AppConfig {
  activeProfile: string;
  theme: "dark" | "light" | "system";
  autoStart: boolean;
  minimizeToTray: boolean;
  autoUpdate: boolean;
  telemetryEnabled: boolean;
}
