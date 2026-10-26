import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // ✨ استيراد الترجمة
import { StyleSheet, View } from "react-native";

import AppBar from "@/components/AppBar";
import CustomTabs from "@/components/CustomTabs";
import CleaningServicesList from "../components/cleaningServicesComponents/CleaningServicesList";
import FilterDrawer from "../components/recruitmentComponents/FilterDrawer";
import RecruitmentBanner from "../components/recruitmentComponents/RecruitmentBanner";
// ✨ استيراد الهيلبر
import { RTL } from "../utils/rtlHelper";

const Cleaning = () => {
  const { t } = useTranslation(); // ✨ استخدام تابع الترجمة
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [filters, setFilters] = useState({
    nationality: "",
    religion: "",
    age: "",
    experience: "",
  });

  const handleApplyFilters = () => {
    setDrawerVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* شريط العلو: يدعم التبديل اليدوي داخلياً */}
      <AppBar
        onNotificationPress={() => console.log("Notifications Pressed")}
      />

      {/* البانر: نمرر النصوص المترجمة */}
      <RecruitmentBanner
        title={t("cleaning.title")}
        subtitle={t("cleaning.subtitle")}
        showFilterButton={false}
      />

      {/* قائمة الخدمات */}
      <View style={styles.servicesListContainer}>
        <CleaningServicesList />
      </View>

      {/* الدرج الجانبي للفلترة */}
      <FilterDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />

      <CustomTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    // ✨ استخدام الهيلبر للمحاذاة المعكوسة
    alignItems: RTL.flexAlign(),
  },
  headerText: {
    fontFamily: "CairoBold",
    fontSize: 18,
    color: "#003366",
    // ✨ محاذاة النص حسب اللغة
    textAlign: RTL.textAlign(),
    width: "100%",
  },
  servicesListContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
});

export default Cleaning;
