import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CityPickerModal from "../components/signupComponents/CityPickerModal";
import { RTL } from "../utils/rtlHelper";
import { GetCities } from "./Api/CityService";
import { addClient } from "./Api/clientAuth";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRtl = i18n.language === "ar";
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    phone: "",
    birthDate: "",
    nationality: "مواطن",
    city: "",
  });

  const [isCityModalVisible, setCityModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState(null);

  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const logoTranslation = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        setCitiesError(null);
        const fetchedCities = await GetCities(i18n.language);
        if (fetchedCities && Array.isArray(fetchedCities.data)) {
          setCities(fetchedCities.data);
        } else {
          setCitiesError(t("common.error_fetching_data"));
        }
      } catch (error) {
        setCitiesError(t("signup.err_connection"));
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();

    // 1. Smooth Spring Entry Animation for the form card
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Slow Levitating Loop for the brand logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoTranslation, {
          toValue: -6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Gentle Breathing Loop for the background glowing orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, {
          toValue: 1.06,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [i18n.language]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateValue;
    setShowDatePicker(Platform.OS === "ios");

    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    setDateValue(currentDate);
    const formattedDate = currentDate.toISOString().split("T")[0];
    handleChange("birthDate", formattedDate);

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const handleSignup = async () => {
    if (
      !form.name ||
      !form.phone ||
      !form.city ||
      !form.nationality ||
      !form.birthDate
    ) {
      showMessage({
        message: t("common.error"),
        description: t("signup.err_required", "يرجى تعبئة جميع الحقول المطلوبة"),
        type: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { city, ...restOfForm } = form;
      const newClientData = {
        ...restOfForm,
        cityId: city,
      };

      const response = await addClient(i18n.language, newClientData);

      if (response?.success) {
        setShowDatePicker(false);
        showMessage({
          message: t("common.success"),
          description: response.message || t("signup.success"),
          type: "success",
        });
        setTimeout(() => router.replace("/login"), 1500);
      } else {
        showMessage({
          message: t("common.error"),
          description: response?.message || t("signup.err_connection"),
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      showMessage({
        message: t("common.error"),
        description: t("signup.err_connection"),
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCityObj = cities.find((c) => c.id === form.city);
  const selectedCityName = selectedCityObj
    ? selectedCityObj.nameAr || selectedCityObj.name
    : t("signup.city_placeholder", "اختر المدينة");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Luxury light brand gradient background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* --- GLOWING BACKGROUND ORBS --- */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orbTeal,
          { transform: [{ scale: orbScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orbSapphire,
          { transform: [{ scale: orbScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orbNavy,
          { transform: [{ scale: orbScale }] },
        ]}
      />

      {/* Floating Back Button (To Login) */}
      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={[
          styles.backButton,
          isRtl ? { right: 20 } : { left: 20 },
          { position: "absolute", top: insets.top > 0 ? insets.top + 8 : 16, zIndex: 100 },
        ]}
      >
        <Icon
          name={RTL.select("arrow-forward", "arrow-back")}
          size={22}
          color="#002E5A"
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo and Welcome Header Section */}
            <Animated.View
              style={[
                styles.headerContainer,
                { transform: [{ translateY: logoTranslation }] },
              ]}
            >
              <View style={styles.logoRingWrapper}>
                <View style={styles.logoGlowRing} />
                <Image
                  source={require("../assets/images/Fan-alfaisal-removebg-preview-.png")}
                  style={styles.logo}
                  resizeMode="contain"
                  
                />
              </View>
              <Text style={styles.title}>
                {t("signup.title", "إنشاء حساب جديد")}
              </Text>
              <Text style={styles.subtitle}>
                {isRtl
                  ? "سجل معنا للاستفادة من خدمات التوسط الفورية"
                  : "Register with us to enjoy immediate mediation services"}
              </Text>
            </Animated.View>

            {/* Main Frosted Glass Form Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                },
              ]}
            >
              {/* Full Name Input */}
              <GlassInput
                label={t("signup.name_placeholder", "الاسم الكامل")}
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder={t("signup.name_placeholder", "الاسم الكامل")}
                leftIcon="person"
              />

              {/* National ID Input */}
              <GlassInput
                label={t("signup.id_placeholder", "رقم الهوية / الإقامة")}
                value={form.nationalId}
                onChangeText={(text) => handleChange("nationalId", text)}
                placeholder={t("signup.id_placeholder", "رقم الهوية / الإقامة")}
                leftIcon="badge"
                keyboardType="numeric"
                inputStyle={{ textAlign: "left" }}
              />

              {/* Phone Number Input */}
              <GlassInput
                label={t("signup.phone_placeholder", "رقم الجوال")}
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="05xxxxxxxx"
                leftIcon="phone"
                keyboardType="phone-pad"
                inputStyle={{ textAlign: "left" }}
              />

              {/* Birth Date Picker (Input lookalike) */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { textAlign: RTL.textAlign() }]}>
                  {t("signup.birthdate_placeholder", "تاريخ الميلاد")}
                </Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { flexDirection: RTL.rowDir() }]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowDatePicker(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="calendar-today" size={20} color="#2B9B72" />
                  <Text
                    style={[
                      styles.pickerText,
                      {
                        textAlign: RTL.textAlign(),
                        color: form.birthDate ? "#0F172A" : "#94A3B8",
                      },
                    ]}
                  >
                    {form.birthDate || t("signup.birthdate_placeholder", "تاريخ الميلاد")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* DatePicker Native Component */}
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Confirm birth date button for iOS */}
              {showDatePicker && Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.iosDateConfirm}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosDateConfirmText}>
                    {t("common.done", "تأكيد التاريخ")}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Citizen/Non-Citizen Segmented Controller */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { textAlign: RTL.textAlign() }]}>
                  {t("maid_card.nationality")}
                </Text>
                <View style={[styles.segmentedControl, { flexDirection: RTL.rowDir() }]}>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      form.nationality === "مواطن" && styles.segmentOptionActive,
                    ]}
                    onPress={() => handleChange("nationality", "مواطن")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        form.nationality === "مواطن" && styles.segmentTextActive,
                      ]}
                    >
                      {t("signup.citizen", "مواطن")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      form.nationality === "غير مواطن" && styles.segmentOptionActive,
                    ]}
                    onPress={() => handleChange("nationality", "غير مواطن")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        form.nationality === "غير مواطن" && styles.segmentTextActive,
                      ]}
                    >
                      {t("signup.non_citizen", "غير مواطن")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* City Picker Field */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { textAlign: RTL.textAlign() }]}>
                  {t("signup.city_placeholder", "المدينة")}
                </Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, { flexDirection: RTL.rowDir() }]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setCityModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  disabled={citiesLoading}
                >
                  <Icon name="location-city" size={20} color="#2B9B72" />
                  {citiesLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#2B9B72"
                      style={styles.pickerLoader}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          textAlign: RTL.textAlign(),
                          color: form.city ? "#0F172A" : "#94A3B8",
                          flex: 1,
                        },
                      ]}
                    >
                      {selectedCityName}
                    </Text>
                  )}
                  {!citiesLoading && (
                    <Icon name="keyboard-arrow-down" size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Premium Shimmering CTA Button */}
              <GlassButton
                title={t("signup.button", "إنشاء حساب")}
                onPress={handleSignup}
                loading={isLoading || citiesLoading}
                style={styles.submitButton}
              />
            </Animated.View>

            {/* Footer and Login Link */}
            <View style={[styles.footerRow, { flexDirection: RTL.rowDir() }]}>
              <Text style={styles.footerText}>
                {t("signup.have_account", "لديك حساب بالفعل؟")}{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginLink}>
                  {t("signup.login_link", "تسجيل الدخول")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <CityPickerModal
        visible={isCityModalVisible}
        onClose={() => setCityModalVisible(false)}
        cities={cities}
        onSelect={(cityId) => handleChange("city", cityId)}
        selectedCityId={form.city}
        t={t}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 60,
    paddingBottom: 40,
    justifyContent: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#002E5A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTeal: {
    top: -60,
    left: -60,
    width: 260,
    height: 260,
    backgroundColor: "#2B9B72",
    opacity: 0.06,
  },
  orbSapphire: {
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    backgroundColor: "#00479E",
    opacity: 0.04,
  },
  orbNavy: {
    top: "35%",
    right: -70,
    width: 260,
    height: 260,
    backgroundColor: "#38BDF8",
    opacity: 0.05,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoRingWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoGlowRing: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.2)",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#002E5A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 22,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  // Frosted Luxury Form Card
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#002E5A",
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pickerContainer: {
    marginBottom: 16,
    width: "100%",
  },
  pickerLabel: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 6,
  },
  pickerTrigger: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    alignItems: "center",
    gap: 10,
  },
  pickerText: {
    flex: 1,
    fontFamily: "Cairo",
    fontSize: 14,
  },
  pickerLoader: {
    alignSelf: "center",
  },
  iosDateConfirm: {
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 8,
  },
  iosDateConfirmText: {
    color: "#2B9B72",
    fontFamily: "CairoBold",
    fontSize: 15,
  },
  // Custom Segmented Control
  segmentedControl: {
    height: 54,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  segmentOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  segmentOptionActive: {
    backgroundColor: "#2B9B72",
    elevation: 3,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  segmentText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "CairoBold",
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
  },
  submitButton: {
    marginTop: 12,
    width: "100%",
  },
  footerRow: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    width: "100%",
    gap: 4,
  },
  footerText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#2B9B72",
    textDecorationLine: "underline",
  },
});
