import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function StatusBadge({ status, style, textStyle }) {
  const { t } = useTranslation();

  // Unified color mapping based on status categories
  const getStatusConfig = (statusStr) => {
    const normalized = String(statusStr).trim();

    switch (normalized) {
      // SUCCESS (Teal/Green)
      case "Approved":
      case "Completed":
      case "Resolved":
      case "Active":
      case "Paid":
        return {
          bg: "rgba(43, 155, 114, 0.08)", // 2B9B72 at 8% opacity
          text: "#2B9B72",
          labelKey: `orders.status.${normalized.toLowerCase()}`,
        };

      // WARNING / PENDING (Gold/Amber)
      case "Pending":
      case "In Progress":
      case "Unpaid":
        return {
          bg: "rgba(198, 164, 126, 0.08)", // C6A47E at 8% opacity
          text: "#C6A47E",
          labelKey: normalized === "In Progress" ? "complaints.in_progress" : `orders.status.${normalized.toLowerCase()}`,
        };

      // CLOSED / DANGER (Slate/Red)
      case "Canceled":
      case "Cancelled":
      case "Rejected":
      case "Expired":
      case "Closed":
        return {
          bg: "rgba(107, 114, 128, 0.08)", // Grey at 8% opacity
          text: "#6B7280",
          labelKey: normalized === "Closed" ? "complaints.closed" : `orders.status.${normalized.toLowerCase()}`,
        };

      default:
        return {
          bg: "rgba(156, 163, 175, 0.08)",
          text: "#9CA3AF",
          labelKey: null,
        };
    }
  };

  const config = getStatusConfig(status);
  
  // Attempt translation. Fallback to translated key or original status.
  const translatedLabel = config.labelKey ? t(config.labelKey, status) : status;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }, textStyle]}>
        {translatedLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 11,
    fontFamily: "CairoBold",
  },
});
