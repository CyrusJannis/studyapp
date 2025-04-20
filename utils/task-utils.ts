import { Task, TaskPriority } from "@/types/task";

export const generateTaskId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

export const generateSubtaskId = (): string => {
  return "sub-" + Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "#FF3B30";
    case "medium":
      return "#F5A623";
    case "low":
      return "#34C759";
    default:
      return "#8E8E93";
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "None";
  }
};

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  
  return [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

export const getCompletionPercentage = (task: Task): number => {
  if (task.subtasks.length === 0) {
    return task.completed ? 100 : 0;
  }
  
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
};