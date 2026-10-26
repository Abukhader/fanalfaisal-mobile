import React, { useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function GlassButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Shimmer animation loop (sweeps a bright light highlight across the button every 3 seconds)
  useEffect(() => {
    const startShimmer = () => {
      shimmerAnim.setValue(0);
      Animated.sequence([
        Animated.delay(1000), // Delay between sweeps
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]).start((o) => {
        if (o.finished) {
          startShimmer();
        }
      });
    };
    
    if (!disabled && !loading) {
      startShimmer();
    }
  }, [disabled, loading]);

  const handlePressIn = () => {
    if (loading || disabled) return;
    
    // Smoothly scale down on press
    Animated.spring(scaleValue, {
      toValue: 0.96,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
    
    // Soft haptic tick
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    if (loading || disabled) return;
    
    // Rebound to original scale
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (loading || disabled) return;
    
    // Play a distinct success-like haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    
    if (onPress) onPress();
  };

  // Interpolate shimmer translateX
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 400], // Sweeps from far left to far right
  });

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: scaleValue }] },
          disabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={disabled ? ["#334155", "#475569"] : ["#002E5A", "#2B9B72"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Shimmer overlay element */}
          {!disabled && !loading && (
            <Animated.View
              style={[
                styles.shimmerContainer,
                { transform: [{ translateX: shimmerTranslateX }, { skewX: "-25deg" }] },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.35)",
                  "rgba(255, 255, 255, 0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmer}
              />
            </Animated.View>
          )}

          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Text style={[styles.text, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#2B9B72",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "CairoBold",
    lineHeight: 22,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  shimmerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 100,
  },
  shimmer: {
    flex: 1,
  },
});
