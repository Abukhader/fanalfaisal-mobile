import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "expo-router/react-navigation";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import useNotifications from "../hooks/useNotifications";
import "../i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTL } from "../utils/rtlHelper";

const AppBar = ({ title, onNotificationPress }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const isRtl = i18n.language === "ar";
  const insets = useSafeAreaInsets();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (isFocused) {
      AsyncStorage.getItem("userData")
        .then((userDataString) => {
          if (!isMounted) return;
          if (userDataString) {
            const parsed = JSON.parse(userDataString);
            setIsLoggedIn(true);
            setUserData(parsed);
          } else {
            setIsLoggedIn(false);
            setUserData(null);
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error("Error fetching user data in AppBar:", error);
          setIsLoggedIn(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const { unreadCount } = useNotifications(i18n.language, userData?.id, isFocused ? 1 : 0);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
      return;
    }
    if (isLoggedIn) {
      router.push("/notifications");
    } else {
      router.push("/LoginPromptPage");
    }
  };

  const handleLogoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      router.navigate("/");
    } catch {
      try {
        router.replace("/");
      } catch {
        router.push("/");
      }
    }
  };

  // تفادي شريط الحالة ديناميكياً لتجنب التداخل باستخدام Safe Area
  const paddingTopVal = Platform.OS === "ios"
    ? (insets.top > 0 ? insets.top + 8 : 20)
    : (insets.top > 0 ? insets.top + 8 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 36));

  return (
    <View style={[styles.headerRow, { paddingTop: paddingTopVal, flexDirection: RTL.rowDir() }]}>
      {/* 1. الجزء الجانبي (يسار في LTR / يمين في RTL): الترحيب بالمستخدم */}
      <View style={[styles.leftContainer, { alignItems: RTL.flexAlign() }]}>
        {!title && (
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeSub, { textAlign: RTL.textAlign() }]}>
              {isRtl ? "مرحباً بك،" : "Welcome,"}
            </Text>
            <Text
              style={[styles.welcomeName, { textAlign: RTL.textAlign() }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userData?.name || t("more.guest")}
            </Text>
          </View>
        )}
      </View>

      {/* 2. الجزء الأوسط المرتفع بالـ zIndex: شعار العلامة التجارية أو عنوان الشاشة القابل للنقر */}
      <View
        style={[
          styles.centerContainer,
          { paddingTop: paddingTopVal, paddingBottom: 8 }
        ]}
        pointerEvents="box-none"
      >
        {title ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogoPress}
            style={styles.logoTouchArea}
            hitSlop={{ top: 15, bottom: 15, left: 20, right: 20 }}
          >
            <Text style={styles.screenTitle}>{title}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogoPress}
            style={styles.logoTouchArea}
            hitSlop={{ top: 15, bottom: 15, left: 30, right: 30 }}
          >
            <Image
              source={require("../assets/images/Fan-alfaisal-removebg-preview-.png")}
              style={styles.logoImage}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. الجزء الجانبي الآخر (يمين في LTR / يسار في RTL): زر التنبيهات */}
      <View style={[styles.rightContainer, { alignItems: RTL.isRTL ? "flex-start" : "flex-end" }]}>
        <TouchableOpacity
          onPress={handleNotificationPress}
          activeOpacity={0.8}
          style={styles.notificationIconWrapper}
        >
          <Icon name="notifications-none" size={24} color="#002E5A" />
          {unreadCount > 0 && (
            <View
              style={[
                styles.notificationBadge,
                RTL.select({ right: -2 }, { left: -2 }),
              ]}
            >
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    width: "100%",
    backgroundColor: "transparent",
    position: "relative",
    zIndex: 1,
  },
  leftContainer: {
    minWidth: 80,
    maxWidth: 130,
    justifyContent: "center",
    zIndex: 5,
  },
  centerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  logoTouchArea: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContainer: {
    minWidth: 80,
    maxWidth: 90,
    justifyContent: "center",
    zIndex: 5,
  },
  logoImage: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  welcomeContainer: {
    justifyContent: "center",
    maxWidth: 120,
  },
  welcomeSub: {
    fontSize: 10,
    fontFamily: "Cairo",
    color: "#64748B",
  },
  welcomeName: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginTop: -2,
  },
  screenTitle: {
    fontSize: 17,
    fontFamily: "CairoBold",
    color: "#002E5A",
    textAlign: "center",
  },
  notificationIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    elevation: 0,
    shadowColor: "#002E5A",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    backgroundColor: "#2B9B72",
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "CairoBold",
  },
});

export default AppBar;
