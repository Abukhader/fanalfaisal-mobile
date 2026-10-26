import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useTranslation } from "react-i18next";
import AppBar from "../components/AppBar";
import { RTL } from "../utils/rtlHelper";
import { getInvoiceByOrderId } from "./Api/InvoiceService";
import { createMoyasarPayment } from "./Api/MoyasarService";
import { createTamaraPayment } from "./Api/TamaraService";
import { createTabbyPayment } from "./Api/TabbyService";
import { executeFatoorahPayment } from "./Api/fatoorahApi";
import { getAvailablePaymentMethods } from "./Api/PaymentService";

import PaymentQuoteSummary from "../components/payment/PaymentQuoteSummary";
import { paymentQuote, paymentMethodsResponse, sameQuote, isInstallmentMethod } from "../utils/paymentQuote";

const showAlert = (message, type = "info", title = "تنبيه") => {
  showMessage({
    message: title,
    description: String(message || ""),
    type: type,
    icon: type,
    duration: 3500,
  });
};

// Visual config for known payment methods
const METHOD_CONFIG = {
  Tamara: {
    nameAr: "تمارا (Tamara)",
    nameEn: "Tamara",
    descAr: "تقسيط ميسر على دفعات شهرية بدون فوائد",
    descEn: "Split in interest-free monthly installments",
    iconName: "calendar-month-outline",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#FF6D60",
    color: "#FF6D60",
  },
  Tabby: {
    nameAr: "تابي (Tabby)",
    nameEn: "Tabby",
    descAr: "قسّم دفعاتك على 4 أقساط شهرية مريحة",
    descEn: "Split into 4 interest-free payments",
    iconName: "credit-card-sync-outline",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#2ED573",
    color: "#2ED573",
  },
  Dinero: {
    nameAr: "دينيرو (Dinero)",
    nameEn: "Dinero",
    descAr: "بوابة دفع إلكتروني فورية وآمنة",
    descEn: "Direct secure online payment gateway",
    iconName: "shield-check-outline",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#3742FA",
    color: "#3742FA",
  },
  MyFatoorah: {
    nameAr: "ماي فاتورة (MyFatoorah)",
    nameEn: "MyFatoorah",
    descAr: "مدى، فيزا، ماستركارد، و Apple Pay",
    descEn: "Mada, Visa, Mastercard & Apple Pay",
    iconName: "credit-card-outline",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#00A8FF",
    color: "#00A8FF",
  },
  Moyasar: {
    nameAr: "ميسر (Moyasar)",
    nameEn: "Moyasar",
    descAr: "بوابة الدفع الإلكتروني المعتمدة",
    descEn: "Saudi approved payment gateway",
    iconName: "cellphone-check",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#20BF6B",
    color: "#20BF6B",
  },
  UrWay: {
    nameAr: "يورواي (UrWay)",
    nameEn: "UrWay",
    descAr: "معالجة المدفوعات الآمنة والبطاقات البنكية",
    descEn: "Secure merchant payment gateway",
    iconName: "bank-outline",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#8854D0",
    color: "#8854D0",
  },
  Cash: {
    nameAr: "الدفع بالفرع (Cash / POS)",
    nameEn: "Cash / In-Office POS",
    descAr: "السداد المباشر في مقر المكتب أو عبر أجهزة نقاط البيع",
    descEn: "Direct payment at the office branch or POS",
    iconName: "cash-multiple",
    iconType: "MaterialCommunityIcons",
    badgeColor: "#747D8C",
    color: "#747D8C",
  },
};

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const {
    orderId,
    isRenewal,
    contractId,
    startDate,
    invoiceId,
    clientId,
    officeId,
    totalCost,
  } = params;

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [amountDue, setAmountDue] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const requestVersion = useRef(0);
  const submittingRef = useRef(false);
  const scrollRef = useRef(null);

  const loadPaymentData = useCallback(async () => {
    const version = ++requestVersion.current;
    setDataLoading(true);
    setErrorMsg(null);
    setAvailableMethods([]);
    setSelectedMethod(null);
    setPendingCheckout(null);
    setAmountDue(null);
    setInvoiceData(null);
    setCurrentInvoiceId(null);
    if (!orderId) {
      setErrorMsg(t("payment.order_id_missing", "معرف الطلب غير متوفر."));
      setDataLoading(false);
      return;
    }
    try {
      const [invoiceResult, methodsResult] = await Promise.allSettled([
        getInvoiceByOrderId(i18n.language, orderId),
        getAvailablePaymentMethods(i18n.language, orderId),
      ]);
      if (version !== requestVersion.current) return;
      if (methodsResult.status === "rejected") throw methodsResult.reason;
      const parsed = paymentMethodsResponse(methodsResult.value);
      const invRes = invoiceResult.status === "fulfilled" ? invoiceResult.value : null;
      const invoice = invRes && (invRes.success === 1 || invRes.Success === 1) ? invRes.data : null;
      setInvoiceData(invoice);
      setCurrentInvoiceId(invoice?.id || invoice?.Id || invoiceId);
      setAmountDue(parsed.amountDue);
      const methods = parsed.methods.map((m) => ({ ...m, name: m.name || m.method, method: m.method || m.name }))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setAvailableMethods(methods);
      setSelectedMethod(methods.find((m) => m.name !== "Cash") || methods[0] || null);
    } catch (error) {
      if (version === requestVersion.current) setErrorMsg(error?.response?.data?.message || (i18n.language === "ar" ? "تعذر تحميل وسائل الدفع. حاول مجددًا." : "Unable to load payment methods. Please retry."));
    } finally {
      if (version === requestVersion.current) setDataLoading(false);
    }
  }, [orderId, invoiceId, i18n.language, t]);

  useEffect(() => {
    // Reset the previous order before fetching its replacement.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPaymentData();
    return () => { requestVersion.current += 1; };
  }, [loadPaymentData]);

  const openInstallmentCheckout = (data, params) => {
    const finalQuote = paymentQuote({ ...data, method: selectedMethod.name });
    if (!finalQuote) {
      showAlert(isRTL ? "تعذر التحقق من مبلغ الدفع النهائي. حدّث وسائل الدفع." : "Unable to verify final pricing. Refresh payment methods.", "danger");
      return;
    }
    const checkout = { pathname: "/payment-webview", params: { ...params, totalCost: finalQuote.total } };
    if (!sameQuote(quote, finalQuote)) {
      setPendingCheckout({ quote: finalQuote, checkout });
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    router.push(checkout);
  };

  const handleProceedToPayment = async () => {
    if (submittingRef.current || dataLoading) return;
    if (!selectedMethod) {
      showAlert(t("payment.select_method_prompt", "يرجى اختيار طريقة الدفع أولاً."), "warning");
      return;
    }

    if (selectedMethod.name === "Cash") {
      Alert.alert(
        t("payment.cash_title", "الدفع في الفرع"),
        t(
          "payment.cash_instructions",
          "تم تأكيد اختيارك للسداد في الفرع. يرجى زيارة أقرب فرع لإتمام السداد وتفعيل العقد."
        ),
        [
          {
            text: t("common.ok", "حسناً"),
            onPress: () => router.replace("/orders"),
          },
        ]
      );
      return;
    }

    if (isInstallmentMethod(selectedMethod.name) && !quote) return;
    if (pendingCheckout) {
      router.push(pendingCheckout.checkout);
      return;
    }

    if (!currentInvoiceId) {
      showAlert(
        t("payment.invoice_not_found", "تعذر العثور على الفاتورة المرتبطة بهذا الطلب."),
        "danger",
        t("common.error", "خطأ")
      );
      return;
    }

    submittingRef.current = true;
    const version = requestVersion.current;
    setLoading(true);

    try {
      const yourDomain = "https://fanalfisal.com.sa";

      // 1) بوابة ماي فاتورة (MyFatoorah)
      if (selectedMethod.name === "MyFatoorah") {
        const paymentAmount = calculatedTotal || totalCost || invoiceData?.total || 0;
        const fatoorahPayload = {
          PaymentMethodId: 2, // 2: Visa/Mastercard/Mada
          InvoiceValue: paymentAmount,
          Amount: paymentAmount,
          InvoiceId: currentInvoiceId,
          Currency: "SAR",
          DisplayCurrencyIso: "SAR",
          CallBackUrl: `${yourDomain}/mobile-payment-redirect`,
          ErrorUrl: `${yourDomain}/mobile-payment-redirect`,
        };

        console.log("💳 Creating MyFatoorah payment with payload:\n", JSON.stringify(fatoorahPayload, null, 2));
        const res = await executeFatoorahPayment(i18n.language, fatoorahPayload);
        console.log("📥 [PaymentScreen] MyFatoorah Response:\n", JSON.stringify(res, null, 2));

        const isSuccess = res && (res.IsSuccess === true || res.success === 1 || res.Success === 1);
        const resData = res?.Data || res?.data;
        const paymentUrl = resData?.PaymentURL || resData?.paymentUrl || resData?.PaymentUrl;

        if (isSuccess && paymentUrl) {
          router.push({
            pathname: "/payment-webview",
            params: {
              paymentUrl: paymentUrl,
              gateway: "MyFatoorah",
              invoiceId: currentInvoiceId,
              orderId: orderId,
              clientId: clientId,
              officeId: officeId,
              totalCost: totalCost || invoiceData?.total || 0,
              isRenewal: isRenewal,
              contractId: contractId,
              startDate: startDate,
            },
          });
        } else {
          showAlert(
            res?.Message || res?.message || t("payment.gateway_init_error", "فشل بدء جلسة الدفع عبر ماي فاتورة."),
            "danger",
            t("common.error", "خطأ")
          );
        }
        return;
      }

      // 2) بوابة تمارا (Tamara)
      if (selectedMethod.name === "Tamara") {
        const tamaraPayload = {
          invoiceId: currentInvoiceId,
          currency: "SAR",
          successUrl: `${yourDomain}/mobile-payment-redirect`,
          cancelUrl: `${yourDomain}/mobile-payment-redirect`,
          failureUrl: `${yourDomain}/mobile-payment-redirect`,
        };

        console.log("💳 Creating Tamara payment with payload:\n", JSON.stringify(tamaraPayload, null, 2));
        const res = await createTamaraPayment(i18n.language, tamaraPayload);
        if (version !== requestVersion.current) return;
        console.log("📥 [PaymentScreen] Tamara Response:\n", JSON.stringify(res, null, 2));

        const isSuccess = res && (res.success === 1 || res.Success === 1);
        const resData = res?.data || res?.Data;
        const paymentUrl = resData?.paymentUrl || resData?.PaymentUrl;
        const tamaraOrderId = resData?.tamaraOrderId || resData?.TamaraOrderId || resData?.checkoutId;

        if (isSuccess && paymentUrl) {
          openInstallmentCheckout(resData, {
              paymentUrl: paymentUrl,
              gateway: "Tamara",
              tamaraOrderId: tamaraOrderId || "",
              invoiceId: currentInvoiceId,
              orderId: orderId,
              clientId: clientId,
              officeId: officeId,
              isRenewal: isRenewal,
              contractId: contractId,
              startDate: startDate,
          });
        } else {
          showAlert(
            res?.message || res?.Message || t("payment.tamara_init_error", "فشل بدء جلسة الدفع عبر تمارا."),
            "danger",
            t("common.error", "خطأ")
          );
        }
        return;
      }

      // 3) بوابة تابي (Tabby)
      if (selectedMethod.name === "Tabby") {
        const tabbyPayload = {
          invoiceId: currentInvoiceId,
          currency: "SAR",
          successUrl: `${yourDomain}/mobile-payment-redirect`,
          cancelUrl: `${yourDomain}/mobile-payment-redirect`,
          failureUrl: `${yourDomain}/mobile-payment-redirect`,
        };

        console.log("💳 Creating Tabby payment with payload:\n", JSON.stringify(tabbyPayload, null, 2));
        const res = await createTabbyPayment(i18n.language, tabbyPayload);
        if (version !== requestVersion.current) return;
        console.log("📥 [PaymentScreen] Tabby Response:\n", JSON.stringify(res, null, 2));

        const isSuccess = res && (res.success === 1 || res.Success === 1);
        const resData = res?.data || res?.Data;
        const paymentUrl = resData?.paymentUrl || resData?.PaymentUrl;
        const tabbyPaymentId =
          resData?.tabbyPaymentId ||
          resData?.TabbyPaymentId ||
          resData?.sessionId ||
          resData?.checkoutId;

        // التحقق من رفض تابي للحد الائتماني
        if (!isSuccess && resData?.rejectionReason) {
          showAlert(
            res?.message ||
              t(
                "payment.tabby_rejected",
                "عذراً، تابي لا تدعم تقسيط هذا المبلغ حالياً. يرجى اختيار وسيلة دفع أخرى."
              ),
            "warning",
            t("common.notice", "تنويه")
          );
          return;
        }

        if (isSuccess && paymentUrl) {
          openInstallmentCheckout(resData, {
              paymentUrl: paymentUrl,
              gateway: "Tabby",
              tabbyPaymentId: tabbyPaymentId || "",
              invoiceId: currentInvoiceId,
              orderId: orderId,
              clientId: clientId,
              officeId: officeId,
              isRenewal: isRenewal,
              contractId: contractId,
              startDate: startDate,
          });
        } else {
          showAlert(
            res?.message || res?.Message || t("payment.tabby_init_error", "فشل بدء جلسة الدفع عبر تابي."),
            "danger",
            t("common.error", "خطأ")
          );
        }
        return;
      }

      // 4) بوابة ميسر (Moyasar)
      const payload = {
        InvoiceId: currentInvoiceId,
        Currency: "SAR",
        SuccessUrl: `${yourDomain}/mobile-payment-redirect`,
        CancelUrl: `${yourDomain}/mobile-payment-redirect`,
      };

      console.log("💳 Creating Moyasar payment with payload:\n", JSON.stringify(payload, null, 2));
      const res = await createMoyasarPayment(i18n.language, payload);

      console.log("📥 [PaymentScreen] Moyasar Response:\n", JSON.stringify(res, null, 2));

      const isSuccess = res && (res.success === 1 || res.Success === 1);
      const resData = res?.data || res?.Data;
      const paymentUrl = resData?.paymentUrl || resData?.PaymentUrl;
      const moyasarInvoiceId = resData?.moyasarInvoiceId || resData?.MoyasarInvoiceId;

      if (isSuccess && paymentUrl) {
        router.push({
          pathname: "/payment-webview",
          params: {
            paymentUrl: paymentUrl,
            gateway: "Moyasar",
            moyasarInvoiceId: moyasarInvoiceId || "",
            invoiceId: currentInvoiceId,
            orderId: orderId,
            clientId: clientId,
            officeId: officeId,
            totalCost: totalCost || invoiceData?.total || 0,
            isRenewal: isRenewal,
            contractId: contractId,
            startDate: startDate,
          },
        });
      } else {
        showAlert(
          res?.message || res?.Message || t("payment.gateway_init_error", "فشل بدء جلسة الدفع عبر البوابة المختارة."),
          "danger",
          t("common.error", "خطأ")
        );
      }
    } catch (error) {
      console.error("❌ [PaymentScreen] Payment initiation error:\n", JSON.stringify(error?.response?.data || { message: error.message }, null, 2));
      showAlert(
        error?.response?.data?.message || error?.response?.data?.Message || t("payment.error_generic", "حدث خطأ أثناء إعداد الدفع."),
        "danger",
        t("common.error", "خطأ")
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const calculatedTotal = invoiceData
    ? Number(
        invoiceData.total ??
        invoiceData.totalAmount ??
        invoiceData.netTotal ??
        (Number(invoiceData.subTotal || 0) +
          Number(invoiceData.tax || invoiceData.vat || 0) +
          Number(invoiceData.delivery || 0) -
          Number(invoiceData.discount || 0))
      )
    : null;

  const quote = pendingCheckout?.quote || paymentQuote(selectedMethod, amountDue, calculatedTotal ?? totalCost);

  return (
    <View style={styles.container}>
      <AppBar />

      {/* الهيدر المتوافق مع اللغتين مع زر الرجوع */}
      <View style={[styles.headerContainer, { flexDirection: RTL.rowDir() }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/orders");
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={RTL.select("arrow-forward", "arrow-back")}
            size={24}
            color="#002E5A"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: RTL.textAlign() }]}>
          {t("payment.header_title", "إتمام الدفع الإلكتروني")}
        </Text>
      </View>

      {dataLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#002E5A" />
          <Text style={styles.loadingText}>
            {t("payment.loading_methods", "جاري تحميل تفاصيل الفاتورة وبوابات الدفع...")}
          </Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPaymentData}>
            <Text style={styles.retryBtnText}>{t("common.retry", "إعادة المحاولة")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Order / Invoice Summary Card */}
          <View style={styles.summaryCard}>
            <View style={[styles.summaryHeader, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.invoiceIconWrap}>
                <MaterialCommunityIcons name="receipt-text-outline" size={24} color="#002E5A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryTitle, { textAlign: RTL.textAlign() }]}>
                  {t("payment.invoice_summary", "ملخص الفاتورة والطلب")}
                </Text>
                {orderId && (
                  <Text style={[styles.orderNumberText, { textAlign: RTL.textAlign() }]}>
                    {t("payment.order_ref", "رقم الطلب:")} #{String(orderId).substring(0, 8)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {selectedMethod && <PaymentQuoteSummary quote={quote} isRTL={isRTL} changed={Boolean(pendingCheckout)} />}
            {selectedMethod && !quote && <TouchableOpacity onPress={loadPaymentData} disabled={loading} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>{isRTL ? "تحديث المبالغ" : "Refresh pricing"}</Text>
            </TouchableOpacity>}

            <View style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
              <Text style={styles.securityText}>
                {t("payment.secure_badge", "سداد إلكتروني معتمد ومشفّر بأعلى معايير الأمان")}
              </Text>
            </View>
          </View>

          {/* Payment Methods Selection Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign: RTL.textAlign() }]}>
              {t("payment.choose_method", "اختر وسيلة الدفع المناسبة")}
            </Text>
            <Text style={[styles.sectionSubtitle, { textAlign: RTL.textAlign() }]}>
              {t("payment.choose_method_desc", "سداد نقدي، بطاقات مدى وفيزا، أو تقسيط شهري ميسر")}
            </Text>
          </View>

          {availableMethods.length === 0 ? (
            /* Empty State: No active payment gateways */
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 20,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(0, 46, 90, 0.08)",
                marginVertical: 10,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "rgba(0, 46, 90, 0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="credit-card-off-outline"
                  size={30}
                  color="#002E5A"
                />
              </View>
              <Text
                style={{
                  fontFamily: "CairoBold",
                  fontSize: 15,
                  color: "#002E5A",
                  textAlign: "center",
                }}
              >
                {t("payment.no_methods_title", "لا توجد وسائل دفع إلكتروني مفعلة")}
              </Text>
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 12,
                  color: "#64748B",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {t(
                  "payment.no_methods_desc",
                  "لم يتم تفعيل بوابات الدفع الإلكتروني لهذا الطلب حالياً. يرجى مراجعة إدارة المكتب لإتمام السداد."
                )}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/orders")}
                style={{
                  marginTop: 8,
                  backgroundColor: "#002E5A",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "CairoBold",
                    fontSize: 13,
                    color: "#FFFFFF",
                  }}
                >
                  {t("payment.back_to_orders", "الرجوع للطلبات")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.methodsList}>
                {availableMethods.map((methodItem, idx) => {
                  const methodName = methodItem.name || methodItem.method || "Gateway";
                  const isSelected = selectedMethod?.name === methodName;
                  const meta = METHOD_CONFIG[methodName] || {
                    nameAr: methodItem.displayName || methodName,
                    nameEn: methodItem.displayName || methodName,
                    descAr: "سداد آمن ومباشر",
                    descEn: "Secure direct checkout",
                    iconName: "credit-card-outline",
                    badgeColor: "#002E5A",
                    color: "#002E5A",
                  };

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.85}
                      style={[
                        styles.methodCard,
                        isSelected && styles.methodCardSelected,
                        { flexDirection: RTL.rowDir() },
                      ]}
                      disabled={loading}
                      onPress={() => { if (!submittingRef.current) { setPendingCheckout(null); setSelectedMethod(methodItem); } }}
                    >
                      <View
                        style={[
                          styles.methodIconBox,
                          { backgroundColor: `${meta.badgeColor}15` },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={meta.iconName || "credit-card"}
                          size={24}
                          color={meta.color || "#002E5A"}
                        />
                      </View>

                      <View style={styles.methodInfo}>
                        <Text
                          style={[
                            styles.methodTitle,
                            isSelected && styles.methodTitleSelected,
                            { textAlign: RTL.textAlign() },
                          ]}
                        >
                          {isRTL ? meta.nameAr : meta.nameEn}
                        </Text>
                        <Text
                          style={[
                            styles.methodDesc,
                            { textAlign: RTL.textAlign() },
                          ]}
                          numberOfLines={2}
                        >
                          {isRTL ? meta.descAr : meta.descEn}
                        </Text>
                      </View>

                      <View style={styles.radioWrapper}>
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action CTA Button */}
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!selectedMethod || loading || (isInstallmentMethod(selectedMethod?.name) && !quote)) && styles.payButtonDisabled,
                ]}
                disabled={!selectedMethod || loading || (isInstallmentMethod(selectedMethod?.name) && !quote)}
                onPress={handleProceedToPayment}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="lock-check-outline"
                      size={20}
                      color="#FFFFFF"
                      style={{ marginHorizontal: 8 }}
                    />
                    <Text style={styles.payButtonText}>
                      {pendingCheckout ? (isRTL ? "تأكيد المبلغ الجديد والمتابعة" : "Confirm updated amount and continue") : selectedMethod?.name === "Cash"
                        ? t("payment.confirm_cash", "تأكيد اختيار السداد بالفرع")
                        : t("payment.proceed_to_pay", "المتابعة إلى بوابة الدفع الآمنة")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    width: "100%",
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#002E5A",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    color: "#002E5A",
    fontFamily: "CairoBold",
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#DC2626",
    fontFamily: "Cairo",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#002E5A",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "CairoBold",
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  summaryHeader: {
    alignItems: "center",
    gap: 12,
  },
  invoiceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0, 46, 90, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#0F172A",
  },
  orderNumberText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#475569",
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amountValue: {
    fontSize: 22,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  currencyText: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#2B9B72",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: "#166534",
    fontFamily: "Cairo",
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  methodsList: {
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 12,
  },
  methodCardSelected: {
    borderColor: "#002E5A",
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#1E293B",
  },
  methodTitleSelected: {
    color: "#002E5A",
  },
  methodDesc: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  radioWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#002E5A",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#002E5A",
  },
  payButton: {
    backgroundColor: "#002E5A",
    borderRadius: 16,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "CairoBold",
  },
});
