import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router/react-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";

import AppBar from "../../components/AppBar";
import WorkerUnavailableModal from "../../components/orderComponents/WorkerUnavailableModal";
import NetworkErrorView from "../../components/ui/NetworkErrorView";
import { RTL } from "../../utils/rtlHelper";
import { getAllOrders } from "../Api/OrderService";
import { getWorkerById } from "../Api/WorkerService";

const OrdersScreen = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [unavailableModalInfo, setUnavailableModalInfo] = useState({
    visible: false,
    workerName: "",
  });
  const router = useRouter();

  // ✨ دالة ستايلات الحالة بألوان عصرية وهالات مطابقة للعلامة التجارية
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          text: t("orders.status.pending"),
          backgroundColor: "rgba(245, 158, 11, 0.08)", // برتقالي ناعم
          borderColor: "rgba(245, 158, 11, 0.18)",
          color: "#D97706",
          icon: "schedule",
        };
      case "Approved":
        return {
          text: t("orders.status.approved"),
          backgroundColor: "rgba(43, 155, 114, 0.08)", // زمردي العلامة التجارية
          borderColor: "rgba(43, 155, 114, 0.18)",
          color: "#2B9B72",
          icon: "check-circle-outline",
        };
      case "Rejected":
        return {
          text: t("orders.status.rejected"),
          backgroundColor: "rgba(239, 68, 68, 0.08)", // أحمر هادئ
          borderColor: "rgba(239, 68, 68, 0.18)",
          color: "#DC2626",
          icon: "highlight-off",
        };
      case "Canceled":
      case "Cancelled":
        return {
          text: t("orders.status.canceled"),
          backgroundColor: "rgba(100, 116, 139, 0.08)", // رمادي ناعم
          borderColor: "rgba(100, 116, 139, 0.18)",
          color: "#64748B",
          icon: "cancel",
        };
      case "Completed":
        return {
          text: t("orders.status.completed"),
          backgroundColor: "rgba(0, 71, 158, 0.08)", // كحلي ملكي
          borderColor: "rgba(0, 71, 158, 0.18)",
          color: "#00479E",
          icon: "task-alt",
        };
      default:
        return {
          text: status,
          backgroundColor: "rgba(0, 46, 90, 0.04)",
          borderColor: "rgba(0, 46, 90, 0.08)",
          color: "#002E5A",
          icon: "info-outline",
        };
    }
  };

  const fetchOrders = useCallback(
    async (currentClientId) => {
      if (!currentClientId) return;
      setError(null);

      // Load cached orders first to eliminate blank loading states
      try {
        const cached = await AsyncStorage.getItem(`cached_orders_${currentClientId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            setLoading(false);
          }
        }
      } catch (cacheErr) {
        console.warn("Orders cache read error:", cacheErr.message);
      }

      try {
        const response = await getAllOrders(
          i18n.language,
          null,
          currentClientId
        );
        const list = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.data?.data)
              ? response.data.data
              : (response.data?.data?.results || response.data?.results || []));

        setOrders(list);
        if (list.length > 0) {
          AsyncStorage.setItem(`cached_orders_${currentClientId}`, JSON.stringify(list)).catch(() => {});
        }
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        setError(t("orders.error") || "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.");
      } finally {
        setLoading(false);
      }
    },
    [i18n.language, t]
  );

  useFocusEffect(
    useCallback(() => {
      if (clientId) {
        fetchOrders(clientId);
      }
    }, [clientId, fetchOrders])
  );

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        const userTokenString = await AsyncStorage.getItem("userToken");
        if (userDataString && userTokenString) {
          const parsedData = JSON.parse(userDataString);
          const id = parsedData?.clientId || parsedData?.id;
          setClientId(id);
        } else {
          if (userDataString || userTokenString) {
            await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
          }
          router.replace("/LoginPromptPage");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchClientId();
  }, []);

  const goToOrderDetails = (id) => {
    router.push(`/OrderDetails/${id}`);
  };

  const goToPayment = async (orderItem) => {
    if (!orderItem) return;

    // 1. إذا كان الطلب تجديد عقد، يتم تخطي فحص التوفر لأن العاملة لدى العميل بالفعل
    if (orderItem.isRenewed || orderItem.contractId) {
      router.push({
        pathname: "/PaymentScreen",
        params: { orderId: orderItem.id },
      });
      return;
    }

    const workerId = orderItem.worker?.id || orderItem.workerId;
    if (!workerId) {
      router.push({
        pathname: "/PaymentScreen",
        params: { orderId: orderItem.id },
      });
      return;
    }

    setCheckingOrderId(orderItem.id);

    try {
      // 2. فحص حالة التوفر اللحظي للعاملة من السيرفر مباشرة
      const workerRes = await getWorkerById(i18n.language, workerId);
      const workerData = workerRes?.data;

      // availabilityStatus === 1 تعني أن العاملة متاحة
      const isAvailable =
        workerData &&
        (workerData.availabilityStatus === 1 ||
          workerData.availabilityStatus === "1" ||
          workerData.available === true ||
          workerData.available === 1);

      if (workerData && !isAvailable) {
        const workerName =
          (i18n.language === "ar" ? workerData.nameAr : workerData.nameEn) ||
          workerData.name ||
          orderItem.worker?.name ||
          "";

        setUnavailableModalInfo({
          visible: true,
          workerName,
        });

        // تحديث القائمة تلقائياً لمزامنة أحدث البيانات
        if (clientId) {
          fetchOrders(clientId);
        }
        return;
      }

      // 3. إذا كانت العاملة متاحة، الانتقال لشاشة الدفع بأمان
      router.push({
        pathname: "/PaymentScreen",
        params: { orderId: orderItem.id },
      });
    } catch (err) {
      console.warn("Worker availability verification skipped on network issue:", err);
      router.push({
        pathname: "/PaymentScreen",
        params: { orderId: orderItem.id },
      });
    } finally {
      setCheckingOrderId(null);
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const safeOrderKind = (item.kind || "").toLowerCase();

    // ✨ التحديث: البحث عن المسميات الجديدة للتوسط/التعاقد
    const isContractOrder =
      safeOrderKind.includes("توسط") ||
      safeOrderKind.includes("تعاقد") ||
      safeOrderKind.includes("mediation") ||
      safeOrderKind.includes("contract") ||
      safeOrderKind.includes("recruitment");

    const isHourlyRental =
      safeOrderKind.includes("ساعة") || safeOrderKind.includes("hourly");
    const hasDates = item.startDate && item.endDate;
    const isPaid = item.paid;

    const invoiceTotal = item.invoice
      ? Number(
          item.invoice.total ||
          item.invoice.totalAmount ||
          item.invoice.netTotal ||
          (Number(item.invoice.subTotal || 0) +
            Number(item.invoice.tax || item.invoice.vat || 0) +
            Number(item.invoice.delivery || 0) -
            Number(item.invoice.discount || 0))
        )
      : 0;

    const orderPrice =
      invoiceTotal ||
      item.recruitmentFee?.price ||
      item.worker?.price ||
      0;

    const formatDateTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(
        dateString.endsWith("Z") ? dateString : `${dateString}Z`
      );
      const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

      if (isHourlyRental) {
        return date.toLocaleString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString(locale);
    };

    return (
      <TouchableOpacity
        onPress={() => goToOrderDetails(item.id)}
        activeOpacity={0.9}
        style={styles.cardWrapper}
      >
        <View style={styles.orderCard}>
          {/* Header: Order Number & Status */}
          <View style={[styles.cardHeader, { flexDirection: RTL.rowDir() }]}>
            <View
              style={[styles.orderNumberBadge, { flexDirection: RTL.rowDir() }]}
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={14}
                color="#002E5A"
              />
              <Text style={styles.orderNumberText}>
                {t("orders.order_num", "طلب")} #{item.num}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusStyle.backgroundColor,
                  borderColor: statusStyle.borderColor,
                  flexDirection: RTL.rowDir(),
                },
              ]}
            >
              <Icon
                name={statusStyle.icon}
                size={14}
                color={statusStyle.color}
              />
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.text}
              </Text>
            </View>
          </View>

          {/* Body: Order Details */}
          <View style={styles.cardBody}>
            <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.iconContainer}>
                <Icon name="person-outline" size={18} color="#2B9B72" />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}
                >
                  {t("orders.worker_name", "اسم العاملة")}
                </Text>
                <Text
                  style={[styles.infoValue, { textAlign: RTL.textAlign() }]}
                >
                  {item.worker?.name || "---"}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.iconContainer}>
                <Icon name="work-outline" size={18} color="#2B9B72" />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}
                >
                  {t("orders.order_type", "نوع الخدمة")}
                </Text>
                <Text
                  style={[styles.infoValue, { textAlign: RTL.textAlign() }]}
                >
                  {isContractOrder
                    ? t("orders.contract", "خدمات التوسط")
                    : item.worker?.companyService?.name || item.kind}
                </Text>
              </View>
            </View>

            {!isContractOrder && hasDates && (
              <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
                <View style={styles.iconContainer}>
                  <Icon name="date-range" size={18} color="#2B9B72" />
                </View>
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}
                  >
                    {isHourlyRental
                      ? t("orders.date_and_time", "التاريخ والوقت")
                      : t("orders.duration", "المدة")}
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { textAlign: RTL.textAlign(), color: "#002E5A" },
                    ]}
                  >
                    {formatDateTime(item.startDate)} -{" "}
                    {formatDateTime(item.endDate)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer: Price & Action */}
          <View style={[styles.cardFooter, { flexDirection: RTL.rowDir() }]}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { textAlign: RTL.textAlign() }]}>
                {t("orders.fees", "إجمالي الرسوم")}
              </Text>
              <Text style={[styles.priceValue, { textAlign: RTL.textAlign() }]}>
                {orderPrice} {t("common.currency", "ر.س")}
              </Text>
            </View>
            <View style={styles.actionContainer}>
              {item.status === "Canceled" ||
              item.status === "Cancelled" ||
              item.status === "Rejected" ? (
                <View
                  style={[
                    styles.statusHint,
                    { flexDirection: RTL.rowDir(), borderColor: "rgba(239, 68, 68, 0.15)" },
                  ]}
                >
                  <Icon name="cancel" size={16} color="#DC2626" />
                  <Text style={[styles.contactSoonText, { color: "#DC2626" }]}>
                    {item.status === "Rejected"
                      ? t("orders.status.rejected")
                      : t("orders.status.canceled")}
                  </Text>
                </View>
              ) : isContractOrder ? (
                <View
                  style={[styles.statusHint, { flexDirection: RTL.rowDir() }]}
                >
                  <Icon name="support-agent" size={16} color="#002E5A" />
                  <Text style={styles.contactSoonText}>
                    {t("orders.contact_soon", "سنتواصل معك")}
                  </Text>
                </View>
              ) : !isPaid ? (
                <TouchableOpacity
                  onPress={() => goToPayment(item)}
                  activeOpacity={0.8}
                  disabled={checkingOrderId === item.id}
                >
                  <LinearGradient
                    colors={["#2B9B72", "#22805E"]}
                    style={[styles.payButton, { flexDirection: RTL.rowDir() }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {checkingOrderId === item.id ? (
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                        style={{ marginHorizontal: 16 }}
                      />
                    ) : (
                      <>
                        <Text style={styles.payButtonText}>
                          {t("orders.complete_payment", "ادفع الآن")}
                        </Text>
                        <Icon
                          name={RTL.select("arrow-forward", "arrow-back")}
                          size={18}
                          color="#fff"
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View
                  style={[styles.statusHint, { flexDirection: RTL.rowDir(), borderColor: "rgba(43, 155, 114, 0.15)" }]}
                >
                  <Icon name="verified" size={16} color="#2B9B72" />
                  <Text style={styles.paidSuccessText}>
                    {t("orders.paid_successfully", "تم الدفع")}
                  </Text>
                </View>
              )}
            </View>
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
              {t("orders.title")}
            </Text>
            <Text
              style={[styles.subHeaderText, { textAlign: RTL.textAlign() }]}
            >
              {t("orders.subtitle", "تتبع وإدارة طلباتك الحالية")}
            </Text>
          </View>
        </View>

        {/* States */}
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={styles.loadingText}>{t("orders.loading")}</Text>
          </View>
        )}

        {error && orders.length === 0 && !loading && (
          <NetworkErrorView
            message={error}
            onRetry={() => fetchOrders(clientId)}
          />
        )}

        {error && orders.length > 0 && (
          <NetworkErrorView
            compact
            onRetry={() => fetchOrders(clientId)}
          />
        )}

        {!loading && !error && orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyImageContainer}>
              <MaterialCommunityIcons
                name="clipboard-text-off-outline"
                size={64}
                color="rgba(43, 155, 114, 0.25)"
              />
            </View>
            <Text style={styles.emptyTitle}>{t("orders.empty")}</Text>
            <Text style={styles.emptySubtitle}>
              {t(
                "orders.empty_sub",
                "لا توجد طلبات سابقة. ابدأ بطلب خدمة الآن."
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
                  {t("orders.order_now")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {!loading && !error && orders.length > 0 && (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Custom High-End Worker Unavailable Popup */}
      <WorkerUnavailableModal
        visible={unavailableModalInfo.visible}
        workerName={unavailableModalInfo.workerName}
        onClose={() =>
          setUnavailableModalInfo({ visible: false, workerName: "" })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flex: 1,
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 20,
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
  headerText: {
    fontSize: 22,
    fontFamily: "CairoBold",
    color: "#002E5A", // كحلي ملكي
  },
  subHeaderText: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#64748B", // رمادي ناعم
    marginTop: -2,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)", // زجاجي ناصع ناعم
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)", // إطار زمردي خفيف
    elevation: 0, // إلغاء الظلال الخشنة
    shadowColor: "#2B9B72", // هالة ناعمة زمردية
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 46, 90, 0.05)",
  },
  orderNumberBadge: {
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderNumberText: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontFamily: "CairoBold",
    fontSize: 11,
    marginTop: 2,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Cairo",
    color: "#64748B",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  cardFooter: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 46, 90, 0.05)",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Cairo",
    color: "#64748B",
  },
  priceValue: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#2B9B72", // تمييز الأسعار بلون زمردي ناصع
    marginTop: 2,
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  payButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  payButtonText: {
    color: "#fff",
    fontFamily: "CairoBold",
    fontSize: 13,
  },
  statusHint: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.06)",
  },
  contactSoonText: {
    fontFamily: "CairoBold",
    fontSize: 12,
    color: "#002E5A",
    marginTop: 2,
  },
  paidSuccessText: {
    fontFamily: "CairoBold",
    fontSize: 12,
    color: "#2B9B72",
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Cairo",
    marginTop: 12,
    color: "#002E5A",
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontFamily: "CairoBold",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -50,
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
  listContainer: {
    paddingBottom: 40,
  },
});

export default OrdersScreen;

