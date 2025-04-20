import React from "react";
import { Tabs } from "expo-router";
import { Calendar, Clock, Home, MessageSquare, Settings } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="timer"
        options={{
          title: "Focus Timer",
          tabBarLabel: "Timer",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI Assistant",
          tabBarLabel: "Assistant",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}