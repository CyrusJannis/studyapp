import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Check } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useTimerStore } from "@/store/timer-store";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Button } from "@/components/Button";

export default function TimerScreen() {
  const {
    settings,
    updateSettings,
    isRunning,
    startTimer
  } = useTimerStore();
  
  const [customMinutes, setCustomMinutes] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      updateSettings({ focusMinutes: minutes });
      setShowCustomInput(false);
      setCustomMinutes("");
    }
  };
  
  const handleFocusTimeSelect = (minutes: number) => {
    updateSettings({ focusMinutes: minutes });
  };
  
  const handleBreakTimeSelect = (minutes: number) => {
    updateSettings({ shortBreakMinutes: minutes });
  };
  
  // Simulate activating focus mode on iOS
  const activateFocusMode = () => {
    if (Platform.OS === 'ios') {
      // This would use actual iOS APIs in a real implementation
      Alert.alert(
        "Focus Mode",
        "On a real device, this would activate iOS Focus Mode to block notifications during your focus session.",
        [{ text: "OK" }]
      );
    }
    
    // Start the timer
    startTimer();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Focus Timer</Text>
          <Text style={styles.subtitle}>
            Stay focused and eliminate distractions
          </Text>
        </View>
        
        <TimerDisplay />
        
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Focus Duration</Text>
            <View style={styles.settingOptions}>
              {[15, 25, 30, 45].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.settingOption,
                    settings.focusMinutes === minutes && styles.selectedOption,
                  ]}
                  onPress={() => handleFocusTimeSelect(minutes)}
                >
                  <Text
                    style={[
                      styles.settingOptionText,
                      settings.focusMinutes === minutes && styles.selectedOptionText,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.settingOption,
                  showCustomInput && styles.selectedOption,
                ]}
                onPress={() => setShowCustomInput(true)}
              >
                <Text
                  style={[
                    styles.settingOptionText,
                    showCustomInput && styles.selectedOptionText,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
            
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter minutes"
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.customInputButton}
                  onPress={handleCustomTimeSubmit}
                >
                  <Check size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Break Duration</Text>
            <View style={styles.settingOptions}>
              {[5, 10, 15].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.settingOption,
                    settings.shortBreakMinutes === minutes && styles.selectedOption,
                  ]}
                  onPress={() => handleBreakTimeSelect(minutes)}
                >
                  <Text
                    style={[
                      styles.settingOptionText,
                      settings.shortBreakMinutes === minutes && styles.selectedOptionText,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {!isRunning && Platform.OS === 'ios' && (
            <View style={styles.focusModeContainer}>
              <Button
                title="Start Timer with Focus Mode"
                onPress={activateFocusMode}
                icon={<Clock size={18} color="#fff" style={{ marginRight: 8 }} />}
                style={styles.focusModeButton}
              />
              <Text style={styles.focusModeText}>
                Activates iOS Focus Mode to block notifications during your focus session
              </Text>
              <Text style={styles.focusModeNote}>
                Note: On a real device, this would create a Live Activity on your lock screen
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  settingsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
  },
  settingOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  settingOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  settingOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "500",
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
  },
  customInputButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  focusModeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  focusModeButton: {
    marginBottom: 12,
  },
  focusModeText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  focusModeNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
});