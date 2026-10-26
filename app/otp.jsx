import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
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
import { validateOtp } from "./Api/clientAuth";
import GlassButton from "../components/ui/GlassButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function OtpScreen() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const logoTranslation = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getData = async () => {
      try {
        const storedPhone = await AsyncStorage.getItem("userPhone");
        if (storedPhone) {
          setPhoneNumber(storedPhone);
        } else {
          showMessage({
            message: t("common.error"),
            description: t("otp.err_phone"),
            type: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getData();

    // 1. Smooth Spring Entry Animation for the OTP card
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

    // 2. Slow Levitating Loop for the header logo
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
  }, []);

  const handleOtpChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      showMessage({
        message: t("common.error"),
        description: t("otp.err_incomplete"),
        type: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await validateOtp(i18n.language, phoneNumber, enteredOtp);

      if (response && response.success === 1) {
        const { client, token } = response.data;

        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(client));

        await AsyncStorage.removeItem("tempUserData");
        await AsyncStorage.removeItem("userOtp");
        await AsyncStorage.removeItem("userPhone");

        showMessage({
          message: t("common.success"),
          description: t("otp.success"),
          type: "success",
        });

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1000);
      } else {
        showMessage({
          message: t("common.error"),
          description: response?.message || t("otp.err_invalid"),
          type: "danger",
        });
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      showMessage({
        message: t("common.error"),
        description: t("otp.err_connection"),
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Floating Back Button */}
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
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {/* Levitating Brand Logo & Welcoming */}
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
                <Text style={styles.brandTitle}>تحقق الرمز</Text>
                
                {/* Visual badge for the target phone number */}
                <View style={[styles.phoneBadgeRow, { flexDirection: RTL.rowDir() }]}>
                  <Text style={styles.brandSubtitle}>
                    {isRtl
                      ? "أدخل رمز التحقق المكون من 6 أرقام المرسل إلى الرقم"
                      : "Enter the 6-digit verification code sent to"}
                  </Text>
                  {phoneNumber ? (
                    <View style={styles.phoneBadge}>
                      <Text style={styles.phoneBadgeText}>{phoneNumber}</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.View>

              {/* Frosted Glassmorphic Card Container */}
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }],
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { textAlign: RTL.textAlign() }]}>
                  {t("otp.title")}
                </Text>

                {/* 6 Digit Translucent OTP Input Row (Always Left-To-Right for numbers) */}
                <View style={[styles.inputContainer, { flexDirection: "row", direction: "ltr" }]}>
                  {otp.map((digit, index) => {
                    const isFocused = focusedIndex === index;
                    return (
                      <TextInput
                        key={index}
                        ref={inputRefs[index]}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        placeholder="-"
                        placeholderTextColor="#CBD5E1"
                        style={[
                          styles.digitInput,
                          isFocused && styles.digitInputFocused,
                          digit && styles.digitInputFilled,
                        ]}
                        onKeyPress={({ nativeEvent }) => {
                          if (
                            nativeEvent.key === "Backspace" &&
                            index > 0 &&
                            !otp[index]
                          ) {
                            inputRefs[index - 1].current?.focus();
                          }
                        }}
                      />
                    );
                  })}
                </View>

                {/* Verification Action Button */}
                <GlassButton
                  title={t("otp.button")}
                  onPress={handleVerifyOTP}
                  loading={isLoading}
                  style={styles.submitButton}
                />
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
  safeHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
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
    top: "32%",
    right: -70,
    width: 280,
    height: 280,
    backgroundColor: "#38BDF8",
    opacity: 0.05,
  },
  // Logo & Header Styles
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
    width: "100%",
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
    width: 116,
    height: 116,
    borderRadius: 58,
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
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  phoneBadgeRow: {
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#64748B",
    textAlign: "center",
  },
  phoneBadge: {
    backgroundColor: "#EDF7F4",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.3)",
  },
  phoneBadgeText: {
    fontFamily: "CairoBold",
    fontSize: 13,
    color: "#2B9B72",
  },
  // Frosted Luxury Form Card
  formCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
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
  cardTitle: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 6,
  },
  digitInput: {
    width: "14%",
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 20,
    color: "#002E5A",
    fontFamily: "CairoBold",
    ...Platform.select({
      ios: {
        shadowColor: "#002E5A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
    }),
  },
  digitInputFocused: {
    borderColor: "#2B9B72",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#2B9B72",
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    }),
  },
  digitInputFilled: {
    borderColor: "#2B9B72",
    backgroundColor: "#F0FDF4",
    color: "#002E5A",
  },
  submitButton: {
    width: "100%",
  },
});
