import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTL } from "../utils/rtlHelper";

/**
 * Global Real-time Floating Connectivity Banner
 * Displays automatically when connection is lost and auto-dismisses upon restoration
 */
const OfflineNotice = () => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [hasRecovered, setHasRecovered] = useState(false);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const wasOfflineRef = useRef(false);

  const isAr = i18n.language === "ar";

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be null initially, treat null as connected to prevent false alerts on launch
      const offline = state.isConnected === false || state.isInternetReachable === false;

      if (offline) {
        wasOfflineRef.current = true;
        setIsOffline(true);
        setHasRecovered(false);
        // Slide in
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }).start();
      } else {
        if (wasOfflineRef.current) {
          // Connection recovered!
          setHasRecovered(true);
          setIsOffline(false);
          // Show recovery green banner for 2.5s then slide out
          setTimeout(() => {
            Animated.timing(slideAnim, {
              toValue: -80,
              duration: 350,
              useNativeDriver: true,
            }).start(() => {
              setHasRecovered(false);
              wasOfflineRef.current = false;
            });
          }, 2500);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [slideAnim]);

  if (!isOffline && !hasRecovered) return null;

  const topInset =
    Platform.OS === "ios"
      ? insets.top + 6
      : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : insets.top + 8);

  const bgColor = hasRecovered ? "#16A34A" : "#EF4444";
  const iconName = hasRecovered ? "cloud-done" : "wifi-off";
  const messageText = hasRecovered
    ? (isAr ? "تم استعادة الاتصال بالإنترنت" : "Back online")
    : (isAr ? "لا يتوفر اتصال بالإنترنت، يرجى التحقق من الشبكة" : "No internet connection, please check network");

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          top: topInset,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.pill,
          { backgroundColor: bgColor, flexDirection: RTL.rowDir() },
        ]}
      >
        <Icon
          name={iconName}
          size={16}
          color="#FFFFFF"
          style={RTL.select({ marginLeft: 6 }, { marginRight: 6 })}
        />
        <Text style={styles.pillText} numberOfLines={1}>
          {messageText}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 99999,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    maxWidth: "96%",
  },
  pillText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 12,
  },
});

export default OfflineNotice;
