import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/colors";

interface SettingsState {
  notifications: boolean;
  soundEffects: boolean;
  vibration: boolean;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  toggleVibration: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: true,
      soundEffects: true,
      vibration: true,
      
      toggleNotifications: () => {
        set((state) => ({ notifications: !state.notifications }));
      },
      
      toggleSoundEffects: () => {
        set((state) => ({ soundEffects: !state.soundEffects }));
      },
      
      toggleVibration: () => {
        set((state) => ({ vibration: !state.vibration }));
      },
    }),
    {
      name: "focus-plan-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);