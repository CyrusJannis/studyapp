import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TasksByDate } from "@/types/task";

interface TaskState {
  tasks: Task[];
  tasksByDate: TasksByDate;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  getTasksForDate: (date: string) => Task[];
  getCompletionRate: () => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      tasksByDate: {},
      
      addTask: (task: Task) => {
        set((state) => {
          const newTasks = [...state.tasks, task];
          const newTasksByDate = { ...state.tasksByDate };
          
          if (!newTasksByDate[task.date]) {
            newTasksByDate[task.date] = [];
          }
          
          newTasksByDate[task.date] = [...newTasksByDate[task.date], task];
          
          return { tasks: newTasks, tasksByDate: newTasksByDate };
        });
      },
      
      updateTask: (taskId: string, updates: Partial<Task>) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;
          
          const updatedTask = { ...state.tasks[taskIndex], ...updates };
          const newTasks = [...state.tasks];
          newTasks[taskIndex] = updatedTask;
          
          // Handle date change by updating tasksByDate
          const oldTask = state.tasks[taskIndex];
          const newTasksByDate = { ...state.tasksByDate };
          
          // Remove from old date
          if (newTasksByDate[oldTask.date]) {
            newTasksByDate[oldTask.date] = newTasksByDate[oldTask.date].filter(
              (t) => t.id !== taskId
            );
          }
          
          // Add to new date
          const newDate = updates.date || oldTask.date;
          if (!newTasksByDate[newDate]) {
            newTasksByDate[newDate] = [];
          }
          
          newTasksByDate[newDate] = [...newTasksByDate[newDate], updatedTask];
          
          return { tasks: newTasks, tasksByDate: newTasksByDate };
        });
      },
      
      deleteTask: (taskId: string) => {
        set((state) => {
          const taskToDelete = state.tasks.find((t) => t.id === taskId);
          if (!taskToDelete) return state;
          
          const newTasks = state.tasks.filter((t) => t.id !== taskId);
          const newTasksByDate = { ...state.tasksByDate };
          
          if (newTasksByDate[taskToDelete.date]) {
            newTasksByDate[taskToDelete.date] = newTasksByDate[taskToDelete.date].filter(
              (t) => t.id !== taskId
            );
          }
          
          return { tasks: newTasks, tasksByDate: newTasksByDate };
        });
      },
      
      toggleTaskCompletion: (taskId: string) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;
          
          const newTasks = [...state.tasks];
          newTasks[taskIndex] = {
            ...newTasks[taskIndex],
            completed: !newTasks[taskIndex].completed,
            // Also mark all subtasks as completed
            subtasks: newTasks[taskIndex].subtasks.map((st) => ({
              ...st,
              completed: !newTasks[taskIndex].completed,
            })),
          };
          
          // Update in tasksByDate
          const task = newTasks[taskIndex];
          const newTasksByDate = { ...state.tasksByDate };
          
          if (newTasksByDate[task.date]) {
            const dateTaskIndex = newTasksByDate[task.date].findIndex(
              (t) => t.id === taskId
            );
            
            if (dateTaskIndex !== -1) {
              newTasksByDate[task.date] = [...newTasksByDate[task.date]];
              newTasksByDate[task.date][dateTaskIndex] = task;
            }
          }
          
          return { tasks: newTasks, tasksByDate: newTasksByDate };
        });
      },
      
      toggleSubtaskCompletion: (taskId: string, subtaskId: string) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;
          
          const newTasks = [...state.tasks];
          const subtaskIndex = newTasks[taskIndex].subtasks.findIndex(
            (st) => st.id === subtaskId
          );
          
          if (subtaskIndex === -1) return state;
          
          const newSubtasks = [...newTasks[taskIndex].subtasks];
          newSubtasks[subtaskIndex] = {
            ...newSubtasks[subtaskIndex],
            completed: !newSubtasks[subtaskIndex].completed,
          };
          
          newTasks[taskIndex] = {
            ...newTasks[taskIndex],
            subtasks: newSubtasks,
            // Check if all subtasks are completed to mark the task as completed
            completed: newSubtasks.every((st) => st.completed),
          };
          
          // Update in tasksByDate
          const task = newTasks[taskIndex];
          const newTasksByDate = { ...state.tasksByDate };
          
          if (newTasksByDate[task.date]) {
            const dateTaskIndex = newTasksByDate[task.date].findIndex(
              (t) => t.id === taskId
            );
            
            if (dateTaskIndex !== -1) {
              newTasksByDate[task.date] = [...newTasksByDate[task.date]];
              newTasksByDate[task.date][dateTaskIndex] = task;
            }
          }
          
          return { tasks: newTasks, tasksByDate: newTasksByDate };
        });
      },
      
      getTasksForDate: (date: string) => {
        return get().tasksByDate[date] || [];
      },
      
      getCompletionRate: () => {
        const tasks = get().tasks;
        if (tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter((t) => t.completed);
        return (completedTasks.length / tasks.length) * 100;
      },
    }),
    {
      name: "focus-plan-tasks",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);