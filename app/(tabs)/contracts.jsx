import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppBar from "../../components/AppBar";
import OrderModal from "../../components/maidDetailsComponents/OrderModal";
import NetworkErrorView from "../../components/ui/NetworkErrorView";
import { RTL } from "../../utils/rtlHelper";
import { getAllContracts, printContract } from "../Api/ContractService";
import { addInvoice } from "../Api/InvoiceService";
import { getWorkerById } from "../Api/WorkerService";

const Contracts = () => {
  const { t, i18n } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientId, setClientId] = useState(null);
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contractToExtend, setContractToExtend] = useState(null);
  const [newStartDate, setNewStartDate] = useState(new Date());
  const [hourlyDateTime, setHourlyDateTime] = useState(new Date());
  const [renewalServiceType, setRenewalServiceType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // ✨ حالات جديدة لعدد الأشهر والبيانات الحية
  const [monthsCount, setMonthsCount] = useState("1"); // تم إضافته لمنع الخطأ
  const [liveWorkerPrices, setLiveWorkerPrices] = useState([]);
  const [liveVatRate, setLiveVatRate] = useState(0);
  const [fetchingWorkerId, setFetchingWorkerId] = useState(null);

  const fetchContracts = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const contractsData = await getAllContracts(
        i18n.language,
        clientId,
        null,
        null
      );
      if (contractsData?.success === 1 && Array.isArray(contractsData.data)) {
        setContracts(contractsData.data);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(t("contracts.error_fetch", "فشل في تحميل العقود. يرجى المحاولة مرة أخرى."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getClientId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        const userTokenString = await AsyncStorage.getItem("userToken");
        if (userDataString && userTokenString) {
          const userData = JSON.parse(userDataString);
          setClientId(userData.id);
        } else {
          if (userDataString || userTokenString) {
            await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
          }
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    if (clientId) fetchContracts();
  }, [clientId, i18n.language]);

  const getRemainingTime = (endDate, isHourly, startDate) => {
    if (!endDate || !startDate)
      return {
        text: t("contracts.status_undefined", "غير محدد"),
        color: "#64748B",
        backgroundColor: "rgba(100, 116, 139, 0.08)",
        borderColor: "rgba(100, 116, 139, 0.18)",
        isExpired: false,
        diffDays: 999,
      };

    const now = new Date();
    const utcEndDateString = endDate.endsWith("Z") ? endDate : `${endDate}Z`;
    const end = new Date(utcEndDateString);

    const diffMs = end.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs <= 0)
      return {
        text: t("contracts.status_expired", "منتهي"),
        color: "#DC2626",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        borderColor: "rgba(239, 68, 68, 0.18)",
        isExpired: true,
        diffDays: 0,
      };

    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (isHourly) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const isNearExpiry = diffDays <= 7;
      return {
        text: t(
          "contracts.status_remaining_hourly_exact",
          "متبقي {{hours}} ساعة و {{minutes}} دقيقة",
          { hours, minutes }
        ),
        color: isNearExpiry ? "#D97706" : "#2B9B72",
        backgroundColor: isNearExpiry ? "rgba(245, 158, 11, 0.08)" : "rgba(43, 155, 114, 0.08)",
        borderColor: isNearExpiry ? "rgba(245, 158, 11, 0.18)" : "rgba(43, 155, 114, 0.18)",
        isExpired: false,
        diffDays: diffDays,
      };
    }

    const isNearExpiry = diffDays <= 7;
    return {
      text: t("contracts.status_remaining_days", "متبقي {{count}} يوم", {
        count: Math.ceil(diffDays),
      }),
      color: isNearExpiry ? "#D97706" : "#2B9B72",
      backgroundColor: isNearExpiry ? "rgba(245, 158, 11, 0.08)" : "rgba(43, 155, 114, 0.08)",
      borderColor: isNearExpiry ? "rgba(245, 158, 11, 0.18)" : "rgba(43, 155, 114, 0.18)",
      isExpired: false,
      diffDays: diffDays,
    };
  };

  const formatContractDate = (dateString, showTime) => {
    if (!dateString) return "--/--/----";
    const utcDateString = dateString.endsWith("Z")
      ? dateString
      : `${dateString}Z`;
    const date = new Date(utcDateString);
    const locale = i18n.language === "ar" ? "ar-EG" : "en-GB";
    const datePart = date.toLocaleDateString(locale);
    if (showTime) {
      const timePart = date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${datePart}\n${timePart}`;
    }
    return datePart;
  };

  const handleOpenExtendModal = async (contract) => {
    const workerId = contract.order?.worker?.id;
    if (!workerId) return;

    setFetchingWorkerId(contract.id);
    try {
      console.log("Fetching live worker data for renewal...");
      const res = await getWorkerById(i18n.language, workerId);

      if (res && res.success === 1 && res.data) {
        setLiveWorkerPrices(res.data.prices || []);
        const vat =
          res.data.branch?.office?.vatRate || res.data.branch?.vatRate || 0;
        setLiveVatRate(Number(vat));

        const orderKind = contract.order?.kind || "";
        const isHourly =
          orderKind.includes("ساعة") ||
          orderKind.toLowerCase().includes("hour") ||
          contract.type === 2;

        setContractToExtend(contract);
        setRenewalServiceType(isHourly ? "hourly" : "monthly");
        setMonthsCount("1"); // إعادة تعيين الأشهر لـ 1 عند فتح النافذة
        setIsModalVisible(true);
      } else {
        Alert.alert(
          t("common.error"),
          t("contracts.error_fetch_prices", "فشل في جلب الأسعار الحالية")
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingWorkerId(null);
    }
  };

  const handleSubmitRenewal = async (
    deliveryOptionSelected,
    selectedPriceFromModal = null,
    selectedPriceId = null,
    selectedAreaObject = null
  ) => {
    if (!contractToExtend) return;
    setIsSubmitting(true);

    try {
      const orderInfo = contractToExtend.order;

      // 1. حساب الإجمالي (Gross)
      const deliveryFee =
        deliveryOptionSelected && selectedAreaObject
          ? Number(selectedAreaObject.deliveryFee)
          : 0;

      // ✨ استخراج السعر الأساسي (سواء كان سعر الباقة أو السعر القديم)
      let basePrice = selectedPriceFromModal
        ? Number(selectedPriceFromModal)
        : Number(contractToExtend.totalCost || 0);

      // ✨ إذا كانت الخدمة شهرية، نضرب السعر في عدد الأشهر
      if (renewalServiceType === "monthly") {
        basePrice = basePrice * Number(monthsCount);
      }

      const grossPrice = basePrice;

      // 2. الحساب العكسي للضريبة
      const taxPercentage = liveVatRate;
      const netSubTotal = grossPrice / (1 + taxPercentage / 100);
      const taxAmount = grossPrice - netSubTotal;

      const finalSubTotal = Number(netSubTotal.toFixed(2));
      const finalTaxAmount = Number(taxAmount.toFixed(2));

      // 3. تجهيز InvoiceModel المحدث
      const invoiceData = {
        Id: null,
        BranchId: orderInfo?.worker?.branchId || contractToExtend.officeId,
        ClientId: clientId,
        OrderId: orderInfo?.id,
        Num: null,
        OfferId: null,
        SubTotal: finalSubTotal,
        Discount: 0,
        GeneralDiscountPer: 0,
        TaxPer: taxPercentage,
        Tax: finalTaxAmount,
        Delivery: deliveryFee,
        PaidCash: 0,
        PaidVisa: 0,
        Note: "تجديد عقد عبر الموبايل",
        IsRenewed: true,
      };

      console.log("Sending Renewal Invoice:", invoiceData);
      const invoiceResponse = await addInvoice(i18n.language, invoiceData);

      if (invoiceResponse && invoiceResponse.success === 1) {
        setIsModalVisible(false);

        // حساب تاريخ الانتهاء للإيجار الشهري
        let calculatedEndDate = new Date(newStartDate);
        if (renewalServiceType === "monthly") {
          calculatedEndDate.setMonth(
            calculatedEndDate.getMonth() + Number(monthsCount)
          );
        }

        router.push({
          pathname: "/PaymentScreen",
          params: {
            orderId: orderInfo?.id,
            invoiceId: invoiceResponse.data?.id,
            isRenewal: "true",
            contractId: contractToExtend.id,
            clientId: clientId,
            officeId: contractToExtend.officeId || "",
            totalCost: grossPrice + deliveryFee, // الإجمالي الشامل الذي سيتم دفعه
            recruitmentFeeId: selectedPriceId || null,
            hasDelivery: deliveryOptionSelected ? "true" : "false",
            deliveryZoneId: selectedAreaObject?.id || null,
            startDate:
              renewalServiceType === "hourly"
                ? hourlyDateTime.toISOString()
                : newStartDate.toISOString(),
            endDate:
              renewalServiceType === "monthly"
                ? calculatedEndDate.toISOString()
                : undefined, // تمرير تاريخ الانتهاء المحدث
          },
        });
      } else {
        Alert.alert(
          t("common.error"),
          invoiceResponse?.message || t("contracts.error_fetch")
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.error"), t("common.error_connection"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintContract = async (contractId) => {
    try {
      setPrintingId(contractId);
      const response = await printContract(i18n.language, contractId);
      if (response && response.success === 1 && response.files?.length > 0) {
        const fileUrl =
          typeof response.files[0] === "object"
            ? response.files[0].fileUrl
            : response.files[0];
        if (fileUrl) {
          const supported = await Linking.canOpenURL(fileUrl);
          if (supported) await Linking.openURL(fileUrl);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPrintingId(null);
    }
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
              {t("contracts.title")}
            </Text>
            <Text
              style={[styles.subHeaderText, { textAlign: RTL.textAlign() }]}
            >
              {t("contracts.subtitle", "إدارة وتتبع عقودك الحالية")}
            </Text>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={styles.loadingText}>{t("common.loading", "جاري التحميل...")}</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <NetworkErrorView
            message={error}
            onRetry={fetchContracts}
          />
        )}

        {/* Empty State */}
        {!loading && !error && contracts.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyImageContainer}>
              <MaterialCommunityIcons
                name="file-document-edit-outline"
                size={64}
                color="rgba(43, 155, 114, 0.25)"
              />
            </View>
            <Text style={styles.emptyTitle}>{t("contracts.empty", "لا توجد عقود نشطة")}</Text>
            <Text style={styles.emptySubtitle}>
              {t(
                "contracts.empty_sub",
                "ليس لديك عقود سارية حالياً. يمكنك إنشاء عقد جديد عن طريق طلب عاملة."
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
                  {t("contracts.browse_workers", "تصفح العاملات")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Contracts List */}
        {!loading && !error && contracts.length > 0 && (
          <ScrollView
            style={styles.contractsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {contracts.map((contract) => {
              const orderKind = contract.order?.kind || "";
              const safeOrderKind = orderKind.toLowerCase();
              const isContractService =
                safeOrderKind.includes("توسط") ||
                safeOrderKind.includes("تعاقد") ||
                contract.type === 1;
              const isHourly =
                safeOrderKind.includes("ساعة") || contract.type === 2;
              const isMonthlyRental =
                safeOrderKind.includes("شهري") ||
                safeOrderKind.includes("monthly");

              const statusInfo = getRemainingTime(
                contract.endDate,
                isHourly,
                contract.startDate
              );
              const isWithinRenewalWindow =
                !statusInfo.isExpired && statusInfo.diffDays <= 7;
              const canBeRenewed =
                !isContractService &&
                (isMonthlyRental || isHourly) &&
                contract.order?.status !== "Canceled" &&
                isWithinRenewalWindow;

              return (
                <View key={contract.id} style={styles.contractCard}>
                  {/* Card Header: Badge & Service Title */}
                  <View
                    style={[styles.cardHeader, { flexDirection: RTL.rowDir() }]}
                  >
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusInfo.backgroundColor,
                          borderColor: statusInfo.borderColor,
                          flexDirection: RTL.rowDir(),
                        },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusInfo.color }]}
                      >
                        {statusInfo.text}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.headerRight,
                        { flexDirection: RTL.rowDir() },
                      ]}
                    >
                      <Text style={styles.serviceTitle}>
                        {orderKind ? t(orderKind) : t("Service")}
                      </Text>
                      <View style={styles.contractNumberBadge}>
                        <Text style={styles.contractNumberText}>
                          #{contract.num}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.printButton}
                        onPress={() => handlePrintContract(contract.id)}
                        disabled={printingId === contract.id}
                        activeOpacity={0.8}
                      >
                        {printingId === contract.id ? (
                          <ActivityIndicator size="small" color="#00479E" />
                        ) : (
                          <Icon
                            name="picture-as-pdf"
                            size={18}
                            color="#00479E"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    {/* Worker Info */}
                    <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
                      <View style={styles.iconContainer}>
                        <Icon name="person-outline" size={18} color="#2B9B72" />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}>
                          {t("contracts.label_worker", "العاملة")}
                        </Text>
                        <Text style={[styles.infoValue, { textAlign: RTL.textAlign() }]}>
                          {contract.order?.worker?.name || "---"}
                        </Text>
                      </View>
                    </View>

                    {/* Service Type */}
                    <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
                      <View style={styles.iconContainer}>
                        <Icon name="work-outline" size={18} color="#2B9B72" />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}>
                          {t("orders.order_type", "نوع الخدمة")}
                        </Text>
                        <Text style={[styles.infoValue, { textAlign: RTL.textAlign() }]}>
                          {isContractService
                            ? t("orders.contract", "خدمات التوسط")
                            : contract.order?.worker?.companyService?.name || orderKind}
                        </Text>
                      </View>
                    </View>

                    {/* Cost */}
                    <View style={[styles.infoRow, { flexDirection: RTL.rowDir() }]}>
                      <View style={styles.iconContainer}>
                        <Icon name="payments" size={18} color="#2B9B72" />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { textAlign: RTL.textAlign() }]}>
                          {t("contracts.label_cost", "تكلفة العقد")}
                        </Text>
                        <Text style={[styles.infoValue, { textAlign: RTL.textAlign(), color: "#2B9B72" }]}>
                          {contract.totalCost || 0} {t("common.currency", "ر.س")}
                        </Text>
                      </View>
                    </View>

                    {/* Dates Container */}
                    <View style={[styles.dateContainer, { flexDirection: RTL.rowDir() }]}>
                      <View style={styles.dateBox}>
                        <View style={[styles.dateHeaderRow, { flexDirection: RTL.rowDir() }]}>
                          <Icon name="date-range" size={14} color="#002E5A" style={{ marginRight: 4 }} />
                          <Text style={styles.dateLabel}>{t("contracts.label_start")}</Text>
                        </View>
                        <Text style={styles.dateValue}>
                          {formatContractDate(contract.startDate, isHourly)}
                        </Text>
                      </View>
                      <View style={styles.dateDivider} />
                      <View style={styles.dateBox}>
                        <View style={[styles.dateHeaderRow, { flexDirection: RTL.rowDir() }]}>
                          <Icon name="event-busy" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                          <Text style={styles.dateLabel}>{t("contracts.label_end")}</Text>
                        </View>
                        <Text style={styles.dateValue}>
                          {formatContractDate(contract.endDate, isHourly)}
                        </Text>
                      </View>
                    </View>

                    {/* Renew Button */}
                    {canBeRenewed && (
                      <TouchableOpacity
                        style={styles.renewButtonContainer}
                        onPress={() => handleOpenExtendModal(contract)}
                        disabled={fetchingWorkerId === contract.id}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={["#2B9B72", "#22805E"]}
                          style={[
                            styles.renewButtonGradient,
                            { flexDirection: RTL.rowDir() },
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {fetchingWorkerId === contract.id ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <>
                              <Icon name="autorenew" size={18} color="#fff" />
                              <Text style={styles.renewButtonText}>
                                {t("contracts.renew_btn", {
                                  price: contract.totalCost || 0,
                                })}
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <OrderModal
        isModalVisible={isModalVisible}
        setModalVisible={setIsModalVisible}
        serviceType={renewalServiceType}
        isRenewal={true}
        startDate={newStartDate}
        setStartDate={setNewStartDate}
        hourlyDateTime={hourlyDateTime}
        setHourlyDateTime={setHourlyDateTime}
        handleSubmitOrder={handleSubmitRenewal}
        isSubmitting={isSubmitting}
        prices={liveWorkerPrices}
        deliveryAreas={
          contractToExtend?.order?.worker?.branch?.areas ||
          contractToExtend?.order?.worker?.branch?.deliveryAreas ||
          []
        }
        monthsCount={monthsCount}
        setMonthsCount={setMonthsCount}
        baseWorkerPrice={contractToExtend?.order?.worker?.price || 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
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
  contractsList: { flex: 1 },
  contractCard: {
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
    padding: 16,
  },
  cardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 46, 90, 0.05)",
  },
  headerRight: { alignItems: "center", gap: 8 },
  serviceTitle: { fontFamily: "CairoBold", fontSize: 13, color: "#002E5A" },
  contractNumberBadge: {
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  contractNumberText: {
    fontSize: 11,
    color: "#002E5A",
    fontFamily: "CairoBold",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statusText: { fontSize: 11, fontFamily: "CairoBold", marginTop: 2 },
  cardBody: { paddingVertical: 12, gap: 12 },
  infoRow: {
    alignItems: "center",
    gap: 12,
    width: "100%",
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
  infoLabel: { fontSize: 11, color: "#64748B", fontFamily: "Cairo", marginBottom: 1 },
  infoValue: { fontSize: 14, fontFamily: "CairoBold", color: "#002E5A" },
  dateContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
    marginTop: 4,
  },
  dateBox: { alignItems: "center", flex: 1 },
  dateHeaderRow: { alignItems: "center", gap: 4, marginBottom: 4 },
  dateDivider: { width: 1, height: 30, backgroundColor: "rgba(0, 46, 90, 0.08)" },
  dateLabel: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  dateValue: {
    fontSize: 12,
    fontFamily: "CairoBold",
    textAlign: "center",
    color: "#002E5A",
  },
  renewButtonContainer: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  renewButtonGradient: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  renewButtonText: { color: "#fff", fontFamily: "CairoBold", fontSize: 13 },
  printButton: {
    backgroundColor: "rgba(0, 71, 158, 0.08)",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 71, 158, 0.12)",
    justifyContent: "center",
    alignItems: "center",
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
});

export default Contracts;
