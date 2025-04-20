import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Clock } from "lucide-react-native";
import { Task } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import { colors } from "@/constants/colors";
import { getPriorityColor, getCompletionPercentage } from "@/utils/task-utils";

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { toggleTaskCompletion, toggleSubtaskCompletion } = useTaskStore();
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  
  const handleToggle = () => {
    toggleTaskCompletion(task.id);
  };
  
  const handleToggleSubtask = (subtaskId: string) => {
    toggleSubtaskCompletion(task.id, subtaskId);
  };
  
  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    Animated.timing(rotateAnim, {
      toValue: newExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  
  const priorityColor = getPriorityColor(task.priority);
  const completionPercentage = getCompletionPercentage(task);
  const hasSubtasks = task.subtasks.length > 0;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainRow}
        onPress={onPress || toggleExpand}
        activeOpacity={0.7}
      >
        <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
          {task.completed ? (
            <CheckCircle size={24} color={colors.primary} />
          ) : (
            <Circle size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                task.completed && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {task.estimatedMinutes && (
              <View style={styles.timeContainer}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.timeText}>{task.estimatedMinutes}m</Text>
              </View>
            )}
          </View>
          
          {task.description ? (
            <Text
              style={[
                styles.description,
                task.completed && styles.completedText,
              ]}
              numberOfLines={expanded ? undefined : 1}
            >
              {task.description}
            </Text>
          ) : null}
          
          {hasSubtasks && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%`, backgroundColor: priorityColor },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{completionPercentage}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.rightContainer}>
          <View
            style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}
          />
          
          {hasSubtasks && (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <ChevronDown size={20} color={colors.textSecondary} />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
      
      {expanded && hasSubtasks && (
        <View style={styles.subtasksContainer}>
          {task.subtasks.map((subtask) => (
            <TouchableOpacity
              key={subtask.id}
              style={styles.subtaskRow}
              onPress={() => handleToggleSubtask(subtask.id)}
            >
              {subtask.completed ? (
                <CheckCircle size={18} color={colors.primary} />
              ) : (
                <Circle size={18} color={colors.textSecondary} />
              )}
              <Text
                style={[
                  styles.subtaskText,
                  subtask.completed && styles.completedText,
                ]}
              >
                {subtask.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  mainRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  checkbox: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: colors.textTertiary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    width: 36,
    textAlign: "right",
  },
  subtasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 36,
  },
  subtaskText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
});