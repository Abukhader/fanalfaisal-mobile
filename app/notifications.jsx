import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import moment from "moment";
import "moment/locale/ar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppBar from "../components/AppBar";
import useNotifications from "../hooks/useNotifications";
import { RTL } from "../utils/rtlHelper";
import { markNotificationAsRead } from "./Api/Notification";

const NotificationsScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  moment.locale(i18n.language);

  const [userId, setUserId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserId(userData?.id);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUserId();
  }, []);

  const { notifications, loading, error } = useNotifications(
    i18n.language,
    userId,
    refreshTrigger
  );

  // تحديث الحالة المحلية فور تحميل الإشعارات من الخطاف مع إزالة التكرار
  useEffect(() => {
    if (notifications) {
      const uniqueNotifications = [];
      const seenIds = new Set();
      for (const notif of notifications) {
        if (notif && notif.id) {
          if (!seenIds.has(notif.id)) {
            seenIds.add(notif.id);
            uniqueNotifications.push(notif);
          }
        } else if (notif) {
          uniqueNotifications.push(notif);
        }
      }
      setLocalNotifications(uniqueNotifications);
    }
  }, [notifications]);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // ✨ التحديث الذكي: وضع علامة مقروء وتحديث الحالة المحلية لمنع التكرار اللانهائي
  useEffect(() => {
    if (!loading && !error && localNotifications?.length > 0 && userId) {
      const unreadIds = localNotifications.filter((n) => !n.isRead).map((n) => n.id);

      if (unreadIds.length > 0) {
        Promise.all(
          unreadIds.map((id) =>
            markNotificationAsRead(i18n.language, id, userId)
          )
        )
          .then(() => {
            // تحديث الحالة المحلية فوراً لإخفاء مؤشرات القراءة ومنع تكرار الطلبات اللانهائي
            setLocalNotifications((prev) =>
              prev.map((n) => (unreadIds.includes(n.id) ? { ...n, isRead: true } : n))
            );
          })
          .catch((err) => console.log("Mark as read error", err));
      }
    }
  }, [localNotifications, loading, error, userId]);

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).fromNow();
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
            onPress={() => router.back()}
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
              {t("notifications.title")}
            </Text>
            <Text
              style={[styles.subHeaderText, { textAlign: RTL.textAlign() }]}
            >
              {localNotifications?.length || 0}{" "}
              {t("notifications.count_label", "تنبيه متوفر")}
            </Text>
          </View>
        </View>

        {loading && !isRefreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={styles.loadingText}>{t("common.loading", "جاري التحميل...")}</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <View style={styles.errorCircle}>
              <Icon name="error-outline" size={40} color="#EF4444" />
            </View>
            <Text style={styles.errorMessage}>{t("notifications.error")}</Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.retryButtonTouchable}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#002E5A", "#00479E"]}
                style={styles.retryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.retryText}>
                  {t("common.retry", "إعادة المحاولة")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={["#2B9B72"]}
              />
            }
          >
            {!localNotifications || localNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyImageContainer}>
                  <MaterialCommunityIcons
                    name="bell-off-outline"
                    size={64}
                    color="rgba(43, 155, 114, 0.25)"
                  />
                </View>
                <Text style={styles.emptyTitle}>{t("notifications.empty", "لا توجد تنبيهات حالياً")}</Text>
                <Text style={styles.emptySubtitle}>
                  {t(
                    "notifications.empty_sub",
                    "سنقوم بإرسال تنبيهات لك عندما تكون هناك تحديثات جديدة بخصوص طلباتك أو عروضنا."
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
                      {t("notifications.browse_workers", "تصفح العاملات")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              localNotifications.map((item) => {
                const isUnread = !item.isRead;
                const isAlert = item.type === 4;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.notificationCard,
                      { flexDirection: RTL.rowDir() },
                      isUnread && styles.unreadCard,
                    ]}
                  >
                    {/* Glowing indicator bar for unread notifications */}
                    {isUnread && (
                      <View
                        style={[
                          styles.unreadBar,
                          RTL.select({ left: 0 }, { right: 0 }),
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.notificationIconContainer,
                        isAlert && styles.alertIconBg,
                      ]}
                    >
                      <Icon
                        name={isAlert ? "event-busy" : "notifications-none"}
                        size={22}
                        color={isAlert ? "#DC2626" : "#2B9B72"}
                      />
                    </View>

                    <View
                      style={[
                        styles.notificationContent,
                        { alignItems: RTL.flexAlign() },
                      ]}
                    >
                      <Text
                        style={[
                          styles.notificationTitle,
                          { textAlign: RTL.textAlign() },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.notificationText,
                          { textAlign: RTL.textAlign() },
                        ]}
                      >
                        {item.message}
                      </Text>
                      <View
                        style={[styles.dateRow, { flexDirection: RTL.rowDir() }]}
                      >
                        <Icon name="access-time" size={12} color="#9CA3AF" />
                        <Text style={styles.notificationDate}>
                          {formatRelativeDate(item.createdDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontFamily: "Cairo", color: "#002E5A" },
  errorMessage: { color: "#EF4444", fontFamily: "CairoBold", fontSize: 15, marginBottom: 16, textAlign: "center" },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  retryButtonTouchable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  retryButtonGradient: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: { color: "#FFFFFF", fontFamily: "CairoBold", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContentContainer: { paddingBottom: 30 },
  notificationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    alignItems: "center",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  unreadCard: {
    borderColor: "rgba(0, 71, 158, 0.16)", // Glowing sapphire border
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  unreadBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#00479E", // Royal Sapphire bar
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertIconBg: { backgroundColor: "rgba(220, 38, 38, 0.08)" },
  notificationContent: { flex: 1, ...RTL.marginSide(14) },
  notificationTitle: {
    fontSize: 14,
    color: "#002E5A",
    fontFamily: "CairoBold",
  },
  notificationText: {
    fontSize: 13,
    color: "#64748B",
    marginVertical: 4,
    fontFamily: "Cairo",
    lineHeight: 20,
  },
  dateRow: { alignItems: "center", gap: 4 },
  notificationDate: { fontSize: 11, color: "#9CA3AF", fontFamily: "Cairo", marginTop: 2 },
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

export default NotificationsScreen;
