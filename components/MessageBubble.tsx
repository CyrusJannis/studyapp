import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";
import { Message } from "@/store/ai-store";
import { PlusCircle } from "lucide-react-native";

interface MessageBubbleProps {
  message: Message;
  showAddTaskButton?: boolean;
  onAddTask?: () => void;
}

// Function to format markdown-like text
const formatText = (text: string) => {
  // Bold text (** or __)
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '•••$1•••').replace(/__(.*?)__/g, '•••$1•••');
  
  // Italic text (* or _)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '••$1••').replace(/_(.*?)_/g, '••$1••');
  
  // Lists
  formattedText = formattedText.replace(/^\s*[-*]\s+(.*?)$/gm, '  • $1');
  
  // Numbers
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '  $1. $2');
  
  return formattedText;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showAddTaskButton = false,
  onAddTask
}) => {
  const isUser = message.role === "user";
  
  // Format the message content
  const formattedContent = formatText(message.content);
  
  // Split the content by line breaks to handle formatting
  const contentLines = formattedContent.split('\n');
  
  return (
    <View style={styles.messageWrapper}>
      <View
        style={[
          styles.container,
          isUser ? styles.userContainer : styles.assistantContainer,
        ]}
      >
        {contentLines.map((line, index) => {
          // Check for bold text
          if (line.includes('•••')) {
            const parts = line.split('•••');
            return (
              <Text 
                key={index} 
                style={[
                  styles.text, 
                  isUser ? styles.userText : styles.assistantText
                ]}
              >
                {parts.map((part, i) => {
                  // Every odd index is bold
                  return i % 2 === 1 ? (
                    <Text key={i} style={styles.boldText}>{part}</Text>
                  ) : (
                    part
                  );
                })}
              </Text>
            );
          }
          
          // Check for italic text
          if (line.includes('••')) {
            const parts = line.split('••');
            return (
              <Text 
                key={index} 
                style={[
                  styles.text, 
                  isUser ? styles.userText : styles.assistantText
                ]}
              >
                {parts.map((part, i) => {
                  // Every odd index is italic
                  return i % 2 === 1 ? (
                    <Text key={i} style={styles.italicText}>{part}</Text>
                  ) : (
                    part
                  );
                })}
              </Text>
            );
          }
          
          // Regular text
          return (
            <Text 
              key={index} 
              style={[
                styles.text, 
                isUser ? styles.userText : styles.assistantText
              ]}
            >
              {line}
            </Text>
          );
        })}
        
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      
      {showAddTaskButton && !isUser && (
        <TouchableOpacity 
          style={styles.addTaskButton}
          onPress={onAddTask}
        >
          <PlusCircle size={20} color={colors.primary} />
          <Text style={styles.addTaskText}>Add to Tasks</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 16,
  },
  container: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  userContainer: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    backgroundColor: colors.primary,
  },
  assistantContainer: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    backgroundColor: colors.card,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: colors.text,
  },
  boldText: {
    fontWeight: "bold",
  },
  italicText: {
    fontStyle: "italic",
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  assistantTimestamp: {
    color: colors.textTertiary,
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  addTaskText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 4,
  },
});