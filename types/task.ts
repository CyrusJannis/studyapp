export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string; // ISO date string
  priority: TaskPriority;
  subtasks: SubTask[];
  category?: string;
  estimatedMinutes?: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TasksByDate {
  [date: string]: Task[];
}