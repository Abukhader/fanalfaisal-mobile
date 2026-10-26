import { usePathname, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Dynamic safe area helper
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for auth guard
import { RTL } from "../utils/rtlHelper";

const CustomTabs = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isRtl = RTL.isRTL();
  const insets = useSafeAreaInsets();

  // Solve the Android virtual navigation inset bug:
  // On Android, always use a fixed, safe bottom float offset (12px).
  // On iOS, use the safe area inset bottom dynamically (it is 100% accurate on iOS).
  const tabBarBottom = Platform.OS === "ios" ? (insets.bottom > 0 ? insets.bottom : 12) : 12;

  // مصفوفة التبويبات الأساسية
  const tabs = [
    { nameKey: "tabs.contracts", icon: "description", route: "/contracts" },
    { nameKey: "tabs.orders", icon: "reorder", route: "/orders" },
    { nameKey: "tabs.home", icon: "home", route: "/" },
    { nameKey: "tabs.offers", icon: "local-offer", route: "/offers" },
    { nameKey: "tabs.more", icon: "menu", route: "/more" },
  ];

  // دالة الملاحة الذكية مع حارس المصادقة (Auth Guard) لحماية المسارات الحساسة
  const handleTabPress = async (route) => {
    const requiresAuth = route === "/contracts" || route === "/orders" || route === "/more";
    
    if (requiresAuth) {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const userToken = await AsyncStorage.getItem("userToken");
        if (userData && userToken) {
          router.push(route);
        } else {
          if (userData || userToken) {
            await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
          }
          router.push("/LoginPromptPage");
        }
      } catch (err) {
        router.push("/LoginPromptPage");
      }
    } else {
      router.push(route);
    }
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          flexDirection: RTL.rowDir(),
          bottom: tabBarBottom,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.route || (pathname === "/index" && tab.route === "/");
        const isHome = tab.route === "/";

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => {
              if (!isActive) {
                handleTabPress(tab.route);
              }
            }}
          >
            {isHome ? (
              /* زر القائمة الرئيسية الدائري الملون والمتوهج */
              <View style={styles.homeContainer}>
                <LinearGradient
                  colors={["#2B9B72", "#002E5A"]} // تدرج زمردي إلى كحلي
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.homeButton}
                >
                  <Icon name="home" size={26} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.tabText, styles.activeText, { marginTop: 5 }]}>
                  {t(tab.nameKey)}
                </Text>
              </View>
            ) : (
              /* التبويبات القياسية مع مؤشر النقطة المضيء */
              <View style={styles.iconContainer}>
                <Icon
                  name={tab.icon}
                  size={22}
                  color={isActive ? "#002E5A" : "#9CA3AF"} // كحلي نشط / رمادي خامل
                />
                <Text style={[styles.tabText, isActive && styles.activeText]}>
                  {t(tab.nameKey)}
                </Text>
                
                {/* نقطة مضيئة أسفل التبويب النشط لمنع القفز الحركي */}
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: isActive ? "#2B9B72" : "transparent" },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: "rgba(255, 255, 255, 0.94)", // Glassmorphic white
    borderRadius: 30, // Complete rounded capsule
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.8)", // Glowing white border
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    elevation: 10, // Strong Android shadow
    shadowColor: "#002E5A", // Rich brand-tinted shadow for iOS
    shadowOpacity: 0.12, // Deepened opacity for 3D float effect
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, // Cast shadow downwards and outwards
    height: 66,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  homeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26, // رفع الزر الدائري للأعلى قليلاً
  },
  homeButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 6,
    shadowColor: "#2B9B72",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingTop: 8,
  },
  tabText: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 3,
    fontFamily: "Cairo",
    textAlign: "center",
  },
  activeText: {
    color: "#002E5A",
    fontFamily: "CairoBold",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});

export default CustomTabs;
