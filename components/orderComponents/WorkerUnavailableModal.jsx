import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { RTL } from "../../utils/rtlHelper";

const WorkerUnavailableModal = ({
  visible,
  workerName,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRtl = i18n.language === "ar";

  if (!visible) return null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
  };

  const handleExploreOtherWorkers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onClose();
    router.push("/");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Decorative Glow Icon Badge */}
              <View style={styles.iconRingOuter}>
                <LinearGradient
                  colors={["#FEF2F2", "#FEE2E2"]}
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons
                    name="account-clock-outline"
                    size={36}
                    color="#DC2626"
                  />
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>
                {t("orders.unavailable_modal_title", "العاملة غير متاحة حالياً")}
              </Text>

              {/* Worker Tag if provided */}
              {workerName ? (
                <View
                  style={[
                    styles.workerPill,
                    { flexDirection: RTL.rowDir() },
                  ]}
                >
                  <Icon name="person" size={16} color="#002E5A" />
                  <Text style={styles.workerPillText} numberOfLines={1}>
                    {workerName}
                  </Text>
                </View>
              ) : null}

              {/* Detailed Polite Explanation */}
              <Text style={styles.modalDescription}>
                {isRtl
                  ? `نعتذر منك، تم حجز العاملة مؤخراً وأصبحت غير متاحة في هذا التوقيت. تم إيقاف عملية الدفع حرصاً على حسابك، يرجى اختيار عاملة بديلة.`
                  : `We apologize, this worker is currently booked or unavailable. Payment was prevented for your security, please choose an available worker.`}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* 1. Explore Other Workers Button */}
                <TouchableOpacity
                  onPress={handleExploreOtherWorkers}
                  activeOpacity={0.85}
                  style={styles.primaryBtnWrapper}
                >
                  <LinearGradient
                    colors={["#2B9B72", "#22805E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.primaryButton, { flexDirection: RTL.rowDir() }]}
                  >
                    <Icon
                      name="search"
                      size={20}
                      color="#FFFFFF"
                      style={RTL.select({ marginLeft: 6 }, { marginRight: 6 })}
                    />
                    <Text style={styles.primaryButtonText}>
                      {isRtl ? "تصفح الكوادر المتاحة" : "Browse Available Staff"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 2. Close Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {t("common.close", "إغلاق")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)", // Luxury Slate Dim
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  iconRingOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#FFE4E6",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  workerPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  workerPillText: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  modalDescription: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  primaryBtnWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryButton: {
    width: "100%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "CairoBold",
  },
  secondaryButton: {
    width: "100%",
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  secondaryButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontFamily: "CairoBold",
  },
});

export default WorkerUnavailableModal;
