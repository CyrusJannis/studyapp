import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Volume2,
  Vibrate,
  HelpCircle,
  Info,
  Mail,
  Github,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useSettingsStore } from "@/store/settings-store";

export default function SettingsScreen() {
  const {
    notifications,
    soundEffects,
    vibration,
    toggleNotifications,
    toggleSoundEffects,
    toggleVibration,
  } = useSettingsStore();
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={colors.text} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Haptics</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Volume2 size={20} color={colors.text} />
              <Text style={styles.settingText}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={toggleSoundEffects}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Vibrate size={20} color={colors.text} />
              <Text style={styles.settingText}>Vibration</Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={toggleVibration}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.aboutRow}>
            <View style={styles.settingInfo}>
              <Info size={20} color={colors.text} />
              <Text style={styles.settingText}>App Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutRow}>
            <View style={styles.settingInfo}>
              <HelpCircle size={20} color={colors.text} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutRow}>
            <View style={styles.settingInfo}>
              <Mail size={20} color={colors.text} />
              <Text style={styles.settingText}>Contact Us</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutRow}>
            <View style={styles.settingInfo}>
              <Github size={20} color={colors.text} />
              <Text style={styles.settingText}>GitHub Repository</Text>
            </View>
          </TouchableOpacity>
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
    marginTop: 4,
    color: colors.textSecondary,
  },
  section: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.text,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.text,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});