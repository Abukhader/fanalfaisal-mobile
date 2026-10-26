import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RTL } from "../../utils/rtlHelper";

export default function ComplaintStatsCard({ stats, t, isRtl }) {
  return (
    <LinearGradient
      colors={["#002E5A", "#00479E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsCard}
    >
      <View style={[styles.statsHeader, { flexDirection: RTL.rowDir() }]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.statsCardTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {t("complaints.stats_title", "نظرة عامة على طلباتك")}
          </Text>
          <Text style={[styles.statsCardSub, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {isRtl
              ? `تم حل ${stats.resolved} من أصل ${stats.total} طلبات`
              : `Resolved ${stats.resolved} of ${stats.total} requests`}
          </Text>
        </View>
        <View style={styles.statsPercentBadge}>
          <Text style={[styles.statsPercentText, { writingDirection: RTL.writingDirection() }]}>{stats.percent}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarBg, { flexDirection: RTL.rowDir() }]}>
        <View style={[styles.progressBarFill, { width: `${stats.percent}%` }]} />
      </View>

      {/* Mini Stats Row */}
      <View style={[styles.miniStatsRow, { flexDirection: RTL.rowDir() }]}>
        <View style={styles.miniStatItem}>
          <Text style={[styles.miniStatVal, { writingDirection: RTL.writingDirection() }]}>{stats.pending}</Text>
          <Text style={[styles.miniStatLbl, { writingDirection: RTL.writingDirection() }]}>{t("complaints.pending")}</Text>
        </View>
        <View style={[styles.miniStatDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
        <View style={styles.miniStatItem}>
          <Text style={[styles.miniStatVal, { writingDirection: RTL.writingDirection() }]}>{stats.inProgress}</Text>
          <Text style={[styles.miniStatLbl, { writingDirection: RTL.writingDirection() }]}>{t("complaints.in_progress")}</Text>
        </View>
        <View style={[styles.miniStatDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
        <View style={styles.miniStatItem}>
          <Text style={[styles.miniStatVal, { writingDirection: RTL.writingDirection() }]}>{stats.resolved}</Text>
          <Text style={[styles.miniStatLbl, { writingDirection: RTL.writingDirection() }]}>{t("complaints.resolved")}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#002E5A",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statsHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsCardTitle: {
    fontFamily: "CairoBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  statsCardSub: {
    fontFamily: "Cairo",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  statsPercentBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsPercentText: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    marginBottom: 18,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2B9B72",
    borderRadius: 3,
  },
  miniStatsRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  miniStatItem: {
    flex: 1,
    alignItems: "center",
  },
  miniStatVal: {
    fontFamily: "CairoBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  miniStatLbl: {
    fontFamily: "Cairo",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 2,
  },
  miniStatDivider: {
    width: 1,
    height: 24,
  },
});
