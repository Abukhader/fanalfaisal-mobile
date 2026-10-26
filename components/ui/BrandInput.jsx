import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";

export default function BrandInput({
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
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isRtl = RTL.textAlign() === "right";

  const containerStyle = [
    styles.inputWrapper,
    isFocused && styles.inputWrapperFocused,
    error && styles.inputWrapperError,
    multiline && styles.inputWrapperMultiline,
    style,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { textAlign: RTL.textAlign() }]}>
          {label}
        </Text>
      )}

      <View style={[containerStyle, { flexDirection: RTL.rowDir() }]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {typeof leftIcon === "string" ? (
              <Icon name={leftIcon} size={20} color={isFocused ? "#002E5A" : "#9CA3AF"} />
            ) : (
              leftIcon
            )}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
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
        />

        {rightIcon && (
          <View style={styles.iconContainer}>
            {typeof rightIcon === "string" ? (
              <Icon name={rightIcon} size={20} color={isFocused ? "#002E5A" : "#9CA3AF"} />
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>

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
    color: "#374151", // Charcoal
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    alignItems: "center",
    gap: 8,
  },
  inputWrapperFocused: {
    borderColor: "#002E5A", // Brand Navy
  },
  inputWrapperError: {
    borderColor: "#EF4444", // Red error
  },
  inputWrapperMultiline: {
    height: "auto",
    paddingVertical: 10,
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
    color: "#1F2937",
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
