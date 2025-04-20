import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from "react-native";
import { Play, Pause, SkipForward, RefreshCw } from "lucide-react-native";
import { useTimerStore } from "@/store/timer-store";
import { colors } from "@/constants/colors";
import { formatTimeFromSeconds } from "@/utils/date-utils";

export const TimerDisplay: React.FC = () => {
  const {
    isRunning,
    isPaused,
    mode,
    secondsLeft,
    currentSession,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
    tick,
  } = useTimerStore();
  
  const progressAnim = useRef(new Animated.Value(1)).current;
  const initialSeconds = useRef(0);
  
  // Set up timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);
  
  // Set up progress animation
  useEffect(() => {
    let totalSeconds;
    
    switch (mode) {
      case "focus":
        totalSeconds = settings.focusMinutes * 60;
        break;
      case "shortBreak":
        totalSeconds = settings.shortBreakMinutes * 60;
        break;
      case "longBreak":
        totalSeconds = settings.longBreakMinutes * 60;
        break;
    }
    
    if (initialSeconds.current === 0 || secondsLeft === totalSeconds) {
      initialSeconds.current = totalSeconds;
      progressAnim.setValue(1);
    }
    
    const progress = secondsLeft / initialSeconds.current;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [secondsLeft, mode, settings, progressAnim]);
  
  const getTimerColor = () => {
    switch (mode) {
      case "focus":
        return colors.primary;
      case "shortBreak":
        return colors.success;
      case "longBreak":
        return colors.secondary;
    }
  };
  
  const getTimerLabel = () => {
    switch (mode) {
      case "focus":
        return "Focus";
      case "shortBreak":
        return "Break";
      case "longBreak":
        return "Long Break";
    }
  };
  
  const timerColor = getTimerColor();
  const timerLabel = getTimerLabel();
  
  // Calculate progress percentage for web
  const progressValue = Platform.OS === 'web' 
    ? progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      })
    : progressAnim;
  
  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={styles.progressCircle}>
          <View style={styles.progressBackground} />
          
          {Platform.OS !== 'web' ? (
            <Animated.View
              style={[
                styles.circleProgress,
                {
                  borderColor: timerColor,
                  transform: [
                    { rotate: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })},
                  ],
                },
              ]}
            />
          ) : (
            // Web fallback with a circular progress indicator
            <View style={styles.webProgressContainer}>
              <View style={[styles.webProgressCircle, { borderColor: timerColor }]}>
                <Animated.View 
                  style={[
                    styles.webProgressFill, 
                    { 
                      backgroundColor: timerColor,
                      width: progressValue,
                    }
                  ]} 
                />
              </View>
            </View>
          )}
          
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerLabel}>{timerLabel}</Text>
            <Text style={styles.timerText}>
              {formatTimeFromSeconds(secondsLeft)}
            </Text>
            <Text style={styles.sessionText}>Session {currentSession}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetTimer}
        >
          <RefreshCw size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: timerColor }]}
          onPress={isRunning ? pauseTimer : startTimer}
        >
          {isRunning ? (
            <Pause size={32} color="#fff" />
          ) : (
            <Play size={32} color="#fff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipToNext}
        >
          <SkipForward size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  progressCircle: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressBackground: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: colors.card,
  },
  circleProgress: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 8,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "0deg" }],
  },
  webProgressContainer: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    justifyContent: "center",
    alignItems: "center",
  },
  webProgressCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 8,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  webProgressFill: {
    position: "absolute",
    height: "100%",
    left: 0,
    top: 0,
    backgroundColor: colors.primary,
  },
  timerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.text,
  },
  sessionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  mainButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
});