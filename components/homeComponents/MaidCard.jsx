import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from "react-native";
import { useNavigation } from "expo-router/react-navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import workerImg from "../../assets/icons/service_15812095.png";
import { RTL } from "../../utils/rtlHelper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MaidCard = React.memo(({
  id,
  name,
  nationality,
  price,
  hours,
  isHourlyRental,
  photo,
  branch,
  service,
  horizontal = true, // default to horizontal landscape row
  showRating = true,
}) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isRtl = i18n.language === "ar";

  // Tactile Spring Animation Scale Value
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        setIsLoggedIn(!!userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    checkLoginStatus();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isLoggedIn) {
      navigation.navigate("MaidDetails", { maidId: id });
    } else {
      navigation.navigate("LoginPromptPage");
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97, // Delicate scale down on press
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

  const imageSource =
    photo && photo.uri && photo.uri !== "" ? { uri: photo.uri } : workerImg;

  const isPortrait = !horizontal;

  // ----------------- PORTRAIT LAYOUT (FOR HORIZONTAL HOME DECK) -----------------
  if (isPortrait) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={styles.portraitTouchable}
      >
        <Animated.View style={[styles.portraitCard, { transform: [{ scale: scaleValue }] }]}>
          {/* 1. Portrait Avatar: Double-layered Halo Ring */}
          <View style={styles.portraitAvatarContainer}>
            <View style={styles.avatarHaloOuter}>
              <View style={styles.avatarHaloInner}>
                <Image source={imageSource} style={styles.portraitAvatar} resizeMode="cover" />
              </View>
            </View>
          </View>

          {/* 2. Portrait Info Block */}
          <View style={styles.portraitInfo}>
            <Text style={styles.portraitName} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
            <Text style={styles.portraitNationality}>
              {t("maid_card.nationality")}: {nationality}
            </Text>

            {/* Premium Star Rating */}
            {showRating && (
              <View style={[styles.ratingRow, { flexDirection: RTL.rowDir() }]}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={12}
                    color="#2B9B72"
                    style={{ marginHorizontal: 1 }}
                  />
                ))}
              </View>
            )}


          </View>

          {/* 3. Portrait Badges & Tags (Floating side-by-side) */}
          <View style={[styles.portraitTagsRow, { flexDirection: RTL.rowDir() }]}>
            {/* Service Tag */}
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>

            {/* Branch Location Tag */}
            {branch && (
              <View style={styles.branchTag}>
                <Ionicons
                  name="location"
                  size={10}
                  color="#002E5A"
                  style={RTL.select({ marginLeft: 2 }, { marginRight: 2 })}
                />
                <Text style={styles.branchTagText}>{branch}</Text>
              </View>
            )}
          </View>

          {/* 4. Portrait Price & Action Footer */}
          <View style={[styles.portraitFooter, { flexDirection: RTL.rowDir() }]}>
            <View style={styles.portraitPriceCol}>
              {isHourlyRental && (
                <Text style={styles.priceLabel}>
                  {t("maid_card.explore_packages") || "استكشف الباقات المتاحة"}
                </Text>
              )}
              <View style={[styles.priceRow, { flexDirection: RTL.rowDir() }]}>
                <Text style={styles.portraitPriceVal}>{price}</Text>
                <Text style={styles.portraitCurrency}>{t("common.currency")}</Text>
              </View>
            </View>

            {/* Glowing CTA Booking Button */}
            <View style={styles.portraitCtaCircle}>
              <Ionicons name={isRtl ? "arrow-back" : "arrow-forward"} size={16} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // ----------------- LANDSCAPE ROW LAYOUT (FOR VERTICAL LISTINGS) -----------------
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      style={styles.touchable}
    >
      <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
        <View style={[styles.mainRow, { flexDirection: RTL.rowDir() }]}>
          
          {/* 1. Clean Framed Avatar (positioned neatly in the row) */}
          <View style={styles.imageFrameContainer}>
            <View style={styles.avatarHaloOuter}>
              <View style={styles.avatarHaloInner}>
                <Image source={imageSource} style={styles.image} resizeMode="cover" />
              </View>
            </View>
          </View>

          {/* 2. Worker Info (Aligned perfectly to prevent overlaps) */}
          <View style={[styles.infoContainer, { alignItems: RTL.flexAlign() }]}>
            <Text style={[styles.nameText, { textAlign: RTL.textAlign() }]} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>

            {/* Rating Stars row */}
            {showRating && (
              <View style={[styles.landscapeRatingRow, { flexDirection: RTL.rowDir() }]}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={11}
                    color="#2B9B72"
                    style={{ marginHorizontal: 0.5 }}
                  />
                ))}
              </View>
            )}

            <Text style={[styles.nationalityText, { textAlign: RTL.textAlign() }]}>
              {t("maid_card.nationality")}: {nationality}
            </Text>

            {/* Tags (Service & Branch) */}
            <View style={[styles.tagsWrapper, { flexDirection: RTL.rowDir() }]}>
              {service && (
                <View style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{service}</Text>
                </View>
              )}

              {branch && (
                <View style={styles.branchTag}>
                  <Ionicons
                    name="location"
                    size={10}
                    color="#002E5A"
                    style={RTL.select({ marginLeft: 2 }, { marginRight: 2 })}
                  />
                  <Text style={styles.branchTagText} numberOfLines={1}>{branch}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 3. Light Gradient Price Capsule (Harmonized with Banner) */}
          <LinearGradient
            colors={["rgba(43, 155, 114, 0.08)", "rgba(0, 46, 90, 0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.priceContainer}
          >
            <Text
              style={styles.priceText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {price}
            </Text>
            <Text style={styles.currencyText} numberOfLines={1}>{t("common.currency")}</Text>
            {isHourlyRental && hours && (
              <Text style={styles.hoursText} numberOfLines={1}>
                {hours} {i18n.language === "ar" ? "س" : "H"}
              </Text>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

MaidCard.displayName = "MaidCard";

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  cardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.75)", // زجاجي أبيض ناعم شبه شفاف يندمج مع تدرج الشاشة
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.16)", // إطار دقيق جداً بدرجة الزمرد يطابق كبسولات البانر
    elevation: 0, // إيقاف الظلال الداكنة المزعجة للأندرويد تماماً
    shadowColor: "#2B9B72", // ظلال ناعمة جداً بلون أخضر زمردي هادئ وباهت
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  mainRow: {
    alignItems: "center",
    padding: 12,
  },
  imageFrameContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHaloOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHaloInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: "#2B9B72",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8FAFC",
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  nameText: {
    fontFamily: "CairoBold",
    color: "#002E5A",
    fontSize: 13,
    marginBottom: 2,
    maxWidth: SCREEN_WIDTH - 200, // وضع حد لعرض الاسم لمنع التداخل
  },
  landscapeRatingRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  nationalityText: {
    fontFamily: "Cairo",
    color: "#64748B",
    fontSize: 11,
    marginBottom: 6,
  },
  tagsWrapper: {
    flexWrap: "wrap",
    gap: 6,
  },
  serviceTag: {
    backgroundColor: "rgba(43, 155, 114, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.15)",
  },
  serviceTagText: {
    fontFamily: "CairoBold",
    fontSize: 9.5,
    color: "#2B9B72",
  },
  branchTag: {
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.1)",
    alignItems: "center",
    flexDirection: "row",
    maxWidth: 130,
  },
  branchTagText: {
    fontFamily: "CairoBold",
    fontSize: 9.5,
    color: "#002E5A",
  },
  priceContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 84, // زيادة العرض الأدنى لمنع تكدس الأرقام الطويلة مثل "120.00"
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.2)",
  },
  priceText: {
    color: "#002E5A", // سعر بلون الكحلي الملكي المقروء
    fontFamily: "CairoBold",
    fontSize: 15,
    // تم إلغاء الـ lineHeight لتجنب قص الأحرف والأرقام العربية في خط Cairo
  },
  currencyText: {
    color: "#2B9B72", // العملة باللون الزمردي
    fontFamily: "CairoBold",
    fontSize: 9.5,
    marginTop: 1,
  },
  hoursText: {
    color: "#002E5A",
    fontFamily: "CairoBold",
    fontSize: 9,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0, 46, 90, 0.1)",
    paddingTop: 2,
    width: "100%",
    textAlign: "center",
  },

  // ----------------- PORTRAIT LAYOUT STYLES -----------------
  portraitTouchable: {
    width: 260,
    alignItems: "center",
    paddingVertical: 8,
  },
  portraitCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    padding: 16,
    width: 260,
    height: 275,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.16)",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 34,
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: "visible",
  },
  portraitAvatarContainer: {
    position: "absolute",
    top: -32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  portraitAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8FAFC",
  },
  portraitInfo: {
    alignItems: "center",
    width: "100%",
    marginTop: 32,
    marginBottom: 6,
  },
  portraitName: {
    fontFamily: "CairoBold",
    color: "#002E5A",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  portraitNationality: {
    fontFamily: "Cairo",
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 15,
  },

  portraitTagsRow: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginVertical: 4,
  },
  ratingRow: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    gap: 2,
  },
  portraitFooter: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 46, 90, 0.05)",
    paddingTop: 10,
    marginTop: 4,
  },
  portraitPriceCol: {
    flex: 1,
    justifyContent: "center",
  },
  priceLabel: {
    fontFamily: "Cairo",
    fontSize: 9,
    color: "#94A3B8",
  },
  priceRow: {
    alignItems: "baseline",
    marginTop: 1,
  },
  portraitPriceVal: {
    fontFamily: "CairoBold",
    fontSize: 16,
    color: "#002E5A",
    lineHeight: 20,
  },
  portraitCurrency: {
    fontFamily: "Cairo",
    fontSize: 10,
    color: "#2B9B72",
    marginLeft: 3,
    marginRight: 3,
  },
  portraitCtaCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2B9B72",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MaidCard;
