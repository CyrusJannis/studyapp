import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  Brain,
  Plus,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useTaskStore } from "@/store/task-store";
import { useTimerStore } from "@/store/timer-store";
import { TaskItem } from "@/components/TaskItem";
import { StatsCard } from "@/components/StatsCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { formatDuration, getTodayISOString } from "@/utils/date-utils";

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, getTasksForDate, getCompletionRate } = useTaskStore();
  const { totalFocusTime, totalSessions, dailyFocusTime } = useTimerStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const today = getTodayISOString();
  const todayTasks = getTasksForDate(today);
  const completionRate = getCompletionRate();
  const todayFocusTime = dailyFocusTime[today] || 0;
  
  // Get the last 7 days of focus time
  const getWeeklyFocusTime = () => {
    let total = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      total += dailyFocusTime[dateString] || 0;
    }
    
    return total;
  };
  
  const weeklyFocusTime = getWeeklyFocusTime();
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const navigateToTasks = () => {
    router.push("/tasks");
  };
  
  const navigateToTimer = () => {
    router.push("/timer");
  };
  
  const navigateToAssistant = () => {
    router.push("/assistant");
  };
  
  const navigateToNewTask = () => {
    router.push("/tasks/new");
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.subtitle}>Let's have a productive day</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Focus Statistics</Text>
          
          <StatsCard
            title="Today's Focus Time"
            value={formatDuration(Math.floor(todayFocusTime / 60))}
            icon={<Clock size={24} color={colors.primary} />}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statHalf}>
              <StatsCard
                title="Weekly Focus"
                value={formatDuration(Math.floor(weeklyFocusTime / 60))}
                icon={<Calendar size={24} color={colors.primary} />}
              />
            </View>
            
            <View style={styles.statHalf}>
              <StatsCard
                title="Total Sessions"
                value={totalSessions}
                icon={<BarChart3 size={24} color={colors.primary} />}
              />
            </View>
          </View>
          
          <StatsCard
            title="Task Completion Rate"
            value={`${Math.round(completionRate)}%`}
            icon={<CheckCircle size={24} color={colors.primary} />}
          />
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <TouchableOpacity onPress={navigateToTasks}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tasksContainer}>
          {todayTasks.length > 0 ? (
            todayTasks.slice(0, 3).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <EmptyState
              title="No Tasks Today"
              message="Add tasks to plan your day effectively"
              icon={<Calendar size={32} color={colors.primary} />}
            />
          )}
          
          <Button
            title="Add New Task"
            onPress={navigateToNewTask}
            variant="outline"
            icon={<Plus size={18} color={colors.primary} style={{ marginRight: 8 }} />}
            style={styles.addButton}
          />
        </View>
        
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTimer}
            >
              <View style={styles.actionIcon}>
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Start Timer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToAssistant}
            >
              <View style={styles.actionIcon}>
                <Brain size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Ask AI Assistant</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    color: colors.textSecondary,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  tasksContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    marginTop: 12,
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: colors.primaryLight,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: colors.text,
  },
});