import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  source: "local" | "telegram";
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  inputValue: string;

  addMessage: (msg: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  setInputValue: (value: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  inputValue: "",

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setInputValue: (value) => set({ inputValue: value }),
  clearMessages: () => set({ messages: [] }),
}));
