import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    switch (variant) {
      case "primary":
        buttonStyle = {
          backgroundColor: colors.primary,
        };
        break;
      case "secondary":
        buttonStyle = {
          backgroundColor: colors.secondary,
        };
        break;
      case "outline":
        buttonStyle = {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case "text":
        buttonStyle = {
          backgroundColor: "transparent",
        };
        break;
    }
    
    if (disabled) {
      buttonStyle.opacity = 0.5;
    }
    
    if (fullWidth) {
      buttonStyle.width = "100%";
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let style: TextStyle = {};
    
    switch (variant) {
      case "primary":
      case "secondary":
        style = {
          color: "#fff",
        };
        break;
      case "outline":
      case "text":
        style = {
          color: colors.primary,
        };
        break;
    }
    
    switch (size) {
      case "small":
        style.fontSize = 14;
        break;
      case "medium":
        style.fontSize = 16;
        break;
      case "large":
        style.fontSize = 18;
        break;
    }
    
    return style;
  };
  
  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
        };
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "secondary" ? "#fff" : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});