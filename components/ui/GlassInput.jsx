import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";

export default function GlassInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Smoothly interpolate border color from subtle light border to glowing Emerald Teal
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#2B9B72"],
  });

  // Smoothly interpolate background color to be pure white on focus
  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F8FAFC", "#FFFFFF"],
  });

  // Smoothly interpolate shadow glow
  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.08],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { textAlign: RTL.textAlign() }]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
            shadowOpacity,
            shadowColor: "#002E5A",
            flexDirection: RTL.rowDir(),
          },
          error && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
          style,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            {typeof leftIcon === "string" ? (
              <Icon
                name={leftIcon}
                size={20}
                color={isFocused ? "#2B9B72" : "#94A3B8"}
              />
            ) : (
              leftIcon
            )}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { textAlign: RTL.textAlign() },
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          {...props}
        />

        {rightIcon && (
          <View style={styles.iconContainer}>
            {typeof rightIcon === "string" ? (
              <Icon
                name={rightIcon}
                size={20}
                color={isFocused ? "#2B9B72" : "#94A3B8"}
              />
            ) : (
              rightIcon
            )}
          </View>
        )}
      </Animated.View>

      {error ? (
        <Text style={[styles.errorText, { textAlign: RTL.textAlign() }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    alignItems: "center",
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  inputWrapperMultiline: {
    height: "auto",
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  input: {
    flex: 1,
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
    height: "100%",
  },
  inputMultiline: {
    verticalAlign: "top",
    minHeight: 100,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontFamily: "CairoBold",
    marginTop: 4,
  },
});
