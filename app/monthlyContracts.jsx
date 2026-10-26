import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // ✨ استيراد الترجمة
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import AppBar from "@/components/AppBar";
import CustomTabs from "@/components/CustomTabs";
import FilterBar from "../components/FilterBar";
import MaidsList from "../components/homeComponents/MaidsList";
import RecruitmentBanner from "../components/recruitmentComponents/RecruitmentBanner";
import useCompanyServices from "../hooks/useCompanyServices";
// ✨ استيراد الهيلبر

const MonthlyContracts = () => {
  const { t, i18n } = useTranslation(); // ✨ استخدام الترجمة
  const { companyServices, loading: loadingServices } = useCompanyServices();

  const [filters, setFilters] = useState({
    nationality: "",
    religion: "",
    age: "",
    experience: "",
    branchId: "",
    serviceId: null,
  });

  // 2. البحث عن خدمة "العقود الشهرية" (دعم اللغتين في البحث)
  useEffect(() => {
    if (companyServices.length > 0) {
      const monthlyService = companyServices.find(
        (service) =>
          service.nameAr?.includes("شهري") ||
          service.name?.toLowerCase().includes("monthly") ||
          service.nameEn?.toLowerCase().includes("monthly")
      );

      if (monthlyService) {
        setFilters((prev) => ({ ...prev, serviceId: monthlyService.id }));
      }
    }
  }, [companyServices]);

  const resetFilters = () => {
    setFilters((prev) => ({
      nationality: "",
      religion: "",
      age: "",
      experience: "",
      branchId: "",
      serviceId: prev.serviceId,
    }));
  };

  /**
   * 3. ✨ تعريف رأس القائمة (Header) المترجم
   */
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerWrapper}>
        <RecruitmentBanner
          title={t("monthly.title")}
          subtitle={t("monthly.subtitle")}
          filterButtonText={t("recruitment.reset_filters")}
          onFilterPress={resetFilters}
        />
      </View>
    ),
    [t]
  );

  return (
    <View style={styles.contentContainer}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* شريط التطبيق العلوي */}
      <AppBar
        onNotificationPress={() => console.log("Notifications Pressed")}
      />

      <View style={styles.listContainer}>
        {loadingServices || filters.serviceId === null ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={[styles.loadingText, { textAlign: "center" }]}>
              {t("common.loading")}
            </Text>
          </View>
        ) : (
          <MaidsList
            currentFilters={filters}
            ListHeaderComponent={renderHeader}
          />
        )}
      </View>

      {/* شريط الفلاتر المداري الدائري الطائر */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* شريط التنقل السفلي */}
      <CustomTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerWrapper: {
    backgroundColor: "transparent",
    width: "100%",
  },
  listContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Cairo",
    color: "#002E5A",
  },
});

export default MonthlyContracts;
