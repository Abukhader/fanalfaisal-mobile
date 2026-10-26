import React, { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

export default function GlassCard({
  children,
  onPress,
  style,
  activeOpacity = 0.9,
  interactive = true,
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress || !interactive) return;
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress || !interactive) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const cardContent = (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }, style]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.88)", // Sleek glass-like transparency
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)", // Soft high-contrast border
    borderRadius: 18,
    padding: 16,
    width: "100%",
    elevation: 3, // Soft shadow for Android
    shadowColor: "#002E5A", // Shadow tinted with brand navy
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
