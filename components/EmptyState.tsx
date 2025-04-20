import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "@/constants/colors";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  imageUrl?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  imageUrl,
}) => {
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : null}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
});