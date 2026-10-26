import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AppBar from "../../components/AppBar";
import CustomTabs from "../../components/CustomTabs";
import EmptyState from "../../components/EmptyState";
import { RTL } from "../../utils/rtlHelper";
import { getAllOrderActions } from "../Api/OrderAction";
import { getOrderById } from "../Api/OrderService";

const OrderDetails = () => {
  const { orderId } = useLocalSearchParams();
  const [orderActions, setOrderActions] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log("==================== [تفاصيل الطلب / ORDER DETAILS] ====================");
        console.log("🆔 Order ID:", orderId);

        // جلب تفاصيل الطلب الأساسية وطباعتها
        try {
          const orderRes = await getOrderById(i18n.language, orderId);
          setOrderDetails(orderRes?.data || orderRes);
          console.log("📦 Order Details (JSON):", JSON.stringify(orderRes, null, 2));
        } catch (err) {
          console.warn("⚠️ لم يتم جلب تفاصيل الطلب الأساسية:", err.message);
        }

        // جلب إجراءات وتتبع الطلب وطباعتها
        const data = await getAllOrderActions(i18n.language, orderId);
        console.log("📋 Order Actions (JSON):", JSON.stringify(data, null, 2));
        console.log("========================================================================");

        const sortedActions = (data.data || []).sort(
          (a, b) => new Date(a.actionDate) - new Date(b.actionDate)
        );
        setOrderActions(sortedActions);
      } catch (error) {
        console.log("فشل تحميل تفاصيل الطلب", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, i18n.language]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2B9B72" />
        <Text style={styles.loadingText}>
          {t("order_details.loading", "جاري تحميل تفاصيل الطلب...")}
        </Text>
      </View>
    );
  }

  const now = new Date();
  const upcomingAction = orderActions.find(
    (action) => new Date(action.actionDate) > now
  );
  const latestActionId = upcomingAction ? upcomingAction.id : null;

  return (
    <View style={styles.container}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppBar />

      {/* الهيدر المتوافق مع اللغتين */}
      <View style={[styles.headerContainer, { flexDirection: RTL.rowDir() }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/orders")}
          activeOpacity={0.8}
        >
          <Icon
            name={RTL.select("arrow-forward", "arrow-back")}
            size={24}
            color="#002E5A"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: RTL.textAlign() }]}>
          {t("order_details.title", "تتبع الطلب")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {orderActions.length === 0 ? (
          <EmptyState
            message={t(
              "order_details.empty",
              "لا توجد إجراءات متاحة لهذا الطلب حالياً."
            )}
          />
        ) : (
          orderActions.map((action, index) => {
            const isLast = index === orderActions.length - 1;
            const isActive = action.id === latestActionId;

            // تحديد اسم الإجراء بناءً على اللغة
            const actionName =
              i18n.language === "ar"
                ? action.actionType?.nameAr ||
                  action.actionType?.name ||
                  "إجراء غير معروف"
                : action.actionType?.nameEn ||
                  action.actionType?.name ||
                  "Unknown Action";

            // تنسيق التاريخ بناءً على اللغة
            const formattedDate = action.actionDate
              ? new Intl.DateTimeFormat(
                  i18n.language === "ar" ? "ar-EG" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                ).format(new Date(action.actionDate))
              : t("common.unknown", "غير معروف");

            return (
              <View
                key={action.id}
                style={[
                  styles.timelineItemContainer,
                  { flexDirection: RTL.rowDir() },
                ]}
              >
                {/* الخط والرأس الدائري للتايم لاين */}
                <View style={styles.timelineSide}>
                  <View
                    style={[styles.timelineDot, isActive && styles.activeDot]}
                  />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* كرت الإجراء */}
                <View
                  style={[
                    styles.actionCard,
                    RTL.select({ marginLeft: 15 }, { marginRight: 15 }),
                    isActive && styles.activeActionCard,
                    isActive &&
                      RTL.select(
                        { borderLeftWidth: 4, borderLeftColor: "#2B9B72" },
                        { borderRightWidth: 4, borderRightColor: "#2B9B72" }
                      ),
                  ]}
                >
                  <View
                    style={[styles.titleRow, { flexDirection: RTL.rowDir() }]}
                  >
                    <Icon
                      name={
                        isActive
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={20}
                      color={isActive ? "#2B9B72" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.actionTitle,
                        { textAlign: RTL.textAlign() },
                        isActive && styles.activeActionTitle,
                      ]}
                    >
                      {actionName}
                    </Text>
                  </View>

                  <View
                    style={[styles.detailRow, { flexDirection: RTL.rowDir() }]}
                  >
                    <Icon name="event" size={16} color="#6B7280" />
                    <Text
                      style={[
                        styles.detailText,
                        { textAlign: RTL.textAlign() },
                      ]}
                    >
                      {formattedDate}
                    </Text>
                  </View>

                  {action.description ? (
                    <View
                      style={[
                        styles.detailRow,
                        {
                          flexDirection: RTL.rowDir(),
                          alignItems: "flex-start",
                        },
                      ]}
                    >
                      <Icon
                        name="notes"
                        size={16}
                        color="#6B7280"
                        style={{ marginTop: 3 }}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { textAlign: RTL.textAlign(), flex: 1 },
                        ]}
                      >
                        {action.description}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}

        {/* Action Button: Handover Receipt */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/HandoverScreen", params: { orderId } })}
          style={{
            marginVertical: 20,
            backgroundColor: "#002E5A",
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 20,
            flexDirection: RTL.rowDir(),
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            shadowColor: "#002E5A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.88}
        >
          <Icon name="assignment-turned-in" size={22} color="#FFFFFF" />
          <Text style={{ fontFamily: "CairoBold", fontSize: 14, color: "#FFFFFF" }}>
            {t("handover.header_title", "إقرار استلام عاملة")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontFamily: "Cairo",
    marginTop: 12,
    color: "#002E5A",
    fontSize: 16,
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    width: "100%",
  },
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
  headerTitle: {
    fontSize: 22,
    color: "#002E5A", // كحلي ملكي
    fontFamily: "CairoBold",
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  timelineItemContainer: {
    alignItems: "flex-start",
  },
  timelineSide: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 46, 90, 0.08)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  activeDot: {
    backgroundColor: "#2B9B72", // زمردي العلامة التجارية
    transform: [{ scale: 1.2 }],
    borderColor: "rgba(43, 155, 114, 0.16)",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(0, 46, 90, 0.08)", // خط هادئ جداً
    marginVertical: -2,
    minHeight: 90,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)", // كروت زجاجية ناصعة
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 0, // إلغاء الظلال السوداء المزعجة
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
  },
  activeActionCard: {
    backgroundColor: "rgba(43, 155, 114, 0.05)", // كارت إجراء نشط بخلفية زمردية ناعمة
    borderColor: "#2B9B72",
    borderWidth: 1.2,
  },
  titleRow: {
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#64748B", // رمادي ناعم للإجراءات العامة
    flex: 1,
  },
  activeActionTitle: {
    color: "#2B9B72", // تمييز الإجراء النشط بالزمردي المشرق
  },
  detailRow: {
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },
});

export default OrderDetails;

