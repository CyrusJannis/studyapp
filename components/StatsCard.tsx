import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  iconContainer: {
    marginLeft: 16,
  },
});