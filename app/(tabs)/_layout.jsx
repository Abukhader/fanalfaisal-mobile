import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";
import CustomTabs from "../../components/CustomTabs";

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // ✨ تحديد إذا كانت اللغة الحالية هي العربية
  const isRTL = i18n.dir() === "rtl";

  const checkLoginAndNavigate = async (e, targetRoute) => {
    e.preventDefault();
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        router.push(targetRoute);
      } else {
        router.push("/LoginPromptPage");
      }
    } catch (err) {
      router.push("/LoginPromptPage");
    }
  };

  // المصفوفة ثابتة الترتيب المنطقي
  const tabsConfig = [
    {
      name: "contracts",
      title: t("tabs.contracts"),
      icon: "description",
      requiresAuth: true,
      route: "/contracts",
    },
    {
      name: "orders",
      title: t("tabs.orders"),
      icon: "assignment",
      requiresAuth: true,
      route: "/orders",
    },
    {
      name: "index",
      title: t("tabs.home"),
      icon: "home",
      isMain: true,
      route: "/",
    },
    {
      name: "offers",
      title: t("tabs.offers"),
      icon: "local-offer",
      route: "/offers",
    },
    {
      name: "more",
      title: t("tabs.more"),
      icon: "menu",
      requiresAuth: true,
      route: "/more",
    },
  ];

  return (
    <Tabs
      key={i18n.language}
      initialRouteName="index"
      tabBar={(props) => <CustomTabs />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {tabsConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}
