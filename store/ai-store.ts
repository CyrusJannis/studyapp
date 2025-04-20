import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface AIState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,
      
      addMessage: (message) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          ...message,
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      
      clearMessages: () => {
        set({ messages: [] });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "focus-plan-ai",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);