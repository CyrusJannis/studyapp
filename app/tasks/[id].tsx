import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  Save,
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useTaskStore } from "@/store/task-store";
import { Button } from "@/components/Button";
import {
  generateSubtaskId,
  getPriorityColor,
  getPriorityLabel,
} from "@/utils/task-utils";
import { Task, TaskPriority, SubTask } from "@/types/task";
import * as Haptics from "expo-haptics";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tasks, updateTask, deleteTask } = useTaskStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(
    undefined
  );
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundTask = tasks.find((t) => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description || "");
        setDate(foundTask.date);
        setPriority(foundTask.priority);
        setEstimatedMinutes(foundTask.estimatedMinutes);
        setSubtasks(foundTask.subtasks);
      } else {
        // Task not found, go back
        router.back();
      }
    }
  }, [id, tasks]);
  
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
  
  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handleSave = () => {
    if (!title.trim() || !task) return;
    
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      priority,
      subtasks,
      estimatedMinutes: estimatedMinutes || undefined,
    };
    
    updateTask(task.id, updatedTask);
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (!task) return;
    
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTask(task.id);
            
            // Provide haptic feedback
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            
            router.back();
          },
        },
      ]
    );
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  if (!task) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: isEditing ? "Edit Task" : "Task Details",
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={isEditing ? handleSave : toggleEdit}
            >
              {isEditing ? (
                <Save size={24} color={colors.primary} />
              ) : (
                <Check size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={isEditing ? toggleEdit : () => router.back()}
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
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="Task title"
                  value={title}
                  onChangeText={setTitle}
                />
              ) : (
                <Text style={styles.valueText}>{title}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add details about your task"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.valueText}>
                  {description || "No description"}
                </Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              {isEditing ? (
                <TouchableOpacity style={styles.datePickerButton}>
                  <Calendar size={20} color={colors.textSecondary} />
                  <Text style={styles.dateText}>
                    {new Date(date).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.valueText}>
                  {new Date(date).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              {isEditing ? (
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
              ) : (
                <View style={styles.priorityDisplay}>
                  <Flag size={16} color={getPriorityColor(priority)} />
                  <Text
                    style={[
                      styles.priorityDisplayText,
                      { color: getPriorityColor(priority) },
                    ]}
                  >
                    {getPriorityLabel(priority)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Time</Text>
              {isEditing ? (
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
              ) : (
                <Text style={styles.valueText}>
                  {estimatedMinutes ? `${estimatedMinutes} minutes` : "Not set"}
                </Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subtasks</Text>
              
              {subtasks.map((subtask) => (
                <View key={subtask.id} style={styles.subtaskItem}>
                  <Text style={styles.subtaskText}>{subtask.title}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => handleRemoveSubtask(subtask.id)}
                    >
                      <Trash2 size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {isEditing && (
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
              )}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <Button
              title="Save Changes"
              onPress={handleSave}
              disabled={!title.trim()}
              fullWidth
            />
          ) : (
            <Button
              title="Delete Task"
              onPress={handleDelete}
              variant="outline"
              fullWidth
              style={{ borderColor: colors.danger }}
              textStyle={{ color: colors.danger }}
            />
          )}
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
  valueText: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
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
  priorityDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  priorityDisplayText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
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