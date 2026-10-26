import AppBar from "@/components/AppBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "expo-router/react-navigation";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FlashMessage, { showMessage } from "react-native-flash-message";
import CustomTabs from "../components/CustomTabs";
import MaidInfoSection from "../components/maidDetailsComponents/MaidInfoSection";
import OrderModal from "../components/maidDetailsComponents/OrderModal";
import ServiceAndSalarySection from "../components/maidDetailsComponents/ServiceAndSalarySection";
import { getDeliveryZonesByBranchId } from "./Api/DeliveryZoneService";
import { addInvoice } from "./Api/InvoiceService";
import { addOrder } from "./Api/OrderService";
import { getWorkerById, getWorkerCv } from "./Api/WorkerService";

const MaidDetails = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const router = useRouter();
  const { maidId } = route.params;

  const [maid, setMaid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visaNumber, setVisaNumber] = useState("190");
  const [startDate, setStartDate] = useState(null);
  const [hourlyDateTime, setHourlyDateTime] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [branchDeliveryZones, setBranchDeliveryZones] = useState([]);

  // ✨ حالة جديدة لعدد الأشهر في الإيجار الشهري
  const [monthsCount, setMonthsCount] = useState("1");

  const showAlert = (message, type = "info", title = t("common.alert")) => {
    showMessage({
      message: title,
      description: message,
      type: type,
      icon: type,
      duration: 3500,
    });
  };

  useEffect(() => {
    const fetchMaidAndClientId = async () => {
      try {
        const maidData = await getWorkerById(i18n.language, maidId);

        console.log("=== Worker Data Response (JSON) ===");
        console.log(JSON.stringify(maidData, null, 2));

        setMaid(maidData.data);

        if (maidData.data?.branch?.id) {
          try {
            const zonesResponse = await getDeliveryZonesByBranchId(
              i18n.language,
              maidData.data.branch.id
            );

            console.log("=== Delivery Zones Response (JSON) ===");
            console.log(JSON.stringify(zonesResponse, null, 2));

            if (zonesResponse && zonesResponse.data) {
              const activeZones = zonesResponse.data.filter(
                (zone) => zone.active === true
              );
              setBranchDeliveryZones(activeZones);
            }
          } catch (zoneError) {
            console.log("Error fetching delivery zones:", zoneError);
          }
        }

        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData && userData.id) {
            setClientId(userData.id);
          } else {
            showAlert(
              t("maid_details.alerts.re_login"),
              "danger",
              t("common.error")
            );
          }
        } else {
          showAlert(
            t("maid_details.alerts.re_login"),
            "danger",
            t("common.error")
          );
        }
      } catch (err) {
        console.log("Error loading data:", err);
        showAlert(
          t("maid_details.alerts.fetch_error"),
          "danger",
          t("common.error")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaidAndClientId();
  }, [maidId, i18n.language]);

  const handleShowCv = async () => {
    try {
      const cvData = await getWorkerCv(i18n.language, maidId);
      const cvUrl = cvData.files[0]?.fileUrl;

      if (cvUrl) {
        await WebBrowser.openBrowserAsync(cvUrl, {
          toolbarColor: "#002E5A",
          enableBarCollapsing: true,
          showTitle: true,
        });
      } else {
        showAlert(t("maid_details.alerts.no_cv"), "warning", t("common.alert"));
      }
    } catch (error) {
      showAlert(t("maid_details.alerts.cv_error"), "danger", t("common.error"));
    }
  };

  const handleSubmitOrder = async (
    deliveryOptionSelected,
    selectedPrice = null,
    selectedPriceId = null,
    selectedArea = null
  ) => {
    if (!clientId) {
      showAlert(t("maid_details.alerts.re_login"), "danger", t("common.error"));
      return;
    }

    const safeServiceName = (
      maid.companyService?.nameAr ||
      maid.companyService?.nameEn ||
      maid.companyService?.name ||
      ""
    ).toLowerCase();

    const englishKind =
      maid.companyService?.nameEn || maid.companyService?.name || "Mediation";
    const branchId = maid.branch?.id;

    let finalRecruitmentFeeId = selectedPriceId;
    if (!finalRecruitmentFeeId && maid.prices && maid.prices.length > 0) {
      const defaultPlan =
        maid.prices.find((p) => p.isDefault) || maid.prices[0];
      finalRecruitmentFeeId = defaultPlan?.id || null;
    }

    let orderData = {
      ClientId: clientId,
      WorkerId: maid.id,
      RecruitmentFeeId: finalRecruitmentFeeId,
      Num: null,
      Kind: englishKind,
      VisaNumber: null,
      Status: "Pending",
      StartDate: null,
      EndDate: null,
      HasDelivery: deliveryOptionSelected,
    };

    if (
      safeServiceName.includes("توسط") ||
      safeServiceName.includes("تعاقد") ||
      safeServiceName.includes("mediation") ||
      safeServiceName.includes("contract")
    ) {
      if (!visaNumber) {
        showAlert(
          t("maid_details.alerts.visa_required"),
          "warning",
          t("common.error")
        );
        return;
      }
      orderData.VisaNumber = visaNumber;
    } else if (
      safeServiceName.includes("شهري") ||
      safeServiceName.includes("monthly")
    ) {
      if (!startDate) {
        showAlert(
          t("maid_details.alerts.date_required"),
          "warning",
          t("common.error")
        );
        return;
      }
      const calculatedEndDate = new Date(startDate);
      calculatedEndDate.setMonth(
        calculatedEndDate.getMonth() + Number(monthsCount)
      );
      orderData.StartDate = startDate.toISOString();
      orderData.EndDate = calculatedEndDate.toISOString();
    } else if (
      safeServiceName.includes("ساعة") ||
      safeServiceName.includes("hourly")
    ) {
      if (!hourlyDateTime) {
        showAlert(
          t("maid_details.alerts.time_required"),
          "warning",
          t("common.error")
        );
        return;
      }
      const hour = hourlyDateTime.getHours();
      const minute = hourlyDateTime.getMinutes();

      const selectedPlan = maid.prices?.find((p) => p.price === selectedPrice);
      const hoursDuration = selectedPlan?.hours || 8;

      // ✨ تعديل تحقق الوقت ليشمل الباقات الطويلة (12 ساعة أو 24 ساعة وما فوقها)
      if (hoursDuration >= 12) {
        if (hour < 8 || hour > 21) {
          showMessage({
            message: t("common.alert") || "تنبيه",
            description: t(
              "order_modal.time_range_error_long_shift",
              "يجب أن تبدأ الخدمة بين الساعة 8 صباحاً و 10 مساءً"
            ),
            type: "warning",
            icon: "warning",
            duration: 5000,
            style: { paddingVertical: 15, borderRadius: 10, margin: 10 },
            titleStyle: { fontFamily: "CairoBold", fontSize: 16 },
            textStyle: { fontFamily: "Cairo", fontSize: 14 },
          });
          return;
        }
      } else {
        const maxStartHour = 22 - hoursDuration;
        if (
          hour < 8 ||
          hour > maxStartHour ||
          (hour === maxStartHour && minute > 0)
        ) {
          showMessage({
            message: t("common.alert") || "تنبيه",
            description: t("maid_details.alerts.time_range_error", {
              maxTime: maxStartHour > 12 ? maxStartHour - 12 : maxStartHour,
              hours: hoursDuration,
            }),
            type: "warning",
            icon: "warning",
            duration: 5000,
            style: { paddingVertical: 15, borderRadius: 10, margin: 10 },
            titleStyle: { fontFamily: "CairoBold", fontSize: 16 },
            textStyle: { fontFamily: "Cairo", fontSize: 14 },
          });
          return;
        }
      }

      const calculatedEndDate = new Date(hourlyDateTime);
      calculatedEndDate.setHours(calculatedEndDate.getHours() + hoursDuration);

      orderData.StartDate = hourlyDateTime.toISOString();
      orderData.EndDate = calculatedEndDate.toISOString();
    }

    setIsSubmitting(true);

    try {
      console.log("=== Order Payload JSON ===");
      console.log(JSON.stringify(orderData, null, 2));

      const orderResponse = await addOrder(i18n.language, orderData);
      const orderId = orderResponse.data.id;

      console.log("=== Order Response JSON ===");
      console.log(JSON.stringify(orderResponse.data || orderResponse, null, 2));

      // --- حسابات الفاتورة والضريبة (السعر شامل الضريبة) ---
      const defaultPlan =
        maid.prices?.find((p) => p.isDefault) || maid.prices?.[0] || {};
      let singlePrice = selectedPrice || defaultPlan.price || maid.price || 0;
      let grossPrice = singlePrice;

      if (
        safeServiceName.includes("شهري") ||
        safeServiceName.includes("monthly")
      ) {
        grossPrice = Number(singlePrice) * Number(monthsCount);
      }

      const vatRate = maid.branch?.office?.vatRate || 0;
      const taxPercentage = Number(vatRate);

      const netSubTotal = Number(grossPrice) / (1 + taxPercentage / 100);
      const taxAmount = Number(grossPrice) - netSubTotal;

      const finalSubTotal = Number(netSubTotal.toFixed(2));
      const finalTaxAmount = Number(taxAmount.toFixed(2));

      const deliveryCost =
        orderData.HasDelivery && selectedArea
          ? Number(selectedArea.deliveryFee || 0)
          : 0;

      if (!branchId) {
        showAlert(
          t("maid_details.alerts.no_branch"),
          "warning",
          t("common.alert")
        );
      } else {
        // ✨ 1. تجهيز وإرسال الفاتورة لجميع أنواع الطلبات
        const invoiceData = {
          BranchId: branchId,
          ClientId: clientId,
          OrderId: orderId,
          Num: null,
          OfferId: null,
          SubTotal: finalSubTotal,
          Discount: 0,
          GeneralDiscountPer: 0,
          TaxPer: taxPercentage,
          Tax: finalTaxAmount,
          Delivery: deliveryCost,
          PaidCash: 0,
          PaidWallet: 0,
          Note: `Invoice for ${englishKind}`,
          HasDelivery: orderData.HasDelivery,
        };

        console.log("=== Invoice Payload JSON ===");
        console.log(JSON.stringify(invoiceData, null, 2));

        const invoiceResponse = await addInvoice(i18n.language, invoiceData);

        console.log("=== Invoice Response JSON ===");
        console.log(
          JSON.stringify(invoiceResponse.data || invoiceResponse, null, 2)
        );

        // إغلاق الـ Modal أولاً لتفادي تداخل الواجهات وتجميد الشاشة أثناء الانتقال
        setModalVisible(false);

        // ✨ 2. توجيه المستخدم بناءً على نوع الخدمة
        if (
          safeServiceName.includes("توسط") ||
          safeServiceName.includes("تعاقد") ||
          safeServiceName.includes("mediation") ||
          safeServiceName.includes("contract")
        ) {
          showAlert(
            t(
              "maid_details.alerts.success_recruitment",
              "تم إنشاء الطلب والفاتورة بنجاح"
            ),
            "success",
            t("common.success")
          );
          // توجيه لصفحة الطلبات لعدم وجود دفع إلكتروني لها
          router.push("/orders");
        } else {
          showAlert(
            t(
              "maid_details.alerts.invoice_success",
              "تم إنشاء الطلب والفاتورة بنجاح"
            ),
            "success",
            t("common.success")
          );
          // توجيه لصفحة الدفع لباقي الخدمات (الشهري والساعة)
          router.push({
            pathname: "/PaymentScreen",
            params: { orderId: orderId },
          });
        }
      }
    } catch (error) {
      console.log("=== Error JSON ===");
      console.log(JSON.stringify(error?.response?.data || error, null, 2));

      showAlert(
        error.response?.data?.message || t("common.error_connection"),
        "danger",
        t("common.error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2B9B72" />
        <Text style={{ marginTop: 10, fontFamily: "CairoBold", color: "#002E5A" }}>
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  if (!maid || clientId === null) {
    return (
      <View style={styles.center}>
        <Text style={{ fontFamily: "Cairo" }}>
          {t("maid_details.alerts.fetch_error")}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppBar onNotificationPress={() => router.push("/notifications")} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <MaidInfoSection maid={maid} />

        <View style={styles.detailsCard}>
          <ServiceAndSalarySection
            maid={maid}
            handleShowCv={handleShowCv}
            handleOrderNowPress={() => setModalVisible(true)}
          />
        </View>
      </ScrollView>

      <OrderModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        serviceType={maid.companyService?.nameAr}
        visaNumber={visaNumber}
        setVisaNumber={setVisaNumber}
        startDate={startDate}
        setStartDate={setStartDate}
        hourlyDateTime={hourlyDateTime}
        setHourlyDateTime={setHourlyDateTime}
        handleSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
        prices={maid.prices || []}
        deliveryAreas={branchDeliveryZones}
        monthsCount={monthsCount}
        setMonthsCount={setMonthsCount}
        baseWorkerPrice={maid.price}
      />

      <CustomTabs />
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "transparent",
    paddingBottom: 100,
  },
  detailsCard: {
    width: "100%",
    padding: 0,
    marginTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});

export default MaidDetails;
