import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";
import GlassCard from "../ui/GlassCard";

const services = [
  {
    titleAr: "خدمات التوسط",
    titleEn: "Mediation Services",
    iconName: "business-center",
    route: "/recruitment",
    serviceKey: "توسط",
    glowColor: "rgba(0, 46, 90, 0.05)",
    iconColor: "#002E5A",
  },
  {
    titleAr: "العقود الشهرية",
    titleEn: "Monthly Contracts",
    iconName: "calendar-month",
    route: "/monthlyContracts",
    serviceKey: "شهري",
    glowColor: "rgba(43, 155, 114, 0.06)",
    iconColor: "#2B9B72",
  },
  {
    titleAr: "خدمات بالساعة",
    titleEn: "Hourly Services",
    iconName: "schedule",
    route: "/hourlyServices",
    serviceKey: "ساعة",
    glowColor: "rgba(198, 164, 126, 0.08)",
    iconColor: "#C6A47E",
  },
  {
    titleAr: "خدمات التنظيف",
    titleEn: "Cleaning Services",
    iconName: "cleaning-services",
    route: "/cleaning",
    serviceKey: "تنظيف",
    glowColor: "rgba(43, 155, 114, 0.06)",
    iconColor: "#2B9B72",
  },
];

export default function ServicesList() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const handleServicePress = (route, serviceKey) => {
    router.push({
      pathname: route,
      params: { serviceKey },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={[styles.sectionHeader, { flexDirection: RTL.rowDir() }]}>
        <Text style={styles.sectionTitle}>
          {isRtl ? "الوصول السريع للخدمات" : "Quick Services Access"}
        </Text>
      </View>

      {/* Grid of Ultra-Sleek Pill Buttons */}
      <View style={[styles.gridContainer, { flexDirection: RTL.rowDir() }]}>
        {services.map((service, index) => {
          const displayTitle = isRtl ? service.titleAr : service.titleEn;

          return (
            <View key={index} style={styles.gridItem}>
              <GlassCard
                onPress={() => handleServicePress(service.route, service.serviceKey)}
                style={styles.pillCard}
              >
                <View style={[styles.pillInner, { flexDirection: RTL.rowDir() }]}>
                  {/* Glowing Icon Circle */}
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: service.glowColor,
                        borderColor: service.iconColor + "15",
                      },
                    ]}
                  >
                    <Icon name={service.iconName} size={15} color={service.iconColor} />
                  </View>

                  {/* Title */}
                  <View style={styles.textContainer}>
                    <Text
                      style={[styles.pillTitle, { textAlign: RTL.textAlign() }]}
                      numberOfLines={1}
                    >
                      {displayTitle}
                    </Text>
                  </View>

                  {/* Subtle Interactive Chevron */}
                  <View style={styles.arrowWrapper}>
                    <Icon
                      name={isRtl ? "keyboard-arrow-left" : "keyboard-arrow-right"}
                      size={16}
                      color={service.iconColor}
                      style={styles.chevronIcon}
                    />
                  </View>
                </View>
              </GlassCard>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
    width: "100%",
  },
  sectionHeader: {
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  sectionTitle: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#002E5A",
    opacity: 0.9,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
  },
  gridItem: {
    width: "48.5%", // 2 columns
  },
  pillCard: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 25, // Sleek capsule shape
    paddingVertical: 6,
    paddingHorizontal: 10, // Balanced internal padding
    height: 50, // Ultra-compact vertical footprint
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  pillInner: {
    alignItems: "center",
    width: "100%",
    gap: 10, // Perfect spacing in both RTL and LTR
  },
  iconCircle: {
    width: 30, // Scaled down from 36
    height: 30, // Scaled down from 36
    borderRadius: 15, // Perfect circle (width / 2)
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  pillTitle: {
    fontFamily: "CairoBold",
    fontSize: 11,
    color: "#002E5A",
    lineHeight: 15,
  },
  arrowWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  chevronIcon: {
    opacity: 0.6,
  },
});
