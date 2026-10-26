import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { RTL } from "../../utils/rtlHelper";

/**
 * Reusable Modern Network Error / Offline Card with Retry capability
 */
const NetworkErrorView = ({
  title,
  message,
  onRetry,
  compact = false,
  style = {},
}) => {
  const { t, i18n } = useTranslation();
  const [retrying, setRetrying] = useState(false);
  const isAr = i18n.language === "ar";

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const displayTitle =
    title || (isAr ? "تعذر الاتصال بالخادم" : "Connection Issue");
  const displayMessage =
    message ||
    (isAr
      ? "يبدو أن اتصال الإنترنت ضعيف أو منقطع. يرجى التحقق من الشبكة والمحاولة مجدداً."
      : "Your internet connection seems weak or disconnected. Please check your network and try again.");

  if (compact) {
    return (
      <View style={[styles.compactContainer, { flexDirection: RTL.rowDir() }, style]}>
        <Icon name="wifi-off" size={18} color="#D97706" />
        <Text style={[styles.compactText, { textAlign: RTL.textAlign() }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        {onRetry && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRetry}
            disabled={retrying}
            style={styles.compactRetryBtn}
          >
            {retrying ? (
              <ActivityIndicator size="small" color="#002E5A" />
            ) : (
              <Text style={styles.compactRetryText}>{isAr ? "إعادة" : "Retry"}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {/* Icon with glowing soft aura */}
      <View style={styles.iconCircle}>
        <Icon name="wifi-off" size={38} color="#EF4444" />
      </View>

      <Text style={[styles.title, { textAlign: RTL.textAlign() }]}>
        {displayTitle}
      </Text>

      <Text style={[styles.message, { textAlign: RTL.textAlign() }]}>
        {displayMessage}
      </Text>

      {onRetry && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleRetry}
          disabled={retrying}
          style={[styles.retryButton, { flexDirection: RTL.rowDir() }]}
        >
          {retrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon
                name="refresh"
                size={18}
                color="#FFFFFF"
                style={RTL.select({ marginLeft: 6 }, { marginRight: 6 })}
              />
              <Text style={styles.retryButtonText}>
                {isAr ? "إعادة المحاولة" : "Try Again"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 20,
    elevation: 3,
    shadowColor: "#002E5A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  title: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: "#002E5A",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#002E5A",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 13,
  },
  // Compact Styles
  compactContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  compactText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "CairoBold",
    color: "#B45309",
  },
  compactRetryBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  compactRetryText: {
    fontSize: 10,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
});

export default NetworkErrorView;
