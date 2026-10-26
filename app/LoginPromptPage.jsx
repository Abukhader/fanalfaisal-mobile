import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppBar from "../components/AppBar";
import { RTL } from "../utils/rtlHelper";

const LoginPromptPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const isRtl = RTL.isRTL();

  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing ring pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pageContainer}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppBar onNotificationPress={() => router.push("/notifications")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.promptCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Animated concentric glowing lock illustration */}
          <View style={styles.iconWrapper}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            <LinearGradient
              colors={["#002E5A", "#00479E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerCircle}
            >
              <Icon name="vpn-key" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Heading and Subtitle */}
          <Text style={[styles.title, { textAlign: "center" }]}>
            {t("login_prompt.title")}
          </Text>
          
          <Text style={[styles.description, { textAlign: "center" }]}>
            {t("login_prompt.description")}
          </Text>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.loginButtonTouchable}
            onPress={() => router.push("/login")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#2B9B72", "#002E5A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Icon name="login" size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>
                {t("login_prompt.button")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Text style={styles.backHomeButtonText}>
              {isRtl ? "تصفح كزائر" : "Browse as Guest"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  promptCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 30,
    padding: 30,
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 4,
    shadowColor: "#002E5A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    alignItems: "center",
  },
  iconWrapper: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  pulseCircle: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.15)",
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#002E5A",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 22,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: "Cairo",
    color: "#64748B",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  spacer: {
    height: 24,
  },
  loginButtonTouchable: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    elevation: 3,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
    width: "100%",
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#FFFFFF",
  },
  backHomeButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    width: "100%",
  },
  backHomeButtonText: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#64748B",
  },
});

export default LoginPromptPage;
