import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Platform, Image, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { RTL } from "../../utils/rtlHelper";

const RecruitmentBanner = ({
  title,
  subtitle,
  backgroundImage = require("@/assets/images/banner.jpg"),
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Gentle, slow breathing loop for the halo ring and avatar to make the banner feel alive
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.04,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    /* Immersive Light Glassmorphic Gradient Container Card */
    <LinearGradient
      colors={["rgba(255, 255, 255, 0.65)", "rgba(235, 247, 244, 0.7)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.bannerContainer, { flexDirection: RTL.rowDir() }]}
    >
      
      {/* Decorative subtle vector glow inside the card background */}
      <View style={styles.cardVectorGlow} />

      {/* 1. Typography & Value Proofs Section (65% Width) */}
      <View style={[styles.textSection, { alignItems: isRtl ? "flex-start" : "flex-end" }]}>
        <Text style={[styles.bannerTitle, { textAlign: RTL.textAlign() }]}>
          {title}
        </Text>
        <Text style={[styles.bannerSubtitle, { textAlign: RTL.textAlign() }]} numberOfLines={2}>
          {subtitle}
        </Text>

        {/* Row of Translucent Brand Value Badges */}
        <View style={[styles.badgesRow, { flexDirection: RTL.rowDir() }]}>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>
              {isRtl ? "✓ عقود موثقة" : "✓ Certified Contracts"}
            </Text>
          </View>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>
              {isRtl ? "✓ عمالة مدربة" : "✓ Trained Staff"}
            </Text>
          </View>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>
              {isRtl ? "✓ إجراءات سريعة" : "✓ Fast Process"}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Levitating Circular Avatar & Double Halo Ring (35% Width) */}
      <View style={styles.avatarSection}>
        <Animated.View style={[styles.outerHalo, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.innerHalo}>
            <Image
              source={backgroundImage}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
      </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    height: 175,
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.85)", // High-gloss reflective glass border
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#2B9B72", // Emerald Teal shadow aura
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 0, // Flat on Android to guarantee absolute translucent rendering stability
      },
    }),
  },
  cardVectorGlow: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(43, 155, 114, 0.06)", // Subtle internal decorative glow
    zIndex: -1,
  },
  textSection: {
    flex: 1.6,
    justifyContent: "center",
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 19,
    fontFamily: "CairoBold",
    color: "#002E5A", // Brand Navy
    lineHeight: 25,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    fontFamily: "Cairo",
    color: "#6B7280", // Muted charcoal grey
    lineHeight: 16,
    marginBottom: 14,
    paddingRight: 10,
  },
  badgesRow: {
    flexWrap: "wrap",
    gap: 5,
    width: "100%",
  },
  valueBadge: {
    backgroundColor: "rgba(43, 155, 114, 0.07)", // Translucent brand teal
    borderColor: "rgba(43, 155, 114, 0.15)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  valueBadgeText: {
    fontSize: 9,
    fontFamily: "CairoBold",
    color: "#2B9B72", // Emerald Teal Highlight
  },
  avatarSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  outerHalo: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.22)", // Glowing outer teal ring
    justifyContent: "center",
    alignItems: "center",
  },
  innerHalo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: "rgba(0, 46, 90, 0.15)", // Premium inner navy ring
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});

export default RecruitmentBanner;
