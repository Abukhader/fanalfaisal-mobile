import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";

export default function ComplaintTicketCard({
  item,
  onPress,
  t,
  getStatusColors,
  getKindBadgeStyle,
  getStatusLabel,
  formatTicketDate,
}) {
  const statusColors = getStatusColors(item.status);
  const kindStyle = getKindBadgeStyle(item.kind);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.ticketCard}
    >
      <View style={[styles.ticketCardHeader, { flexDirection: RTL.rowDir() }]}>
        <Text style={[styles.ticketNum, { writingDirection: RTL.writingDirection() }]}>#{item.num}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusColors.bg,
              borderColor: statusColors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors.text, writingDirection: RTL.writingDirection() }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.ticketDetails, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}
      >
        {item.details}
      </Text>

      <View style={[styles.ticketCardFooter, { flexDirection: RTL.rowDir() }]}>
        <View style={[styles.dateRow, { flexDirection: RTL.rowDir() }]}>
          <Icon name="access-time" size={14} color="#9CA3AF" />
          <Text style={[styles.ticketDate, { writingDirection: RTL.writingDirection() }]}>
            {formatTicketDate(item.createdDate)}
          </Text>
        </View>
        <View
          style={[
            styles.kindBadge,
            {
              backgroundColor: kindStyle.bg,
              borderColor: kindStyle.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.kindBadgeText, { color: kindStyle.text, writingDirection: RTL.writingDirection() }]}>
            {item.kind}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  ticketCardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 46, 90, 0.05)",
  },
  ticketNum: { fontSize: 15, fontFamily: "CairoBold", color: "#002E5A" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontFamily: "CairoBold" },
  ticketDetails: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Cairo",
    lineHeight: 20,
    marginBottom: 14,
  },
  ticketCardFooter: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: { alignItems: "center", gap: 6 },
  ticketDate: { fontSize: 12, color: "#9CA3AF", fontFamily: "Cairo", marginTop: 2 },
  kindBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  kindBadgeText: { fontSize: 11, fontFamily: "CairoBold" },
});
