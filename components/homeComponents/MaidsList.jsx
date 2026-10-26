import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EmptyState from "../../components/EmptyState";
import useWorkers from "../../hooks/useWorkers";
import { RTL } from "../../utils/rtlHelper";
import MaidCard from "./MaidCard";

const MaidsList = ({ currentFilters = {}, ListHeaderComponent }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const getExperienceValue = (exp) => {
    if (exp === "1") return true;
    if (exp === "0") return false;
    return null;
  };

  const getAgeValues = (ageString) => {
    if (ageString === "<30") return { minAge: null, maxAge: 30 };
    if (ageString === "30-40") return { minAge: 30, maxAge: 40 };
    if (ageString === ">40") return { minAge: 40, maxAge: null };
    return { minAge: null, maxAge: null };
  };

  const { minAge, maxAge } = getAgeValues(currentFilters.age);

  const { workers, loading, error, fetchWorkers, paginationInfo } = useWorkers({
    lang: i18n.language,
    availabilityStatus: 1,
    companyServiceId: currentFilters.serviceId,
    branchId: currentFilters.branchId,
    nationalityId: currentFilters.nationality,
    religionId: currentFilters.religion,
    hasExperience: getExperienceValue(currentFilters.experience),
    minAge: minAge,
    maxAge: maxAge,
    page: page,
    pageSize: 10,
  });

  useEffect(() => {
    setPage(1);
  }, [
    currentFilters.serviceId,
    currentFilters.nationality,
    currentFilters.religion,
    currentFilters.experience,
    currentFilters.branchId,
    currentFilters.age,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchWorkers();
    setRefreshing(false);
  }, [fetchWorkers]);

  const handleLoadMore = () => {
    if (!loading && page < paginationInfo.pageCount) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  if (loading && page === 1 && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        {ListHeaderComponent && ListHeaderComponent()}
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <ActivityIndicator size="large" color="#2B9B72" />
          <Text style={[styles.loadingText, { textAlign: "center" }]}>
            {t("common.loading")}
          </Text>
        </View>
      </View>
    );
  }

  if (error && page === 1) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent && ListHeaderComponent()}
        <View style={[styles.errorContainer, { alignItems: RTL.flexAlign() }]}>
          <Text style={[styles.errorText, { textAlign: RTL.textAlign() }]}>
            {t("common.error_fetching_data")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={workers}
      keyExtractor={(item, index) => item.id?.toString() + index}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => {
        // ✨ استخراج الأسماء بأمان
        const safeNameEn = item.companyService?.nameEn?.toLowerCase() || "";
        const safeNameAr =
          item.companyService?.nameAr || item.companyService?.name || "";

        let serviceDisplayName =
          i18n.language === "ar"
            ? item.companyService?.nameAr || item.companyService?.name || "توسط"
            : item.companyService?.nameEn || "Mediation";

        if (
          safeNameEn.includes("mediation") ||
          safeNameEn.includes("contract") ||
          safeNameAr.includes("توسط") ||
          safeNameAr.includes("تعاقد")
        ) {
          serviceDisplayName = i18n.language === "ar" ? "توسط" : "Mediation";
        } else if (
          safeNameEn.includes("hourly") ||
          safeNameAr.includes("ساعة")
        ) {
          serviceDisplayName = i18n.language === "ar" ? "بالساعة" : "Hourly";
        } else if (
          safeNameEn.includes("monthly") ||
          safeNameAr.includes("شهري")
        ) {
          serviceDisplayName = i18n.language === "ar" ? "عقد شهري" : "Monthly";
        } else if (
          safeNameEn.includes("clean") ||
          safeNameAr.includes("تنظيف")
        ) {
          serviceDisplayName = i18n.language === "ar" ? "تنظيف" : "Cleaning";
        }

        const isHourlyRental =
          safeNameEn.includes("hourly") ||
          safeNameAr.includes("ساعة");

        // ✨ استخراج السعر والساعات الافتراضية من مصفوفة prices
        const defaultPlan =
          item.prices?.find((p) => p.isDefault) || item.prices?.[0] || {};
        const displayPrice = defaultPlan.price || 0;
        const displayHours = defaultPlan.hours || null;

        return (
          <MaidCard
            id={item.id}
            name={item.name}
            nationality={
              i18n.language === "ar"
                ? item.nationality?.nameAr
                : item.nationality?.nameEn || item.nationality?.name
            }
            // ✨ تمرير السعر المستخرج وعدد الساعات وما إذا كانت الخدمة بالساعة
            price={displayPrice}
            hours={displayHours}
            isHourlyRental={isHourlyRental}
            photo={{ uri: item.photo }}
            branch={
              i18n.language === "ar" ? item.branch?.nameAr : item.branch?.nameEn
            }
            service={serviceDisplayName}
            showRating={false} // ✨ إخفاء نجوم التقييم في قائمة العرض بطلب المستخدم
          />
        );
      }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2B9B72"]}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loading && page > 1 ? (
          <ActivityIndicator
            size="small"
            color="#2B9B72"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={{ height: 100 }} />
        )
      }
      ListEmptyComponent={() => (
        <EmptyState message={t("home.no_maids_found")} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 20 },
  loaderContainer: { flex: 1, paddingTop: 0 },
  loadingText: { marginTop: 10, fontFamily: "Cairo", color: "#002E5A" },
  errorContainer: {
    padding: 20,
    backgroundColor: "#f8d7da",
    margin: 10,
    borderRadius: 8,
  },
  errorText: { fontFamily: "Cairo", color: "#721c24" },
});

export default MaidsList;
