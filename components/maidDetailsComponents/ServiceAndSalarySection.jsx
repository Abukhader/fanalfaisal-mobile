import * as WebBrowser from "expo-web-browser";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { RTL } from "../../utils/rtlHelper";
import ActionButton from "./ActionButton";

const ServiceAndSalarySection = ({
  maid,
  handleShowCv,
  handleOrderNowPress,
}) => {
  const { t, i18n } = useTranslation();
  const orderScaleValue = useRef(new Animated.Value(1)).current;

  const serviceType =
    i18n.language === "ar"
      ? maid.companyService?.nameAr
      : maid.companyService?.nameEn || maid.companyService?.name;

  const safeNameEn = maid.companyService?.nameEn?.toLowerCase() || "";
  const safeNameAr =
    maid.companyService?.nameAr || maid.companyService?.name || "";

  const isHourlyRental =
    safeNameEn.includes("hourly") || safeNameAr.includes("ساعة");
  const pricesList = Array.isArray(maid.prices) ? maid.prices : [];

  const defaultPlan =
    pricesList.find((p) => p.isDefault) || pricesList[0] || {};
  const displayPrice = defaultPlan.price || maid.price || 0;

  const handleShowVideo = async () => {
    const videoUrl = maid.videoUrl;

    if (videoUrl && isValidUrl(videoUrl)) {
      try {
        await WebBrowser.openBrowserAsync(videoUrl, {
          toolbarColor: "#002E5A",
          enableBarCollapsing: true,
          showTitle: true,
        });
      } catch (err) {
        console.error("Failed to open WebBrowser:", err);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Toast.show({
        type: "error",
        position: "bottom",
        text1: t("common.alert"),
        text2: t("service_salary.video_error_msg"),
        visibilityTime: 3000,
      });
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleOrderPressIn = () => {
    Animated.spring(orderScaleValue, {
      toValue: 0.96, // انضغاط نابضي سلس وممتع عند الضغط
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    }).start();
  };

  const handleOrderPressOut = () => {
    Animated.spring(orderScaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 3,
    }).start();
  };

  const handleOrderPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (handleOrderNowPress) handleOrderNowPress();
  };

  return (
    <View style={styles.container}>
      {/* رأس القسم الفاخر مع وسم الخدمة المضيء */}
      <View style={[styles.headerBadge, { flexDirection: RTL.rowDir() }]}>
        <Icon
          name={isHourlyRental ? "clock-outline" : "calendar-star"}
          size={15}
          color="#002E5A"
          style={RTL.select({ marginRight: 6 }, { marginLeft: 6 })}
        />
        <Text style={styles.serviceTypeText}>{serviceType}</Text>
      </View>

      {/* عرض تفاصيل التسعير */}
      {isHourlyRental && pricesList.length > 0 ? (
        <View style={styles.packagesContainer}>
          <Text style={[styles.packagesTitle, { textAlign: RTL.textAlign() }]}>
            {t("service_salary.available_packages", "الباقات المتاحة:")}
          </Text>
          <View style={[styles.packagesGrid, { flexDirection: RTL.rowDir() }]}>
            {pricesList.map((plan, index) => (
              <View
                key={index}
                style={[
                  styles.packageBox,
                  plan.isDefault && styles.packageBoxDefault,
                ]}
              >
                {/* شارة الباقة الافتراضية */}
                {plan.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>
                      {t("service_salary.default_plan", "الافتراضية")}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.packageHoursText,
                    plan.isDefault && styles.packageTextDefault,
                  ]}
                >
                  {plan.hours} {t("common.hours", "ساعات")}
                </Text>

                <Text
                  style={[
                    styles.packagePriceText,
                    plan.isDefault && styles.packageTextDefault,
                  ]}
                >
                  {plan.price} {t("common.currency", "ر.س")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        /* كارت إبراز السعر الفخم للخدمات الأخرى (شهري/توسط) */
        <View style={styles.priceHighlightCard}>
          <Text style={styles.priceLabel}>
            {t("service_salary.fees", "رسوم التوسط والخدمة")}
          </Text>
          <View style={[styles.priceRow, { flexDirection: RTL.rowDir() }]}>
            <Text style={styles.priceNumber}>{displayPrice}</Text>
            <View style={styles.currencyWrapper}>
              <Text style={styles.currencyText}>{t("common.currency", "ر.س")}</Text>
              <Text style={styles.periodText}>
                {safeNameEn.includes("monthly") || safeNameAr.includes("شهري")
                  ? ` / ${t("common.month", "شهر")}`
                  : ` / ${t("common.contract", "عقد")}`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* أزرار الإجراءات عالية التباين (كحلي وزمردي) */}
      <View style={[styles.buttonsContainer, { flexDirection: RTL.rowDir() }]}>
        <ActionButton
          text={t("service_salary.show_cv")}
          icon="file-download"
          variant="navy" // كحلي عميق وفخم للسيرة الذاتية
          onPress={handleShowCv}
        />
        <ActionButton
          text={t("service_salary.show_video")}
          icon="play-circle-filled"
          variant="teal" // زمردي مضيء للفيديو
          onPress={handleShowVideo}
        />
      </View>

      {/* زر الطلب النهائي الفاخر والمحرك (شعار متدرج) */}
      <TouchableOpacity
        onPressIn={handleOrderPressIn}
        onPressOut={handleOrderPressOut}
        onPress={handleOrderPress}
        activeOpacity={0.9}
        style={styles.orderButtonTouchable}
      >
        <Animated.View style={[styles.orderButtonContainer, { transform: [{ scale: orderScaleValue }] }]}>
          <LinearGradient
            colors={["#002E5A", "#00479E", "#2B9B72"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orderButtonGradient}
          >
            <View style={{ flexDirection: RTL.rowDir(), alignItems: "center" }}>
              <Icon
                name="cart-outline"
                size={20}
                color="#FFFFFF"
                style={RTL.select(
                  { marginLeft: 0, marginRight: 8 },
                  { marginLeft: 8, marginRight: 0 }
                )}
              />
              <Text style={styles.orderButtonText}>
                {t("service_salary.order_now")}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // حاوية زجاجية ناعمة
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.16)", // إطار زمردي دقيق للغاية
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  headerBadge: {
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
  },
  serviceTypeText: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  priceHighlightCard: {
    width: "100%",
    backgroundColor: "rgba(43, 155, 114, 0.04)", // خلفية مائلة للزمردي خفيفة جداً
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "CairoBold",
    color: "#64748B",
    marginBottom: 4,
  },
  priceRow: {
    alignItems: "baseline",
  },
  priceNumber: {
    fontSize: 32,
    fontFamily: "CairoBold",
    color: "#2B9B72", // الرقم باللون الزمردي المضيء
    lineHeight: 38,
  },
  currencyWrapper: {
    marginStart: 6,
    alignItems: "flex-start",
  },
  currencyText: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  periodText: {
    fontSize: 9.5,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: -2,
  },
  packagesContainer: {
    width: "100%",
    marginVertical: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 46, 90, 0.06)",
  },
  packagesTitle: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#64748B",
    marginBottom: 12,
  },
  packagesGrid: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: "3%",
  },
  packageBox: {
    backgroundColor: "rgba(255, 255, 255, 0.65)", // كبسولات زجاجية للباقات
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    width: "31%",
    marginBottom: 12,
    position: "relative",
  },
  packageBoxDefault: {
    backgroundColor: "rgba(43, 155, 114, 0.08)", // خلفية زمردية خفيفة للباقة الافتراضية
    borderColor: "#2B9B72", // إطار زمردي مضيء للباقة الافتراضية
    borderWidth: 1.5,
  },
  packageHoursText: {
    fontFamily: "CairoBold",
    fontSize: 12,
    color: "#002E5A",
    marginBottom: 2,
  },
  packagePriceText: {
    fontFamily: "CairoBold",
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  packageTextDefault: {
    color: "#2B9B72", // زمردي ناصع للباقة الافتراضية
  },
  hourlyRateText: {
    fontSize: 8.5,
    fontFamily: "Cairo",
    color: "#64748B",
  },
  defaultBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#2B9B72", // شارة زمردية ناصعة
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  defaultBadgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontFamily: "CairoBold",
  },
  buttonsContainer: {
    width: "100%",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  orderButtonTouchable: {
    width: "100%",
    marginTop: 10,
  },
  orderButtonContainer: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  orderButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "CairoBold",
    textAlign: "center",
  },
});

export default ServiceAndSalarySection;
