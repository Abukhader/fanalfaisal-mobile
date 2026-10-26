import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RTL } from "../../utils/rtlHelper";
import AreaSelectionModal from "./AreaSelectionModal";

const OrderModal = ({
  isModalVisible,
  setModalVisible,
  serviceType,
  isRenewal = false,
  visaNumber,
  setVisaNumber,
  startDate,
  setStartDate,
  hourlyDateTime,
  setHourlyDateTime,
  handleSubmitOrder,
  isSubmitting,
  prices = [],
  deliveryAreas = [],
  originalHours,
  monthsCount,
  setMonthsCount,
  baseWorkerPrice,
}) => {
  const { t, i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [hasDeliveryOption, setHasDeliveryOption] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isAreaModalVisible, setAreaModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const safeServiceType = serviceType?.toLowerCase() || "";
  const isHourlyService =
    safeServiceType.includes("ساعة") || safeServiceType.includes("hourly");
  const isMonthlyService =
    safeServiceType.includes("شهري") || safeServiceType.includes("monthly");
  const isRecruitment =
    safeServiceType.includes("توسط") ||
    safeServiceType.includes("تعاقد") ||
    safeServiceType.includes("mediation") ||
    safeServiceType.includes("contract");

  const currentLocale = i18n.language === "ar" ? "ar-EG" : "en-US";

  useEffect(() => {
    if (isModalVisible && prices.length > 0) {
      const defaultIdx = prices.findIndex((p) => p.isDefault);
      setSelectedPlanIndex(defaultIdx !== -1 ? defaultIdx : 0);
    }
  }, [isModalVisible, prices]);

  const handleShowPicker = () => {
    if (Platform.OS === "ios") {
      setModalVisible(false);
    }
    if (isMonthlyService) {
      setTempDate(startDate || new Date());
    } else if (isHourlyService) {
      setTempDate(hourlyDateTime || new Date());
    }
    setShowPicker(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowPicker(false);
    setPickerMode("date");
    setHasDeliveryOption(false);
    setSelectedArea(null);
    setAreaModalVisible(false);
    setSearchQuery("");
  };

  const onConfirmPicker = () => {
    if (isMonthlyService) {
      setStartDate(tempDate);
    } else if (isHourlyService) {
      if (pickerMode === "date") {
        setHourlyDateTime(tempDate);
        setPickerMode("time");
        return;
      } else {
        const finalDateTime = new Date(hourlyDateTime);
        finalDateTime.setHours(tempDate.getHours());
        finalDateTime.setMinutes(tempDate.getMinutes());
        setHourlyDateTime(finalDateTime);
      }
    }
    setShowPicker(false);
    setModalVisible(true);
  };

  const onDateTimeSelected = (event, selectedValue) => {
    setShowPicker(false);
    if (event.type === "dismissed") return;

    if (selectedValue) {
      if (isMonthlyService) {
        setStartDate(selectedValue);
      } else if (isHourlyService) {
        if (pickerMode === "date") {
          setHourlyDateTime(selectedValue);
          setTempDate(selectedValue);
          setPickerMode("time");
          setTimeout(() => setShowPicker(true), 100);
        } else {
          const baseDate = tempDate || hourlyDateTime || new Date();
          const finalDateTime = new Date(baseDate);
          finalDateTime.setHours(selectedValue.getHours());
          finalDateTime.setMinutes(selectedValue.getMinutes());
          setHourlyDateTime(finalDateTime);
          setPickerMode("date");
        }
      }
    }
  };

  const getCalculatedMonthlyEndDate = () => {
    if (!startDate) return "";
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setMonth(
      calculatedEndDate.getMonth() + Number(monthsCount || 1)
    );
    return calculatedEndDate.toLocaleDateString(currentLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCalculatedHourlyEndTimeDisplay = () => {
    if (!hourlyDateTime) return "";
    const currentHours =
      prices && prices.length > 0
        ? prices[selectedPlanIndex]?.hours || 8
        : originalHours || 8;
    const calculatedEndDate = new Date(hourlyDateTime);
    calculatedEndDate.setHours(calculatedEndDate.getHours() + currentHours);
    return calculatedEndDate.toLocaleTimeString(currentLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModalTitle = () => {
    if (isRenewal) {
      return isHourlyService
        ? t("order_modal.title_renewal_hourly")
        : t("order_modal.title_renewal_monthly");
    }
    if (isRecruitment) return t("order_modal.title_visa");
    if (isMonthlyService) return t("order_modal.title_monthly");
    if (isHourlyService) return t("order_modal.title_hourly");
    return "";
  };

  let isTimeInvalid = false;
  let maxStartHour = 14;
  let selectedHours = 8;

  if (isHourlyService && hourlyDateTime) {
    selectedHours =
      prices && prices.length > 0
        ? prices[selectedPlanIndex]?.hours || 8
        : originalHours || 8;

    const hour = hourlyDateTime.getHours();
    const minute = hourlyDateTime.getMinutes();

    // ✨ تحديث شرط الباقات الطويلة (12 ساعة فأكثر) لتكون أكثر مرونة
    if (selectedHours >= 12) {
      // السماح بأوقات الدوام الرسمية فقط (من 8 صباحاً حتى 10 مساءً)
      if (hour < 8 || hour > 21) {
        isTimeInvalid = true;
      }
    } else {
      maxStartHour = 22 - selectedHours;
      if (
        hour < 8 ||
        hour > maxStartHour ||
        (hour === maxStartHour && minute > 0)
      ) {
        isTimeInvalid = true;
      }
    }
  }

  const getCalculatedTotalCost = () => {
    let basePrice = 0;
    if (isHourlyService && prices.length > 0) {
      basePrice = prices[selectedPlanIndex]?.price || 0;
    } else if (isMonthlyService) {
      const singlePrice = prices[0]?.price || baseWorkerPrice || 0;
      basePrice = Number(singlePrice) * Number(monthsCount || 1);
    } else {
      basePrice = prices[0]?.price || baseWorkerPrice || 0;
    }

    const deliveryFee =
      hasDeliveryOption && selectedArea
        ? Number(selectedArea.deliveryFee || 0)
        : 0;

    return Number(basePrice) + deliveryFee;
  };

  const totalCost = getCalculatedTotalCost();

  const isMissingRequiredInput =
    (isRecruitment && (!visaNumber || visaNumber.length < 10)) ||
    (isMonthlyService && !startDate) ||
    (isHourlyService && !hourlyDateTime);

  const onFinalSubmit = () => {
    const safeSelectedPlan = prices[selectedPlanIndex] || prices[0] || null;
    handleSubmitOrder(
      hasDeliveryOption,
      safeSelectedPlan?.price,
      safeSelectedPlan?.id,
      selectedArea
    );
  };

  return (
    <>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>

            <ScrollView
              style={{ width: "100%" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {/* --- حالة التعاقد الجديد (رقم التأشيرة) --- */}
              {isRecruitment && (
                <View
                  style={[
                    styles.visaInputWrapper,
                    { flexDirection: "row", direction: "ltr" },
                  ]}
                >
                  <View
                    style={[
                      styles.prefixContainer,
                      { borderRightWidth: 1, borderRightColor: "#ddd" },
                    ]}
                  >
                    <Text style={styles.prefixText}>190</Text>
                  </View>
                  <TextInput
                    style={[styles.visaInput, { textAlign: "left" }]}
                    placeholder={t("order_modal.visa_placeholder")}
                    placeholderTextColor="#999"
                    value={visaNumber ? visaNumber.substring(3) : ""}
                    onChangeText={(text) => {
                      const cleanText = text.replace(/\D/g, "");
                      setVisaNumber("190" + cleanText);
                    }}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                </View>
              )}

              {/* --- حالة الاستئجار الشهري --- */}
              {isMonthlyService && (
                <View style={{ width: "100%" }}>
                  <View
                    style={{
                      flexDirection: RTL.rowDir(),
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        marginEnd: RTL.isRTL ? 0 : 10,
                        marginStart: RTL.isRTL ? 10 : 0,
                      }}
                    >
                      <Text
                        style={[styles.label, { textAlign: RTL.textAlign() }]}
                      >
                        {t("order_modal.start_date")}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dateSelector,
                          { alignItems: RTL.flexAlign(), marginBottom: 0 },
                        ]}
                        onPress={() => {
                          setPickerMode("date");
                          handleShowPicker();
                        }}
                      >
                        <Text style={styles.dateText}>
                          {startDate
                            ? new Date(startDate).toLocaleDateString(
                                currentLocale,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : t("order_modal.select_date")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.label, { textAlign: RTL.textAlign() }]}
                      >
                        {t("order_modal.duration_months", "مدة العقد (أشهر)")}
                      </Text>
                      <View
                        style={[
                          styles.dateSelector,
                          { justifyContent: "center", marginBottom: 0 },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.dateText,
                            { textAlign: RTL.textAlign(), width: "100%" },
                          ]}
                          keyboardType="number-pad"
                          value={String(monthsCount)}
                          onChangeText={(text) => {
                            const val = parseInt(
                              text.replace(/[^0-9]/g, ""),
                              10
                            );
                            setMonthsCount(
                              isNaN(val) || val < 1 ? "1" : String(val)
                            );
                          }}
                          maxLength={2}
                        />
                      </View>
                    </View>
                  </View>

                  {startDate && (
                    <View style={styles.readOnlyContainer}>
                      <Text
                        style={[styles.label, { textAlign: RTL.textAlign() }]}
                      >
                        {t("order_modal.end_date_auto")}
                      </Text>
                      <View
                        style={[
                          styles.dateSelector,
                          styles.readOnlyInput,
                          { alignItems: RTL.flexAlign() },
                        ]}
                      >
                        <Text style={styles.readOnlyText}>
                          {getCalculatedMonthlyEndDate()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* --- حالة التأجير بالساعة --- */}
              {isHourlyService && (
                <View style={{ width: "100%" }}>
                  {prices && prices.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text
                        style={[styles.label, { textAlign: RTL.textAlign() }]}
                      >
                        {t(
                          "order_modal.select_duration_price",
                          "اختر المدة والسعر"
                        )}
                      </Text>
                      <View
                        style={[
                          styles.plansContainer,
                          { flexDirection: RTL.rowDir() },
                        ]}
                      >
                        {prices.map((plan, index) => {
                          const isSelected = selectedPlanIndex === index;
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.planBox,
                                isSelected && styles.planBoxSelected,
                              ]}
                              onPress={() => {
                                setSelectedPlanIndex(index);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.planHoursText,
                                  isSelected && styles.planTextSelected,
                                ]}
                              >
                                {plan.hours} {t("common.hours", "ساعات")}
                              </Text>
                              <Text
                                style={[
                                  styles.planPriceText,
                                  isSelected && styles.planTextSelected,
                                ]}
                              >
                                {plan.price} {t("common.currency")}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <Text style={[styles.label, { textAlign: RTL.textAlign() }]}>
                    {t("order_modal.start_datetime")}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateSelector,
                      { alignItems: RTL.flexAlign() },
                      isTimeInvalid
                        ? { borderColor: "#D32F2F", borderWidth: 1 }
                        : {},
                    ]}
                    onPress={() => {
                      setPickerMode("date");
                      handleShowPicker();
                    }}
                  >
                    <Text style={styles.dateText}>
                      {hourlyDateTime
                        ? new Date(hourlyDateTime).toLocaleString(
                            currentLocale,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : t("order_modal.select_datetime")}
                    </Text>
                  </TouchableOpacity>

                  {/* ✨ إظهار الخطأ المناسب بناءً على الباقة المختارة */}
                  {isTimeInvalid && (
                    <Text
                      style={[
                        styles.calculatedDateText,
                        {
                          color: "#D32F2F",
                          textAlign: RTL.textAlign(),
                          marginTop: -5,
                          marginBottom: 10,
                        },
                      ]}
                    >
                      {selectedHours >= 12
                        ? t(
                            "order_modal.time_range_error_long_shift",
                            "يجب أن تبدأ الخدمة بين 8 صباحاً و 10 مساءً"
                          )
                        : t("maid_details.alerts.time_range_error_dynamic", {
                            maxTime:
                              maxStartHour > 12
                                ? maxStartHour - 12
                                : maxStartHour,
                            hours: selectedHours,
                          })}
                    </Text>
                  )}

                  {hourlyDateTime && !isTimeInvalid && (
                    <Text
                      style={[
                        styles.calculatedDateText,
                        { textAlign: RTL.textAlign() },
                      ]}
                    >
                      {t("order_modal.estimated_end_time")}:{" "}
                      {getCalculatedHourlyEndTimeDisplay()}
                    </Text>
                  )}
                </View>
              )}

              <View
                style={[
                  styles.deliveryOptionContainer,
                  { flexDirection: RTL.rowDir() },
                ]}
              >
                <Text
                  style={[
                    styles.deliveryOptionText,
                    { textAlign: RTL.textAlign() },
                  ]}
                >
                  {t("order_modal.delivery_option", "إضافة خدمة التوصيل")}
                </Text>
                <Switch
                  trackColor={{ false: "#E2E8F0", true: "rgba(43, 155, 114, 0.4)" }}
                  thumbColor={hasDeliveryOption ? "#002E5A" : "#F1F5F9"}
                  onValueChange={setHasDeliveryOption}
                  value={hasDeliveryOption}
                />
              </View>

              {hasDeliveryOption &&
                deliveryAreas &&
                deliveryAreas.length > 0 && (
                  <View style={{ width: "100%", marginBottom: 15 }}>
                    <Text
                      style={[styles.label, { textAlign: RTL.textAlign() }]}
                    >
                      {t("order_modal.select_area", "اختر منطقة التوصيل")}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.dateSelector,
                        {
                          alignItems: RTL.flexAlign(),
                          justifyContent: "center",
                        },
                      ]}
                      onPress={() => {
                        if (Platform.OS === "ios") {
                          setModalVisible(false);
                        }
                        setSearchQuery("");
                        setAreaModalVisible(true);
                      }}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          { color: selectedArea ? "#002E5A" : "#888" },
                        ]}
                      >
                        {selectedArea
                          ? `${selectedArea.name} (${
                              selectedArea.deliveryFee || 0
                            } ${t("common.currency")})`
                          : t(
                              "order_modal.click_to_select_area",
                              "اضغط لاختيار المنطقة"
                            )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {totalCost > 0 && (
                <View
                  style={[
                    styles.totalCostContainer,
                    { flexDirection: RTL.rowDir() },
                  ]}
                >
                  <Text style={styles.totalCostLabel}>
                    {t("order_modal.total_cost", "الإجمالي:")}
                  </Text>
                  <Text style={styles.totalCostValue}>
                    {totalCost} {t("common.currency", "ر.س")}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  isSubmitting ||
                  isTimeInvalid ||
                  isMissingRequiredInput ||
                  (hasDeliveryOption && !selectedArea)
                    ? { backgroundColor: "rgba(148, 163, 184, 0.4)" }
                    : {},
                ]}
                onPress={onFinalSubmit}
                disabled={
                  isSubmitting ||
                  isTimeInvalid ||
                  isMissingRequiredInput ||
                  (hasDeliveryOption && !selectedArea)
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    {isRenewal
                      ? t("order_modal.confirm_renewal")
                      : t("order_modal.submit_order")}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={[styles.modalButtonText, { color: "#666" }]}>
                  {t("order_modal.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AreaSelectionModal
        visible={isAreaModalVisible}
        onClose={() => {
          setAreaModalVisible(false);
          if (Platform.OS === "ios") {
            setTimeout(() => {
              setModalVisible(true);
            }, 350);
          }
        }}
        deliveryAreas={deliveryAreas}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
      />

      {Platform.OS === "ios" && (
        <Modal transparent={true} animationType="fade" visible={showPicker}>
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerContent}>
              <View
                style={[
                  styles.iosPickerHeader,
                  { flexDirection: RTL.rowDir() },
                ]}
              >
                <TouchableOpacity onPress={onConfirmPicker}>
                  <Text style={styles.doneButtonText}>
                    {pickerMode === "date" && isHourlyService
                      ? t("order_modal.next")
                      : t("order_modal.done")}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="spinner"
                onChange={(e, val) => val && setTempDate(val)}
                style={styles.picker}
                textColor="black"
                locale={i18n.language === "ar" ? "ar" : "en"}
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          display="default"
          onChange={onDateTimeSelected}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 9, 21, 0.45)", // تعتيم زجاجي ناعم للخلفية
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.96)", // حاوية زجاجية ناصعة ومقروءة
    borderRadius: 24,
    padding: 24,
    width: "90%",
    alignItems: "center",
    elevation: 0, // إلغاء الظلال السوداء المزعجة تماماً
    shadowColor: "#2B9B72",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    maxHeight: "88%",
    flexShrink: 1,
    borderWidth: 1.2,
    borderColor: "rgba(43, 155, 114, 0.16)",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: "CairoBold",
    color: "#002E5A", // كحلي ملكي عريض
    textAlign: "center",
  },
  visaInputWrapper: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    width: "100%",
    height: 55,
    overflow: "hidden",
    marginBottom: 15,
  },
  prefixContainer: {
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  prefixText: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  visaInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 18,
    fontFamily: "Cairo",
    color: "#000",
  },
  label: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#64748B", // رمادي هادئ للعناوين
    marginBottom: 8,
    width: "100%",
  },
  dateSelector: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    height: 50,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  dateText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#333",
  },
  readOnlyInput: {
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    borderColor: "rgba(0, 46, 90, 0.05)",
  },
  readOnlyText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#888",
  },
  readOnlyContainer: {
    width: "100%",
    marginTop: 5,
  },
  deliveryOptionContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 46, 90, 0.06)",
    width: "100%",
  },
  deliveryOptionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#475569",
  },
  calculatedDateText: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#D32F2F",
    width: "100%",
    marginBottom: 15,
  },
  plansContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  planBox: {
    width: "48%",
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    marginBottom: 5,
  },
  planBoxSelected: {
    borderColor: "#2B9B72", // زمردي زمردي عند الاختيار
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    borderWidth: 1.5,
  },
  planHoursText: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#002E5A",
  },
  planPriceText: {
    fontFamily: "Cairo",
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  planTextSelected: {
    color: "#2B9B72",
  },
  totalCostContainer: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(43, 155, 114, 0.05)", // حاوية إجمالي بلون زمردي خفيف
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.15)",
  },
  totalCostLabel: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  totalCostValue: {
    fontSize: 17,
    fontFamily: "CairoBold",
    color: "#2B9B72",
  },
  buttonContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#2B9B72", // زر إرسال زمردي
  },
  cancelButton: {
    backgroundColor: "rgba(241, 245, 249, 0.8)", // زر إلغاء رمادي زجاجي خفيف
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  modalButtonText: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#fff",
  },
  iosPickerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosPickerContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  iosPickerHeader: {
    justifyContent: "flex-end",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  picker: {
    height: 250,
  },
  doneButtonText: {
    color: "#2B9B72",
    fontFamily: "CairoBold",
    fontSize: 16,
  },
});

export default OrderModal;
