import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimerSettings, TimerState } from "@/types/timer";

interface TimerStore extends TimerState {
  settings: TimerSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
  tick: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  addFocusTime: (seconds: number) => void;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      mode: "focus",
      secondsLeft: DEFAULT_SETTINGS.focusMinutes * 60,
      currentSession: 1,
      totalSessions: 0,
      totalFocusTime: 0,
      dailyFocusTime: {},
      settings: DEFAULT_SETTINGS,
      
      startTimer: () => {
        set({ isRunning: true, isPaused: false });
      },
      
      pauseTimer: () => {
        set({ isRunning: false, isPaused: true });
      },
      
      resetTimer: () => {
        const { settings, mode } = get();
        let seconds;
        
        switch (mode) {
          case "focus":
            seconds = settings.focusMinutes * 60;
            break;
          case "shortBreak":
            seconds = settings.shortBreakMinutes * 60;
            break;
          case "longBreak":
            seconds = settings.longBreakMinutes * 60;
            break;
        }
        
        set({ secondsLeft: seconds, isRunning: false, isPaused: false });
      },
      
      skipToNext: () => {
        const { mode, currentSession, settings } = get();
        let nextMode: "focus" | "shortBreak" | "longBreak";
        let nextSession = currentSession;
        let seconds;
        
        if (mode === "focus") {
          // After focus, determine if it should be a short or long break
          if (currentSession % settings.longBreakInterval === 0) {
            nextMode = "longBreak";
          } else {
            nextMode = "shortBreak";
          }
        } else {
          // After any break, go back to focus and increment session
          nextMode = "focus";
          nextSession = currentSession + 1;
        }
        
        // Set seconds based on the next mode
        switch (nextMode) {
          case "focus":
            seconds = settings.focusMinutes * 60;
            break;
          case "shortBreak":
            seconds = settings.shortBreakMinutes * 60;
            break;
          case "longBreak":
            seconds = settings.longBreakMinutes * 60;
            break;
        }
        
        set({
          mode: nextMode,
          currentSession: nextSession,
          secondsLeft: seconds,
          isRunning: false,
          isPaused: false,
        });
      },
      
      tick: () => {
        const { secondsLeft, mode, isRunning } = get();
        
        if (!isRunning || secondsLeft <= 0) return;
        
        // If time is up
        if (secondsLeft === 1) {
          // Record focus time if it was a focus session
          if (mode === "focus") {
            get().addFocusTime(get().settings.focusMinutes * 60);
          }
          
          // Move to next session
          get().skipToNext();
          
          // Auto-start next session based on settings
          const { settings, mode: newMode } = get();
          if (
            (newMode !== "focus" && settings.autoStartBreaks) ||
            (newMode === "focus" && settings.autoStartPomodoros)
          ) {
            get().startTimer();
          }
        } else {
          // Just decrement the timer
          set({ secondsLeft: secondsLeft - 1 });
        }
      },
      
      updateSettings: (newSettings: Partial<TimerSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        
        // Reset timer with new settings
        get().resetTimer();
      },
      
      addFocusTime: (seconds: number) => {
        const today = new Date().toISOString().split("T")[0];
        
        set((state) => {
          const newDailyFocusTime = { ...state.dailyFocusTime };
          newDailyFocusTime[today] = (newDailyFocusTime[today] || 0) + seconds;
          
          return {
            totalFocusTime: state.totalFocusTime + seconds,
            totalSessions: state.totalSessions + 1,
            dailyFocusTime: newDailyFocusTime,
          };
        });
      },
    }),
    {
      name: "focus-plan-timer",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        totalFocusTime: state.totalFocusTime,
        totalSessions: state.totalSessions,
        dailyFocusTime: state.dailyFocusTime,
      }),
    }
  )
);