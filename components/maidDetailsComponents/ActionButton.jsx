import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { RTL } from "../../utils/rtlHelper";

const ActionButton = ({ text, icon, onPress, variant = "teal" }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.94, // انضغاط نابضي سلس عند اللمس
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) onPress();
  };

  const isNavy = variant === "navy";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.actionButton,
          isNavy ? styles.navyBtn : styles.tealBtn,
          { transform: [{ scale: scaleValue }], flexDirection: RTL.rowDir() },
        ]}
      >
        <Icon
          name={icon}
          size={18}
          color="#FFFFFF"
          style={RTL.select({ marginLeft: 0, marginRight: 6 }, { marginLeft: 6, marginRight: 0 })}
        />
        <Text style={styles.actionText} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: "48%",
  },
  actionButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    elevation: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tealBtn: {
    backgroundColor: "#2B9B72", // زمردي زمردي للشاشات
    shadowColor: "#2B9B72",
    shadowOpacity: 0.08,
  },
  navyBtn: {
    backgroundColor: "#002E5A", // كحلي ملكي عميق
    shadowColor: "#002E5A",
    shadowOpacity: 0.08,
  },
  actionText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 12,
    textAlign: "center",
  },
});

export default ActionButton;
