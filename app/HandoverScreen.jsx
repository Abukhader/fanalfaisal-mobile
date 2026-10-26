import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import AppBar from "../components/AppBar";
import { RTL } from "../utils/rtlHelper";
import {
  getHandoverTerms,
  requestHandoverOtp,
  acceptHandover,
} from "./Api/HandoverService";

const showAlert = (message, type = "info", title = "تنبيه") => {
  showMessage({
    message: title,
    description: String(message || ""),
    type: type,
    icon: type,
    duration: 4000,
  });
};

const HandoverScreen = () => {
  const params = useLocalSearchParams();
  const { orderId } = params;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Main State
  const [loading, setLoading] = useState(true);
  const [termsData, setTermsData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // OTP Modal State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const timerRef = useRef(null);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Fetch Handover Terms on load
  const fetchTerms = async () => {
    if (!orderId) {
      setErrorMsg(t("handover.order_id_missing", "معرف الطلب غير متوفر."));
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getHandoverTerms(i18n.language, orderId);
      console.log(
        "📜 [API Response] Handover GetTerms JSON:\n",
        JSON.stringify(res, null, 2)
      );

      if (res && res.success === 1) {
        setTermsData(res.data);
      } else {
        const msg = res?.message || t("handover.fetch_failed", "فشل جلب تفاصيل إقرار الاستلام.");
        setErrorMsg(msg);
        showAlert(msg, "danger", t("common.error", "خطأ"));
      }
    } catch (err) {
      console.error(
        "❌ [API Error] Handover GetTerms Error JSON:\n",
        JSON.stringify(err?.response?.data || { error: err.message }, null, 2)
      );
      const msg = err?.response?.data?.message || t("handover.connection_error", "حدث خطأ بالاتصال أثناء تحميل الإقرار.");
      setErrorMsg(msg);
      showAlert(msg, "danger", t("common.error", "خطأ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [orderId, i18n.language]);

  // Countdown timer handler for OTP expiration
  useEffect(() => {
    if (otpModalVisible) {
      setTimerSeconds(600);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpModalVisible]);

  // Format seconds to mm:ss
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Request WhatsApp OTP from backend
  const handleRequestOtp = async () => {
    if (!agreed) {
      showAlert(
        t("handover.agree_first_prompt", "يرجى قراءة بنود الإقرار والموافقة عليها أولاً."),
        "warning",
        t("common.alert", "تنبيه")
      );
      return;
    }

    setOtpLoading(true);
    try {
      const res = await requestHandoverOtp(i18n.language, orderId);
      console.log("📲 [API Response] Request OTP:", res);

      if (res && res.success === 1) {
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpModalVisible(true);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
        showAlert(
          res.message || t("handover.otp_sent_success", "تم إرسال رمز التحقق إلى رقم واتساب الخاص بك بنجاح."),
          "success",
          t("common.success", "تم الإرسال")
        );
        setTimeout(() => {
          inputRefs[0]?.current?.focus();
        }, 300);
      } else {
        showAlert(
          res?.message || t("handover.otp_send_failed", "تعذر إرسال رمز التحقق."),
          "danger",
          t("common.error", "خطأ")
        );
      }
    } catch (err) {
      console.error("Request OTP error:", err);
      showAlert(
        err?.response?.data?.message || t("handover.connection_error", "حدث خطأ أثناء إرسال رمز التحقق."),
        "danger",
        t("common.error", "خطأ")
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle single digit input
  const handleOtpChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const newDigits = [...otpDigits];

    if (cleaned.length === 0) {
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    if (cleaned.length === 1) {
      newDigits[index] = cleaned;
      setOtpDigits(newDigits);
      if (index < 5) {
        inputRefs[index + 1]?.current?.focus();
      } else {
        // Last digit filled -> dismiss keyboard
        Keyboard.dismiss();
      }
      return;
    }

    // Pasted 6-digit OTP
    if (cleaned.length >= 6) {
      const pasted = cleaned.slice(0, 6).split("");
      setOtpDigits(pasted);
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        inputRefs[index - 1]?.current?.focus();
      }
    }
  };

  // Submit and verify OTP
  const handleSubmitOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) {
      showAlert(
        t("handover.enter_6_digits", "يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً."),
        "warning",
        t("common.alert", "تنبيه")
      );
      return;
    }

    setSubmittingOtp(true);
    try {
      const res = await acceptHandover(i18n.language, orderId, fullOtp);
      console.log("✅ [API Response] Accept Handover:", res);

      if (res && res.success === 1) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}

        setOtpModalVisible(false);
        showAlert(
          res.message || t("handover.confirmed_success", "تم توثيق وتأكيد إقرار استلام العاملة بنجاح."),
          "success",
          t("common.success", "تم التوثيق")
        );

        setTimeout(() => {
          router.replace({
            pathname: "/orders",
            params: { handoverSuccess: "true", orderId },
          });
        }, 2000);
      } else {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (e) {}
        showAlert(
          res?.message || t("handover.otp_invalid", "رمز التحقق غير صحيح أو منتهي الصلاحية."),
          "danger",
          t("common.error", "خطأ")
        );
      }
    } catch (err) {
      console.error("Accept handover error:", err);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
      showAlert(
        err?.response?.data?.message || t("handover.verify_error", "حدث خطأ أثناء التحقق من الرمز."),
        "danger",
        t("common.error", "خطأ")
      );
    } finally {
      setSubmittingOtp(false);
    }
  };

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
          {t("handover.header_title", "إقرار استلام عاملة")}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#002E5A" />
          <Text style={styles.loadingText}>
            {t("handover.loading_terms", "جاري تحميل تفاصيل وبنود إقرار الاستلام...")}
          </Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTerms}>
            <Text style={styles.retryBtnText}>{t("common.retry", "إعادة المحاولة")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconBox}>
              <MaterialCommunityIcons name="file-sign" size={28} color="#002E5A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {t("handover.banner_title", "نموذج توثيق استلام العاملة")}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {t("handover.banner_desc", "توثيق إلكتروني رسمي معتمد برمز تحقق عبر الواتساب")}
              </Text>
            </View>
          </View>

          {/* Parties & Order Information Box */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MaterialCommunityIcons name="shield-account" size={18} color="#002E5A" />
              <Text style={styles.infoCardHeaderTitle}>
                {t("handover.parties_info", "بيانات أطراف العقد والاستلام")}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t("handover.order_num", "رقم الطلب:")}</Text>
              <Text style={styles.infoValue}>#{termsData?.orderNum || orderId?.slice(0, 8)}</Text>
            </View>

            {termsData?.workerName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("handover.worker_name", "اسم العاملة:")}</Text>
                <Text style={styles.infoValue}>{termsData.workerName}</Text>
              </View>
            )}

            {termsData?.clientName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("handover.client_name", "اسم صاحب العمل:")}</Text>
                <Text style={styles.infoValue}>{termsData.clientName}</Text>
              </View>
            )}

            {termsData?.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("handover.registered_phone", "رقم الواتساب المسجل:")}</Text>
                <Text style={[styles.infoValue, { direction: "ltr" }]}>{termsData.phone}</Text>
              </View>
            )}
          </View>

          {/* Terms & Legal Text Box */}
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <MaterialCommunityIcons name="text-box-check-outline" size={18} color="#002E5A" />
              <Text style={styles.termsHeaderTitle}>
                {t("handover.terms_heading", "نص الإقرار والتعهد")}
              </Text>
            </View>

            <View style={styles.termsBody}>
              <Text style={styles.termsText}>
                {termsData?.termsText ||
                  t(
                    "handover.default_terms",
                    "أقر وأتعهد أنا صاحب العمل الموضح بياناتي أعلاه بأنني قد استلمت العاملة المذكورة أعلاه بحالة صحية جيدة وكاملة الأهلية، وأتعهد بتوفير بيئة عمل ملائمة وتسليمها رواتبها الشهرية في موعدها المحدد وفقاً للائحة عمال الخدمة المنزلية ومن في حكمهم الصادرة من وزارة الموارد البشرية والتنمية الاجتماعية."
                  )}
              </Text>
            </View>
          </View>

          {/* Acknowledgement Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkboxBox, agreed && styles.checkboxBoxActive]}>
              {agreed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>
              {t(
                "handover.agree_checkbox",
                "أوافق وأقر بصحة جميع البيانات وبنود الاستلام الواردة أعلاه وأطلب إرسال رمز التحقق."
              )}
            </Text>
          </TouchableOpacity>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[
              styles.requestOtpBtn,
              (!agreed || otpLoading) && styles.requestOtpBtnDisabled,
            ]}
            disabled={!agreed || otpLoading}
            onPress={handleRequestOtp}
            activeOpacity={0.9}
          >
            {otpLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FontAwesome5 name="whatsapp" size={20} color="#FFFFFF" style={{ marginHorizontal: 8 }} />
                <Text style={styles.requestOtpBtnText}>
                  {t("handover.request_otp_btn", "إرسال رمز التوثيق عبر واتساب")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* OTP Verification Modal */}
      <Modal
        visible={otpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setOtpModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.whatsappIconCircle}>
                <FontAwesome5 name="whatsapp" size={28} color="#25D366" />
              </View>
              <Text style={styles.modalTitle}>
                {t("handover.otp_modal_title", "تأكيد رمز التحقق (OTP)")}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t("handover.otp_modal_desc", "أدخل الرمز المكون من 6 أرقام المرسل عبر الواتساب إلى:")}
              </Text>
              <Text style={styles.modalPhoneText}>{termsData?.phone || ""}</Text>
            </View>

            {/* 6 Digit Input Cells */}
            <View style={styles.otpInputsContainer}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={inputRefs[idx]}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    focusedOtpIndex === idx ? styles.otpBoxFocused : null,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  onFocus={() => setFocusedOtpIndex(idx)}
                  keyboardType="number-pad"
                  maxLength={idx === 0 ? 6 : 1}
                  selectTextOnFocus
                  textAlign="center"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              ))}
            </View>

            {/* Quick Hide Keyboard Button for convenience */}
            <TouchableOpacity
              onPress={Keyboard.dismiss}
              style={styles.hideKeyboardBar}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="keyboard-close" size={18} color="#64748B" />
              <Text style={styles.hideKeyboardText}>
                {t("common.hide_keyboard", "إخفاء لوحة المفاتيح")}
              </Text>
            </TouchableOpacity>

            {/* Timer & Resend */}
            <View style={styles.timerRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
              <Text style={styles.timerText}>
                {timerSeconds > 0
                  ? `${t("handover.code_expires_in", "صلاحية الرمز:")} ${formatTimer(timerSeconds)}`
                  : t("handover.code_expired", "انتهت صلاحية الرمز")}
              </Text>
            </View>

            {timerSeconds === 0 && (
              <TouchableOpacity
                onPress={handleRequestOtp}
                disabled={otpLoading}
                style={styles.resendBtn}
              >
                <Text style={styles.resendBtnText}>
                  {t("handover.resend_code", "إعادة إرسال الرمز")}
                </Text>
              </TouchableOpacity>
            )}

            {/* Confirm & Cancel Buttons */}
            <TouchableOpacity
              style={[
                styles.confirmOtpBtn,
                (otpDigits.join("").length < 6 || submittingOtp) &&
                  styles.confirmOtpBtnDisabled,
              ]}
              disabled={otpDigits.join("").length < 6 || submittingOtp}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmitOtp();
              }}
              activeOpacity={0.9}
            >
              {submittingOtp ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginHorizontal: 6 }}
                  />
                  <Text style={styles.confirmOtpBtnText}>
                    {t("handover.confirm_and_sign", "تأكيد وتوقيع الإقرار")}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => {
                Keyboard.dismiss();
                setOtpModalVisible(false);
              }}
              disabled={submittingOtp}
            >
              <Text style={styles.closeModalBtnText}>{t("common.cancel", "إلغاء")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default HandoverScreen;

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
  centerBox: {
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0, 46, 90, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#0F172A",
  },
  bannerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoCardHeaderTitle: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  infoValue: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#1E293B",
  },
  termsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  termsHeaderTitle: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  termsBody: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  termsText: {
    fontSize: 12,
    color: "#334155",
    fontFamily: "Cairo",
    lineHeight: 22,
    textAlign: "justify",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxBoxActive: {
    backgroundColor: "#002E5A",
    borderColor: "#002E5A",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontFamily: "Cairo",
    lineHeight: 20,
  },
  requestOtpBtn: {
    backgroundColor: "#25D366",
    borderRadius: 16,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  requestOtpBtnDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  requestOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "CairoBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
    alignItems: "center",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  whatsappIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "CairoBold",
    color: "#0F172A",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
    textAlign: "center",
  },
  modalPhoneText: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginTop: 2,
    direction: "ltr",
  },
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    direction: "ltr",
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    fontSize: 20,
    fontFamily: "CairoBold",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: "#002E5A",
    backgroundColor: "#FFFFFF",
  },
  otpBoxFocused: {
    borderColor: "#002E5A",
    backgroundColor: "#FFFFFF",
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  hideKeyboardBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    marginBottom: 14,
  },
  hideKeyboardText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Cairo",
  },
  resendBtn: {
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontSize: 12,
    color: "#002E5A",
    fontFamily: "CairoBold",
  },
  confirmOtpBtn: {
    backgroundColor: "#002E5A",
    borderRadius: 16,
    height: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  confirmOtpBtnDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "CairoBold",
  },
  closeModalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeModalBtnText: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Cairo",
  },
});
