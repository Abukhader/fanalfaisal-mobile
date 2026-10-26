import {
  FontAwesome5,
  MaterialIcons as Icon,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "expo-router/react-navigation"; // ✨ استيراد useFocusEffect
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppBar from "../../components/AppBar";
import useOffers from "../../hooks/useOffers";
import { RTL } from "../../utils/rtlHelper";

const Offers = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // مكتب استقدام محدد
  const officeId = "0c443f1f-eeeb-456a-bd82-c857510d9c4d";

  const { offers, loading, error } = useOffers(
    i18n.language,
    officeId,
    refreshTrigger
  );

  const activeOffers = Array.isArray(offers) ? offers.filter((item) => item.active) : [];

  // ✨ التعديل: جلب البيانات صامتاً كلما فتح المستخدم هذه الصفحة
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  useEffect(() => {
    if (!loading && !error && offers) {
      console.log("=== Offers Data JSON ===");
      console.log(JSON.stringify(offers, null, 2));
    }
  }, [offers, loading, error]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // دالة لتنسيق التاريخ بشكل مقروء
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // دالة للتحقق هل العرض منتهي أم لا
  const isOfferExpired = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    return end < today;
  };

  const renderOffer = ({ item }) => {
    const expired = isOfferExpired(item.endDate);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.offerCard, expired && styles.expiredCard]}
        disabled={expired}
      >
        {/* رأس البطاقة */}
        <View style={[styles.cardHeader, { flexDirection: RTL.rowDir() }]}>
          <View
            style={[
              styles.headerTextContainer,
              { alignItems: RTL.flexAlign() },
            ]}
          >
            <Text
              style={[styles.offerTitle, { textAlign: RTL.textAlign() }]}
              numberOfLines={1}
            >
              {item.offerTitle || t("offers.special_offer")}
            </Text>
          </View>

          {item.discountPercentage > 0 && (
            <View
              style={[styles.discountBadge, expired && styles.expiredBadge]}
            >
              <Text
                style={[styles.discountText, expired && styles.expiredText]}
              >
                {item.discountPercentage}%
              </Text>
              <Text style={[styles.offText, expired && styles.expiredText]}>
                {t("offers.discount")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          {/* الخدمة */}
          <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="miscellaneous-services"
                size={18}
                color={expired ? "#9CA3AF" : "#2B9B72"}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}>
                {t("offers.service")}
              </Text>
              <Text style={[styles.infoValue, { textAlign: RTL.textAlign() }]}>
                {i18n.language === "ar"
                  ? item.companyService?.nameAr
                  : item.companyService?.nameEn}
              </Text>
            </View>
          </View>

          {/* الجنسية */}
          {item.nationality && (
            <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.iconContainer}>
                <FontAwesome5
                  name="flag"
                  size={16}
                  color={expired ? "#9CA3AF" : "#2B9B72"}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}>
                  {t("offers.nationality")}
                </Text>
                <Text style={[styles.infoValue, { textAlign: RTL.textAlign() }]}>
                  {i18n.language === "ar"
                    ? item.nationality.nameAr
                    : item.nationality.nameEn}
                </Text>
              </View>
            </View>
          )}

          {item.description ? (
            <Text
              style={[styles.descriptionText, { textAlign: RTL.textAlign() }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* الفوتر */}
        <View style={[styles.cardFooter, { flexDirection: RTL.rowDir() }]}>
          <View style={[styles.dateRow, { flexDirection: RTL.rowDir() }]}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={[styles.dateText, RTL.marginSide(6)]}>
              {t("offers.from")} {formatDate(item.startDate)} {t("offers.to")}{" "}
              {formatDate(item.endDate)}
            </Text>
          </View>

          <View
            style={[styles.statusDotContainer, { flexDirection: RTL.rowDir() }]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: expired ? "#9CA3AF" : "#2B9B72" },
                RTL.marginSide(5),
              ]}
            />
            <Text
              style={[
                styles.activeText,
                { color: expired ? "#9CA3AF" : "#2B9B72" },
              ]}
            >
              {expired ? t("offers.expired", "منتهي") : t("offers.available")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppBar />

      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.headerRow, { flexDirection: RTL.rowDir() }]}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Icon
              name={RTL.select("arrow-forward", "arrow-back")}
              size={24}
              color="#002E5A"
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerText, { textAlign: RTL.textAlign() }]}>
              {t("offers.title")}
            </Text>
            <Text
              style={[styles.subHeaderText, { textAlign: RTL.textAlign() }]}
            >
              {t("offers.subtitle", "استكشف أحدث العروض والخصومات المتاحة")}
            </Text>
          </View>
        </View>

        {loading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={styles.loadingText}>{t("offers.loading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <View style={styles.errorCircle}>
              <MaterialIcons name="error-outline" size={40} color="#EF4444" />
            </View>
            <Text style={styles.errorText}>{t("offers.error")}</Text>
          </View>
        ) : (
          <FlatList
            data={activeOffers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOffer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={["#2B9B72"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyImageContainer}>
                  <MaterialCommunityIcons
                    name="tag-off-outline"
                    size={64}
                    color="rgba(43, 155, 114, 0.25)"
                  />
                </View>
                <Text style={styles.emptyTitle}>{t("offers.empty", "لا توجد عروض حالياً")}</Text>
                <Text style={styles.emptySubtitle}>
                  {t(
                    "offers.empty_sub",
                    "ليس هناك أي عروض نشطة في الوقت الحالي. يرجى مراجعة الصفحة لاحقاً."
                  )}
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push("/")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#002E5A", "#00479E"]}
                    style={styles.browseButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.browseButtonText}>
                      {t("offers.browse_workers", "تصفح العاملات")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { alignItems: "center", marginBottom: 20, gap: 12, width: "100%" },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 46, 90, 0.05)",
    elevation: 0,
    shadowColor: "#002E5A",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: { fontSize: 22, fontFamily: "CairoBold", color: "#002E5A" },
  subHeaderText: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: -2,
  },
  listContent: { paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  offerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  expiredCard: { opacity: 0.7, backgroundColor: "rgba(249, 250, 251, 0.75)" },
  cardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 46, 90, 0.05)",
  },
  headerTextContainer: { flex: 1 },
  offerTitle: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#002E5A",
    width: "100%",
  },
  discountBadge: {
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.18)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  expiredBadge: { backgroundColor: "rgba(100, 116, 139, 0.08)", borderColor: "rgba(100, 116, 139, 0.18)" },
  discountText: { color: "#DC2626", fontSize: 15, fontFamily: "CairoBold" },
  offText: {
    color: "#DC2626",
    fontSize: 10,
    fontFamily: "Cairo",
    marginTop: -2,
  },
  expiredText: { color: "#64748B" },
  divider: { height: 1, backgroundColor: "rgba(0, 46, 90, 0.05)", marginHorizontal: 16 },
  cardBody: { padding: 16, gap: 12 },
  infoRow: { alignItems: "center", width: "100%", gap: 12 },
  iconContainer: {
    width: 38,
    height: 38,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: { fontSize: 11, fontFamily: "Cairo", color: "#64748B", marginBottom: 1 },
  infoValue: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: 12,
    lineHeight: 20,
    width: "100%",
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.04)",
  },
  cardFooter: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 46, 90, 0.05)",
  },
  dateRow: { alignItems: "center", flex: 1, gap: 6 },
  dateText: { fontSize: 11, fontFamily: "CairoBold", color: "#64748B", marginTop: 2 },
  statusDotContainer: { alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  activeText: { fontSize: 12, fontFamily: "CairoBold", marginTop: 2 },
  loadingText: { marginTop: 12, fontFamily: "Cairo", color: "#002E5A" },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: { marginTop: 10, fontFamily: "CairoBold", color: "#EF4444", fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  emptyImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 19,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  browseButton: {
    width: "100%",
    maxWidth: 250,
  },
  browseButtonGradient: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  browseButtonText: {
    color: "#fff",
    fontFamily: "CairoBold",
    fontSize: 15,
  },
});

export default Offers;
