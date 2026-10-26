import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function BrandButton({
  title,
  onPress,
  variant = "solid", // "solid" | "outline" | "gradient" | "text"
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = "left", // "left" | "right"
}) {
  const handlePress = () => {
    if (loading || disabled) return;
    
    // Premium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    
    if (onPress) onPress();
  };

  const isSolid = variant === "solid";
  const isOutline = variant === "outline";
  const isGradient = variant === "gradient";
  const isText = variant === "text";

  const buttonStyle = [
    styles.button,
    isSolid && styles.buttonSolid,
    isOutline && styles.buttonOutline,
    isText && styles.buttonTextOnly,
    disabled && styles.buttonDisabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    isSolid && styles.labelSolid,
    isOutline && styles.labelOutline,
    isGradient && styles.labelGradientText,
    isText && styles.labelTextOnly,
    disabled && styles.labelDisabled,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={isSolid || isGradient ? "#FFFFFF" : "#002E5A"}
        />
      );
    }

    return (
      <View style={[styles.contentWrapper, iconPosition === "right" && styles.rowReverse]}>
        {icon && <View style={[styles.iconWrapper, iconPosition === "left" ? styles.marginRight : styles.marginLeft]}>{icon}</View>}
        <Text style={labelStyle}>{title}</Text>
      </View>
    );
  };

  if (isGradient && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[styles.gradientContainer, style]}
      >
        <LinearGradient
          colors={["#002E5A", "#2B9B72"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientFill}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  gradientContainer: {
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  buttonSolid: {
    backgroundColor: "#002E5A",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#002E5A",
  },
  buttonTextOnly: {
    backgroundColor: "transparent",
    height: "auto",
    paddingHorizontal: 0,
  },
  buttonDisabled: {
    backgroundColor: "#E2E8F0",
    borderColor: "#E2E8F0",
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  marginRight: {
    marginRight: 8,
  },
  marginLeft: {
    marginLeft: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: "CairoBold",
  },
  labelSolid: {
    color: "#FFFFFF",
  },
  labelGradientText: {
    color: "#FFFFFF",
  },
  labelOutline: {
    color: "#002E5A",
  },
  labelTextOnly: {
    color: "#002E5A",
  },
  labelDisabled: {
    color: "#94A3B8",
  },
});
