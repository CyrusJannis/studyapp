import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Trash2, Brain, PlusCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useAIStore } from "@/store/ai-store";
import { MessageBubble } from "@/components/MessageBubble";
import { EmptyState } from "@/components/EmptyState";
import { sendMessageToAI, getSystemPrompt, createTaskFromDescription } from "@/utils/ai-utils";
import * as Haptics from "expo-haptics";
import { useTaskStore } from "@/store/task-store";
import { generateTaskId } from "@/utils/task-utils";
import { Task } from "@/types/task";

export default function AssistantScreen() {
  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setLoading,
    setError,
  } = useAIStore();
  const { addTask } = useTaskStore();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Initialize with system message if empty
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: "system",
        content: getSystemPrompt(),
      });
    }
  }, []);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setShowSuggestions(false);
    
    // Add user message to the chat
    addMessage({
      role: "user",
      content: userMessage,
    });
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      setLoading(true);
      
      // Send to AI and get response
      const aiResponse = await sendMessageToAI([
        ...messages,
        { id: "temp", role: "user", content: userMessage, timestamp: Date.now() },
      ]);
      
      // Process the response to hide task format
      const processedResponse = processAIResponse(aiResponse);
      
      // Add AI response to the chat
      addMessage({
        role: "assistant",
        content: processedResponse,
      });
      
      // Scroll to bottom again after response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setError(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  };
  
  // Process AI response to hide task format but keep the data for extraction
  const processAIResponse = (response: string): string => {
    // Store the original response for task extraction
    const taskRegex = /TASK_TITLE:\s*(.+?)\s*\|\s*TASK_DESCRIPTION:\s*(.+?)\s*\|\s*TASK_PRIORITY:\s*(.+?)\s*\|\s*TASK_DATE:\s*(.+?)(\s|$)/g;
    
    // Replace the task format with a more user-friendly format
    return response.replace(taskRegex, (match, title, description, priority, date) => {
      return `📋 Task: "${title}" (${priority} priority, due ${date})`;
    });
  };
  
  const handleClearChat = () => {
    clearMessages();
    
    // Re-add system message
    addMessage({
      role: "system",
      content: getSystemPrompt(),
    });
    
    setShowSuggestions(true);
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };
  
  const extractTasksFromText = (text: string): Task[] => {
    const tasks: Task[] = [];
    
    // Look for task format patterns
    const taskRegex = /TASK_TITLE:\s*(.+?)\s*\|\s*TASK_DESCRIPTION:\s*(.+?)\s*\|\s*TASK_PRIORITY:\s*(.+?)\s*\|\s*TASK_DATE:\s*(.+?)(\s|$)/g;
    
    let match;
    while ((match = taskRegex.exec(text)) !== null) {
      const title = match[1].trim();
      const description = match[2].trim();
      const priority = match[3].trim().toLowerCase() as "low" | "medium" | "high";
      const date = match[4].trim();
      
      tasks.push({
        id: generateTaskId(),
        title,
        description,
        priority,
        date,
        completed: false,
        subtasks: [],
      });
    }
    
    return tasks;
  };
  
  // Check if a message contains tasks
  const messageContainsTasks = (content: string): boolean => {
    const taskRegex = /TASK_TITLE:|📋 Task:/i;
    return taskRegex.test(content);
  };
  
  const addTasksFromMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== "assistant") return;
    
    // Get the original message content before processing
    const originalContent = message.content;
    
    // Extract tasks from the message
    const tasks = extractTasksFromText(originalContent);
    
    if (tasks.length === 0) {
      // If no tasks found in the format, try to create a single task
      const taskData = createTaskFromDescription(originalContent);
      if (taskData) {
        addTask({
          id: generateTaskId(),
          title: taskData.title || "Task from AI",
          description: taskData.description || "",
          priority: taskData.priority || "medium",
          date: taskData.date || new Date().toISOString().split("T")[0],
          completed: false,
          subtasks: [],
        });
        
        // Add confirmation message
        addMessage({
          role: "assistant",
          content: "Task added successfully!",
        });
        
        // Provide haptic feedback
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        return;
      }
      
      // If still no task found, ask AI to create a task
      Alert.alert(
        "No Tasks Found",
        "No tasks were found in this message. Would you like me to create a task based on this conversation?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Create Task",
            onPress: createTaskFromAI,
          },
        ]
      );
      return;
    }
    
    // Add all found tasks
    tasks.forEach(task => {
      addTask(task);
    });
    
    // Add confirmation message
    addMessage({
      role: "assistant",
      content: `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} added successfully!`,
    });
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const createTaskFromAI = async () => {
    if (messages.length <= 1) {
      // Only system message exists
      return;
    }
    
    try {
      setLoading(true);
      
      // Ask AI to create a task
      const prompt = "Based on our conversation, please create a task in this exact format: TASK_TITLE: [title] | TASK_DESCRIPTION: [description] | TASK_PRIORITY: [low/medium/high] | TASK_DATE: [YYYY-MM-DD]";
      
      addMessage({
        role: "user",
        content: prompt,
      });
      
      const aiResponse = await sendMessageToAI([
        ...messages,
        { id: "temp", role: "user", content: prompt, timestamp: Date.now() },
      ]);
      
      // Process the response to hide task format
      const processedResponse = processAIResponse(aiResponse);
      
      // Add the processed response
      addMessage({
        role: "assistant",
        content: processedResponse,
      });
      
      // Extract and add tasks from the original response
      const tasks = extractTasksFromText(aiResponse);
      
      if (tasks.length > 0) {
        tasks.forEach(task => {
          addTask(task);
        });
        
        // Add confirmation message
        addMessage({
          role: "assistant",
          content: `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} added successfully!`,
        });
      } else {
        // If no tasks found in the format, try to create a single task
        const taskData = createTaskFromDescription(aiResponse);
        if (taskData) {
          addTask({
            id: generateTaskId(),
            title: taskData.title || "Task from AI",
            description: taskData.description || "",
            priority: taskData.priority || "medium",
            date: taskData.date || new Date().toISOString().split("T")[0],
            completed: false,
            subtasks: [],
          });
          
          // Add confirmation message
          addMessage({
            role: "assistant",
            content: "Task added successfully!",
          });
        } else {
          // If still no task found
          addMessage({
            role: "assistant",
            content: "I couldn't create a task from our conversation. Please try again with more specific details.",
          });
        }
      }
      
      // Provide haptic feedback
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error creating task:", error);
      setError(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== "system");
  
  const suggestions = [
    "Help me create a study plan for my final exams",
    "What's the most effective way to study for a math test?",
    "Can you help me organize my tasks by priority?",
    "How can I improve my focus during study sessions?",
    "Create a task for my project due next week"
  ];
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Assistant</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={createTaskFromAI}
            disabled={isLoading || messages.length <= 1}
          >
            <PlusCircle size={20} color={messages.length <= 1 ? colors.textTertiary : colors.primary} />
          </TouchableOpacity>
          
          {displayMessages.length > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearChat}
            >
              <Trash2 size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {displayMessages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble 
                message={item} 
                showAddTaskButton={item.role === "assistant" && messageContainsTasks(item.content)}
                onAddTask={() => addTasksFromMessage(item.id)}
              />
            )}
            contentContainerStyle={styles.messagesList}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Your AI Study Assistant"
              message="I can help with study plans, task organization, and learning techniques. What would you like help with today?"
              icon={<Brain size={32} color={colors.primary} />}
            />
            
            {showSuggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your study assistant..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: colors.card,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    padding: 16,
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.text,
  },
  suggestionButton: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },
});