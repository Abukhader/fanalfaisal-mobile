import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FlashMessage from "react-native-flash-message";
import { WebView } from "react-native-webview";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { renewContract } from "./Api/ContractService";
import { checkMoyasarPayment } from "./Api/MoyasarService";
import { checkTamaraPayment } from "./Api/TamaraService";
import { checkTabbyPayment } from "./Api/TabbyService";
import { getFatoorahPaymentStatus } from "./Api/fatoorahApi";
import { RTL } from "../utils/rtlHelper";

const PaymentWebViewScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const webViewRef = useRef(null);

  const {
    paymentUrl,
    gateway,
    moyasarInvoiceId,
    tamaraOrderId,
    tabbyPaymentId,
    isRenewal,
    contractId,
    orderId,
    startDate,
    clientId,
    officeId,
    totalCost,
    invoiceId,
  } = useLocalSearchParams();

  const isProcessing = useRef(false);
  const pollingTimerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("loading");
  const [message, setMessage] = useState("جاري التوجيه إلى بوابة الدفع...");

  const stopPolling = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  const verifyPaymentOnServer = async (manualPaymentId = null) => {
    if (isProcessing.current || paymentStatus === "success") return;

    try {
      if (gateway === "MyFatoorah" && manualPaymentId) {
        console.log("🔍 Checking MyFatoorah status for paymentId:", manualPaymentId);
        const res = await getFatoorahPaymentStatus(i18n.language, manualPaymentId);
        console.log("📥 MyFatoorah Status Response:\n", JSON.stringify(res, null, 2));
        if (res?.success === 1 || res?.IsSuccess === true || res?.data?.InvoiceStatus === "Paid") {
          stopPolling();
          handlePaymentSuccess(manualPaymentId);
          return true;
        }
      }

      // التحقق من تمارا (Tamara)
      if (gateway === "Tamara") {
        const tamaraCheckPayload = {
          tamaraOrderId: tamaraOrderId || manualPaymentId,
          paymentId: manualPaymentId || tamaraOrderId,
          orderId: orderId,
          invoiceId: invoiceId,
        };

        console.log("🔍 [TAMARA_TRACKING] Checking Tamara status:\n", JSON.stringify(tamaraCheckPayload, null, 2));
        const res = await checkTamaraPayment(i18n.language, tamaraCheckPayload);
        console.log("📥 [TAMARA_TRACKING] Tamara Status Response:\n", JSON.stringify(res, null, 2));

        const isSuccess = res && (res.Success === 1 || res.success === 1);
        const msg = String(res?.Message || res?.message || "").toLowerCase();
        const isPending =
          msg.includes("new") ||
          msg.includes("approved") ||
          msg.includes("authorised") ||
          msg.includes("pending");

        if (isSuccess) {
          stopPolling();
          handlePaymentSuccess(res?.Data?.id || res?.data?.id || tamaraOrderId || manualPaymentId);
          return true;
        }

        if (!isPending && (res?.Success === 0 || res?.success === 0)) {
          console.warn("⚠️ [TAMARA_TRACKING] Tamara payment failed or not ready yet.");
        }
        return false;
      }

      // التحقق من تابي (Tabby)
      if (gateway === "Tabby") {
        const tabbyCheckPayload = {
          tabbyPaymentId: tabbyPaymentId || manualPaymentId,
          paymentId: manualPaymentId || tabbyPaymentId,
          orderId: orderId,
        };

        console.log("🔍 [TABBY_TRACKING] Checking Tabby status:\n", JSON.stringify(tabbyCheckPayload, null, 2));
        const res = await checkTabbyPayment(i18n.language, tabbyCheckPayload);
        console.log("📥 [TABBY_TRACKING] Tabby Status Response:\n", JSON.stringify(res, null, 2));

        const isSuccess = res && (res.Success === 1 || res.success === 1);
        const msg = String(res?.Message || res?.message || "").toUpperCase();
        const isPending =
          msg.includes("CREATED") ||
          msg.includes("AUTHORIZED") ||
          msg.includes("PENDING");

        if (isSuccess) {
          stopPolling();
          handlePaymentSuccess(res?.Data?.id || res?.data?.id || tabbyPaymentId || manualPaymentId);
          return true;
        }

        if (!isPending && (res?.Success === 0 || res?.success === 0)) {
          console.warn("⚠️ [TABBY_TRACKING] Tabby payment failed or not ready yet.");
        }
        return false;
      }

      const checkPayload = {};
      if (manualPaymentId) checkPayload.PaymentId = manualPaymentId;
      if (moyasarInvoiceId) checkPayload.MoyasarInvoiceId = moyasarInvoiceId;
      if (orderId) checkPayload.OrderId = orderId;

      console.log(
        "🔍 [MOYASAR_TRACKING] Calling Server CheckPayment:\n" +
          JSON.stringify(
            {
              event: "CHECK_PAYMENT_INVOKED",
              trigger: manualPaymentId ? "MANUAL_OR_URL_REDIRECT" : "POLLING_INTERVAL",
              manualPaymentId,
              moyasarInvoiceId,
              orderId,
              invoiceId,
              payloadSent: checkPayload,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
      );

      const res = await checkMoyasarPayment(i18n.language, checkPayload);

      const isSuccess = res && (res.Success === 1 || res.success === 1);
      const msg = String(res?.Message || res?.message || "").toLowerCase();
      const isPending =
        msg.includes("initiated") ||
        msg.includes("authorized") ||
        msg.includes("verified");

      console.log(
        "📥 [MOYASAR_TRACKING] CheckPayment Result Interpreted:\n" +
          JSON.stringify(
            {
              event: "CHECK_PAYMENT_RESULT",
              rawSuccess: res?.Success ?? res?.success,
              isSuccess,
              isPending,
              isFailure: !isPending && !isSuccess,
              message: res?.Message || res?.message,
              data: res?.Data || res?.data,
              fullResponse: res,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
      );

      if (isSuccess) {
        stopPolling();
        handlePaymentSuccess(res?.Data?.id || res?.data?.id || moyasarInvoiceId);
        return true;
      }

      if (!isPending && (res?.Success === 0 || res?.success === 0)) {
        console.warn(
          "⚠️ [MOYASAR_TRACKING] Server returned definite payment failure:\n" +
            JSON.stringify(
              {
                message: res?.Message || res?.message,
                data: res?.Data || res?.data,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )
        );
      }
      return false;
    } catch (err) {
      console.error(
        "❌ [PAYMENT_TRACKING] verifyPaymentOnServer Exception:\n" +
          JSON.stringify(
            {
              error: err?.message,
              httpStatus: err?.response?.status,
              httpStatusText: err?.response?.statusText,
              responseData: err?.response?.data,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
      );
      return false;
    }
  };

  // Start polling every 4 seconds after a short initial delay
  useEffect(() => {
    console.log(
      "🚀 [PAYMENT_TRACKING] Payment WebView Screen Initialized:\n" +
        JSON.stringify(
          {
            event: "SCREEN_MOUNT",
            gateway,
            moyasarInvoiceId,
            tamaraOrderId,
            tabbyPaymentId,
            orderId,
            invoiceId,
            clientId,
            officeId,
            totalCost,
            paymentUrl,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const initialTimeout = setTimeout(() => {
      if (
        !isProcessing.current &&
        (moyasarInvoiceId || orderId || tamaraOrderId || tabbyPaymentId)
      ) {
        console.log("⏱️ [PAYMENT_TRACKING] Polling timer started (every 4000ms)...");
        pollingTimerRef.current = setInterval(() => {
          verifyPaymentOnServer();
        }, 4000);
      } else {
        console.warn(
          "⚠️ [PAYMENT_TRACKING] Polling NOT started because identifiers are missing!",
          { moyasarInvoiceId, orderId, tamaraOrderId, tabbyPaymentId }
        );
      }
    }, 4000);

    return () => {
      clearTimeout(initialTimeout);
      stopPolling();
    };
  }, [moyasarInvoiceId, orderId, tamaraOrderId, tabbyPaymentId]);

  const handleBackPress = () => {
    if (isProcessing.current || paymentStatus === "success") {
      router.replace("/orders");
      return;
    }

    Alert.alert(
      t("payment.cancel_title", "إلغاء عملية الدفع"),
      t(
        "payment.cancel_confirm_msg",
        "هل أنت متأكد من رغبتك في إلغاء عملية الدفع والرجوع إلى الشاشة السابقة؟"
      ),
      [
        {
          text: t("payment.continue_paying", "متابعة الدفع"),
          style: "cancel",
        },
        {
          text: t("payment.confirm_cancel", "نعم، إلغاء والرجوع"),
          style: "destructive",
          onPress: () => {
            stopPolling();
            router.back();
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      setLoading(true);
      webViewRef.current.reload();
    }
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={24}
              color="#1E293B"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("payment.header_title", "بوابة الدفع")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text style={styles.stateTitle}>{t("payment.link_not_found", "رابط الدفع غير متوفر")}</Text>
          <Text style={styles.stateSubtitle}>
            {t("payment.link_error_desc", "تعذر بدء جلسة الدفع لعدم توفر رابط صالح من المزود.")}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>{t("payment.back_to_orders", "الرجوع للطلبات")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePaymentSuccess = async (paymentId) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    stopPolling();

    console.log(
      "🎉 [MOYASAR_TRACKING] handlePaymentSuccess Invoked:\n" +
        JSON.stringify(
          {
            event: "PAYMENT_SUCCESS_TRIGGERED",
            paymentId,
            orderId,
            invoiceId,
            moyasarInvoiceId,
            gateway,
            isRenewal,
            contractId,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    setPaymentStatus("success");
    setMessage(t("payment.success_msg", "تمت عملية الدفع بنجاح! جاري تأكيد وتحديث الطلب..."));

    try {
      if (isRenewal === "true" || isRenewal === true) {
        console.log("🔄 تجديد العقد جاري...");
        try {
          const res = await renewContract(i18n.language, {
            contractId: contractId,
            newStartDate: startDate,
          });
          console.log("✅ نتيجة التجديد:\n", JSON.stringify(res, null, 2));
        } catch (renewErr) {
          console.error("❌ خطأ في تجديد العقد:\n", JSON.stringify(renewErr?.response?.data || { message: renewErr.message }, null, 2));
        }
      }

      setTimeout(() => {
        router.replace({
          pathname: "/orders",
          params: { paymentSuccess: "true", orderId: orderId },
        });
      }, 2500);
    } catch (e) {
      console.error("General Success Handling Error:\n", JSON.stringify({ message: e.message }, null, 2));
      setTimeout(() => {
        router.replace("/orders");
      }, 2500);
    }
  };

  const handlePaymentFailure = (reason = "") => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    stopPolling();

    console.warn(
      "🚫 [MOYASAR_TRACKING] handlePaymentFailure Invoked:\n" +
        JSON.stringify(
          {
            event: "PAYMENT_FAILURE_TRIGGERED",
            reason,
            orderId,
            invoiceId,
            moyasarInvoiceId,
            gateway,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    setPaymentStatus("failure");
    setMessage(
      reason || t("payment.failed_msg", "لم تكتمل عملية الدفع أو تم إلغاؤها من قبلك.")
    );

    setTimeout(() => {
      isProcessing.current = false;
      router.back();
    }, 3000);
  };

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    if (!url) return;

    let parsedParams = {};
    let urlPathname = "";
    try {
      const urlObj = new URL(url);
      urlPathname = urlObj.pathname;
      urlObj.searchParams.forEach((value, key) => {
        parsedParams[key] = value;
      });
    } catch {
      // url may be custom scheme or relative
    }

    const lowerUrl = url.toLowerCase();

    const isSuccessRedirect =
      lowerUrl.includes("paymentsuccess=true") ||
      lowerUrl.includes("status=success") ||
      lowerUrl.includes("status=paid") ||
      lowerUrl.includes("payment/success") ||
      lowerUrl.includes("success=true") ||
      lowerUrl.includes("resultcode=paid") ||
      lowerUrl.includes("result=success") ||
      lowerUrl.includes("transactionstatus=success");

    const isCancelRedirect =
      lowerUrl.includes("paymentsuccess=false") ||
      lowerUrl.includes("status=cancel") ||
      lowerUrl.includes("payment/cancel") ||
      lowerUrl.includes("status=failed") ||
      lowerUrl.includes("payment/failure") ||
      lowerUrl.includes("result=canceled") ||
      lowerUrl.includes("result=failed") ||
      lowerUrl.includes("status=error");

    const extractedPaymentId =
      parsedParams["paymentId"] ||
      parsedParams["PaymentId"] ||
      parsedParams["id"] ||
      null;

    console.log(
      "🌐 [MOYASAR_TRACKING] WebView Navigation Change:\n" +
        JSON.stringify(
          {
            event: "WEBVIEW_NAVIGATION",
            url,
            pathname: urlPathname,
            queryParams: parsedParams,
            flags: {
              isSuccessRedirect,
              isCancelRedirect,
              isProcessing: isProcessing.current,
              currentPaymentStatus: paymentStatus,
            },
            extractedPaymentId,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    if (isSuccessRedirect && !isProcessing.current) {
      console.log("🎯 [MOYASAR_TRACKING] Matched Success Redirect pattern. Verifying with server...");
      try {
        if (gateway === "MyFatoorah" && extractedPaymentId) {
          const res = await getFatoorahPaymentStatus(i18n.language, extractedPaymentId);
          if (res?.success === 1 || res?.IsSuccess === true || res?.data?.InvoiceStatus === "Paid") {
            handlePaymentSuccess(extractedPaymentId);
            return;
          }
        }

        // Verify with server before completing
        const verified = await verifyPaymentOnServer(extractedPaymentId);
        console.log(
          "⚖️ [MOYASAR_TRACKING] Server Verification Result after redirect:\n" +
            JSON.stringify(
              {
                extractedPaymentId,
                verifiedByServer: verified,
                action: verified
                  ? "PAYMENT_CONFIRMED"
                  : "NOT_CONFIRMED_YET_CONTINUE_POLLING",
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )
        );

        if (!verified) {
          console.warn(
            "⚠️ [MOYASAR_TRACKING] Server check has not succeeded yet. Polling will continue in background."
          );
        }
      } catch (redirectErr) {
        console.error(
          "❌ [MOYASAR_TRACKING] Exception in redirect handler:\n" +
            JSON.stringify(
              {
                error: redirectErr.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )
        );
      }
    } else if (isCancelRedirect && !isProcessing.current) {
      console.warn("🚫 [MOYASAR_TRACKING] Matched Cancel Redirect pattern.");
      handlePaymentFailure(parsedParams["message"] || "");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View style={[styles.header, { flexDirection: RTL.rowDir() }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={24}
            color="#1E293B"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("payment.header_title", "بوابة الدفع الآمنة")}</Text>
          <View style={styles.sslBadge}>
            <MaterialCommunityIcons name="lock" size={11} color="#16A34A" />
            <Text style={styles.sslText}>{t("payment.ssl_secure", "اتصال مشفر 256-bit")}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Main WebView or Feedback Overlays */}
      <View style={styles.webviewWrapper}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={[
            styles.webview,
            paymentStatus === "success" && { opacity: 0, height: 0 },
          ]}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url || "";
            const lowerUrl = url.toLowerCase();

            // اعتراض فوري لأي رابط إعادة توجيه (سواء نجاح أو فشل أو callback)
            if (
              lowerUrl.includes("mobile-payment-redirect") ||
              lowerUrl.includes("fanalfisal://") ||
              lowerUrl.includes("paymentsuccess=true") ||
              lowerUrl.includes("status=cancel")
            ) {
              console.log("🛑 [PAYMENT_INTERCEPT] Intercepted redirect URL, preventing network load:\n", url);
              handleNavigationStateChange(request);
              return false; // منع المتصفح من إرسال طلب HTTP لسيرفر الويب لتفادي 404
            }
            return true;
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            // تجاهل أخطاء روابط الـ callback إذا كانت العملية قد نجحت
            if (
              nativeEvent.url?.toLowerCase().includes("mobile-payment-redirect") ||
              paymentStatus === "success" ||
              isProcessing.current
            ) {
              return;
            }
            console.error(
              "❌ [MOYASAR_TRACKING] WebView Native Error:\n" +
                JSON.stringify(
                  {
                    code: nativeEvent.code,
                    description: nativeEvent.description,
                    url: nativeEvent.url,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )
            );
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            // تجاهل خطأ 404 لروابط التوجيه لأنها مجرد إشارات اعتراض للتطبيق
            if (
              nativeEvent.url?.toLowerCase().includes("mobile-payment-redirect") ||
              paymentStatus === "success" ||
              isProcessing.current
            ) {
              return;
            }
            console.error(
              "❌ [MOYASAR_TRACKING] WebView HTTP Error:\n" +
                JSON.stringify(
                  {
                    statusCode: nativeEvent.statusCode,
                    description: nativeEvent.description,
                    url: nativeEvent.url,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )
            );
          }}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#002E5A" />
              <Text style={styles.loadingOverlayText}>
                {t("payment.loading_gateway", "جاري تحميل بوابة الدفع...")}
              </Text>
            </View>
          )}
        />

        {/* State Banners on Transaction Completion */}
        {paymentStatus === "success" && (
          <View style={styles.statusOverlay}>
            <View style={styles.successCircle}>
              <MaterialCommunityIcons name="check-bold" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.statusTitle}>
              {t("payment.success_title", "تم الدفع بنجاح!")}
            </Text>
            <Text style={styles.statusMsg}>{message}</Text>
            <ActivityIndicator size="small" color="#16A34A" style={{ marginTop: 16 }} />
          </View>
        )}

        {paymentStatus === "failure" && (
          <View style={styles.statusOverlay}>
            <View style={styles.failureCircle}>
              <MaterialCommunityIcons name="close-thick" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.statusTitle, { color: "#DC2626" }]}>
              {t("payment.failed_title", "تعذر إتمام الدفع")}
            </Text>
            <Text style={styles.statusMsg}>{message}</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#DC2626", marginTop: 20 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryBtnText}>{t("common.back", "الرجوع للمحاولة مجدداً")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlashMessage position="top" />
    </SafeAreaView>
  );
};

export default PaymentWebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#0F172A",
  },
  sslBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  sslText: {
    fontSize: 10,
    color: "#16A34A",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  webviewWrapper: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10,
  },
  loadingOverlayText: {
    marginTop: 14,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    zIndex: 20,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  failureCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  statusMsg: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Cairo",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  stateTitle: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#0F172A",
    marginTop: 16,
  },
  stateSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: "#002E5A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "CairoBold",
  },
});
