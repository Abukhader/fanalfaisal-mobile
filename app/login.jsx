import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { RTL } from "../utils/rtlHelper";
import { UserLogin } from "./Api/clientAuth";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRtl = i18n.language === "ar";
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const logoTranslation = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // 1. Smooth Spring Entry Animation for the login card
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

    // 3. Gentle Breathing Loop for the background glowing orbs scale & opacity
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.08,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbOpacity, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 0.7,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const handleOTP = async () => {
    if (!phoneNumber) {
      showMessage({
        message: t("common.error"),
        description: t("login.err_phone_required"),
        type: "danger",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Smart Phone Number Normalization to "05xxxxxxxx"
      let normalizedPhone = phoneNumber.replace(/\D/g, ""); // Clean all non-digits
      if (normalizedPhone.startsWith("966")) {
        normalizedPhone = "0" + normalizedPhone.substring(3);
      } else if (normalizedPhone.startsWith("5")) {
        normalizedPhone = "0" + normalizedPhone;
      }

      // Validate Saudi Mobile Format (Must be exactly 10 digits starting with 05)
      if (!normalizedPhone.startsWith("05") || normalizedPhone.length !== 10) {
        showMessage({
          message: t("common.error"),
          description: isRtl 
            ? "يرجى إدخال رقم جوال سعودي صحيح (مثال: 05xxxxxxxx)"
            : "Please enter a valid Saudi mobile number (e.g., 05xxxxxxxx)",
          type: "danger",
        });
        setIsLoading(false);
        return;
      }

      const deletedAccountsString = await AsyncStorage.getItem("deletedAccounts");
      const deletedAccounts = deletedAccountsString
        ? JSON.parse(deletedAccountsString)
        : [];
      const cleanedDeletedAccounts = deletedAccounts.map((account) =>
        account.replace(/\D/g, "")
      );

      if (cleanedDeletedAccounts.includes(normalizedPhone)) {
        showMessage({
          message: t("common.error"),
          description: t("login.err_account_not_found"),
          type: "danger",
        });
        setIsLoading(false);
        return;
      }

      const response = await UserLogin(i18n.language, normalizedPhone);

      if (response && response.success === 1) {
        const apiData = response.data;
        await AsyncStorage.setItem("userPhone", normalizedPhone);
        if (apiData) {
          await AsyncStorage.setItem("tempUserData", JSON.stringify(apiData));
        }
        showMessage({
          message: t("common.success"),
          description: response.message || t("login.success_otp"),
          type: "success",
        });
        router.push("/otp");
      } else {
        showMessage({
          message: t("common.error"),
          description: response?.message || t("login.err_account_not_found"),
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage({
        message: t("common.error"),
        description: t("login.err_connection"),
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Interpolate orb opacity dynamically for subtle ambient pastel glow (light luxury theme)
  const orb1Opacity = orbOpacity.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.05, 0.09],
  });
  const orb2Opacity = orbOpacity.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.04, 0.07],
  });
  const orb3Opacity = orbOpacity.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.05, 0.08],
  });

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
            { transform: [{ scale: orbScale }], opacity: orb1Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.glowOrb,
            styles.orbSapphire,
            { transform: [{ scale: orbScale }], opacity: orb2Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.glowOrb,
            styles.orbNavy,
            { transform: [{ scale: orbScale }], opacity: orb3Opacity },
          ]}
        />

        {/* Floating Back Button (Clean card for light background) */}
        <TouchableOpacity
          onPress={() => router.push("/")}
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
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {/* Levitating Brand Logo Section */}
              <Animated.View
                style={[
                  styles.logoContainer,
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
                <Text style={styles.brandTitle}>فن الفيصل</Text>
                <Text style={styles.brandSubtitle}>
                  {i18n.language === "ar"
                    ? "بوابتك للحصول على أفضل الخدمات المنزلية"
                    : "Your gateway to premium domestic services"}
                </Text>
              </Animated.View>

              {/* Frosted Glassmorphic Form Card */}
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }],
                  },
                ]}
              >
                <View style={styles.formHeader}>
                  <Text style={[styles.loginTitle, { textAlign: RTL.textAlign() }]}>
                    {isRtl ? "مرحباً بك مجدداً" : "Welcome Back"}
                  </Text>
                  <Text style={[styles.loginSubtitle, { textAlign: RTL.textAlign() }]}>
                    {t("login.title")}
                  </Text>
                </View>

                {/* Premium Animated Translucent Phone Input (Clean with Phone icon) */}
                <GlassInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={t("login.phone_placeholder")}
                  leftIcon="phone"
                  keyboardType="phone-pad"
                  inputStyle={styles.phoneInputStyle}
                />

                {/* Premium Shimmering CTA Button */}
                <GlassButton
                  title={t("login.button")}
                  onPress={handleOTP}
                  loading={isLoading}
                  style={styles.submitButton}
                />

                {/* Signup Link Footer */}
                <View style={[styles.footerRow, { flexDirection: RTL.rowDir() }]}>
                  <Text style={styles.footerText}>
                    {t("login.no_account")}{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/signup")}>
                    <Text style={styles.signupLink}>{t("login.signup_link")}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
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
  contentWrapper: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  // Glowing Orbs Styles
  glowOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTeal: {
    top: -50,
    left: -50,
    width: 260,
    height: 260,
    backgroundColor: "#2B9B72",
  },
  orbSapphire: {
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    backgroundColor: "#00479E",
  },
  orbNavy: {
    top: "32%",
    right: -70,
    width: 280,
    height: 280,
    backgroundColor: "#38BDF8",
  },
  // Logo & Header Styles
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoRingWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoGlowRing: {
    position: "absolute",
    width: 114,
    height: 114,
    borderRadius: 57,
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
    width: 80,
    height: 80,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: "CairoBold",
    color: "#002E5A",
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  // Luxury White Form Card
  formCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#002E5A",
        shadowOpacity: 0.08,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formHeader: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 20,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
  },
  phoneInputStyle: {
    textAlign: "left",
  },
  submitButton: {
    marginTop: 10,
  },
  footerRow: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    gap: 4,
  },
  footerText: {
    fontFamily: "Cairo",
    fontSize: 13,
    color: "#64748B",
  },
  signupLink: {
    fontFamily: "CairoBold",
    fontSize: 13,
    color: "#2B9B72",
    textDecorationLine: "underline",
  },
});
