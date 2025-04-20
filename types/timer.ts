export interface TimerSettings {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  }
  
  export interface TimerState {
    isRunning: boolean;
    isPaused: boolean;
    mode: "focus" | "shortBreak" | "longBreak";
    secondsLeft: number;
    currentSession: number;
    totalSessions: number;
    totalFocusTime: number; // in seconds
    dailyFocusTime: Record<string, number>; // date string -> seconds
  }