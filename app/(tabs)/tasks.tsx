import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Calendar } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useTaskStore } from "@/store/task-store";
import { TaskItem } from "@/components/TaskItem";
import { CalendarStrip } from "@/components/CalendarStrip";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/utils/date-utils";
import { sortTasksByPriority } from "@/utils/task-utils";

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, getTasksForDate } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortedTasks, setSortedTasks] = useState<any[]>([]);
  
  useEffect(() => {
    const dateString = formatDate(selectedDate);
    const tasksForDate = getTasksForDate(dateString);
    setSortedTasks(sortTasksByPriority(tasksForDate));
  }, [selectedDate, tasks]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const navigateToNewTask = () => {
    router.push({
      pathname: "/tasks/new",
      params: { date: formatDate(selectedDate) },
    });
  };
  
  const navigateToTaskDetail = (taskId: string) => {
    router.push({
      pathname: "/tasks/[id]",
      params: { id: taskId },
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.taskCountText}>
              {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={navigateToNewTask}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {sortedTasks.length > 0 ? (
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onPress={() => navigateToTaskDetail(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this day</Text>
            <Text style={styles.emptySubtext}>Tap + to add a new task</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  taskCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});