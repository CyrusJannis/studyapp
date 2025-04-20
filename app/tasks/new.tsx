import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  Clock,
  Flag,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useTaskStore } from "@/store/task-store";
import { Button } from "@/components/Button";
import {
  generateTaskId,
  generateSubtaskId,
  getPriorityColor,
  getPriorityLabel,
} from "@/utils/task-utils";
import { Task, TaskPriority, SubTask } from "@/types/task";
import * as Haptics from "expo-haptics";

export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addTask } = useTaskStore();
  
  const initialDate = params.date
    ? String(params.date)
    : new Date().toISOString().split("T")[0];
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(
    undefined
  );
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtask: SubTask = {
      id: generateSubtaskId(),
      title: newSubtask.trim(),
      completed: false,
    };
    
    setSubtasks([...subtasks, subtask]);
    setNewSubtask("");
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: generateTaskId(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      date,
      priority,
      subtasks,
      estimatedMinutes: estimatedMinutes || undefined,
    };
    
    addTask(newTask);
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const isFormValid = title.trim().length > 0;
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "New Task",
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSave}
              disabled={!isFormValid}
            >
              <Check
                size={24}
                color={isFormValid ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about your task"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.datePickerButton}>
                <Calendar size={20} color={colors.textSecondary} />
                <Text style={styles.dateText}>
                  {new Date(date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && {
                        backgroundColor: getPriorityColor(p) + "20",
                        borderColor: getPriorityColor(p),
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Flag
                      size={16}
                      color={
                        priority === p
                          ? getPriorityColor(p)
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        priority === p && {
                          color: getPriorityColor(p),
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {getPriorityLabel(p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Time (minutes)</Text>
              <View style={styles.timeContainer}>
                <Clock size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.timeInput}
                  placeholder="Minutes"
                  value={
                    estimatedMinutes !== undefined
                      ? estimatedMinutes.toString()
                      : ""
                  }
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    setEstimatedMinutes(isNaN(num) ? undefined : num);
                  }}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subtasks</Text>
              
              {subtasks.map((subtask) => (
                <View key={subtask.id} style={styles.subtaskItem}>
                  <Text style={styles.subtaskText}>{subtask.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSubtask(subtask.id)}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={styles.subtaskInput}
                  placeholder="Add a subtask"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity
                  style={styles.addSubtaskButton}
                  onPress={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                >
                  <Plus
                    size={20}
                    color={
                      newSubtask.trim()
                        ? colors.primary
                        : colors.textTertiary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Task"
            onPress={handleSave}
            disabled={!isFormValid}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  priorityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  subtaskText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  addSubtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 8,
  },
  addSubtaskButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
});