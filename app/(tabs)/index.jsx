import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { checkAppVersion } from "../Api/AuthService";
import { GetAllCompanyService } from "../Api/officeService";
import { getAllWorkers } from "../Api/WorkerService";
import { RTL } from "../../utils/rtlHelper";

// Sub-components
import Banner from "@/components/homeComponents/Banner";
import ServicesList from "@/components/homeComponents/ServicesList";
import MaidCard from "@/components/homeComponents/MaidCard";
import AppBar from "../../components/AppBar";
import NetworkErrorView from "@/components/ui/NetworkErrorView";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRtl = i18n.language === "ar";

  // App Update States
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const [updateUrl, setUpdateUrl] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [isCheckingVersion, setIsCheckingVersion] = useState(true);

  // State to manage diverse workers deck
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersError, setWorkersError] = useState(null);

  const loadDiverseWorkers = React.useCallback(async () => {
    setWorkersLoading(true);
    setWorkersError(null);

    try {
      const lang = i18n.language;

      // 1. Fetch all company services to resolve service IDs
      const servicesResponse = await GetAllCompanyService(lang);
      const servicesData = servicesResponse?.data || [];

      // Find service IDs by matching names in Arabic/English
      const recruitmentService = servicesData.find(
        (s) =>
          s.nameAr?.includes("توسط") ||
          s.name?.includes("توسط") ||
          (s.nameEn && s.nameEn.toLowerCase().includes("mediation"))
      );

      const monthlyService = servicesData.find(
        (s) =>
          s.nameAr?.includes("شهري") ||
          s.name?.includes("شهري") ||
          (s.nameEn && s.nameEn.toLowerCase().includes("monthly"))
      );

      const hourlyService = servicesData.find(
        (s) =>
          s.nameAr?.includes("ساعة") ||
          s.name?.includes("ساعة") ||
          (s.nameEn && s.nameEn.toLowerCase().includes("hourly"))
      );

      // 2. Fetch targeted workers for each service in parallel
      const [tawasutRes, monthlyRes, hourlyRes] = await Promise.all([
        recruitmentService
          ? getAllWorkers(lang, null, null, null, null, null, recruitmentService.id, null, null, null, null, null, 1, 1, 4)
          : Promise.resolve({ success: 1, data: { results: [] } }),
        monthlyService
          ? getAllWorkers(lang, null, null, null, null, null, monthlyService.id, null, null, null, null, null, 1, 1, 3)
          : Promise.resolve({ success: 1, data: { results: [] } }),
        hourlyService
          ? getAllWorkers(lang, null, null, null, null, null, hourlyService.id, null, null, null, null, null, 1, 1, 3)
          : Promise.resolve({ success: 1, data: { results: [] } }),
      ]);

      const tawasutList = (tawasutRes?.success === 1 ? tawasutRes.data?.results : []) || [];
      const monthlyList = (monthlyRes?.success === 1 ? monthlyRes.data?.results : []) || [];
      const hourlyList = (hourlyRes?.success === 1 ? hourlyRes.data?.results : []) || [];

      // 3. Interleave services (round-robin) to guarantee visual diversity
      const combined = [];
      const maxLen = Math.max(tawasutList.length, monthlyList.length, hourlyList.length);

      for (let i = 0; i < maxLen; i++) {
        if (tawasutList[i]) combined.push(tawasutList[i]);
        if (monthlyList[i]) combined.push(monthlyList[i]);
        if (hourlyList[i]) combined.push(hourlyList[i]);
      }

      const addedIds = new Set(combined.map((w) => w.id));
      const allFetched = [...tawasutList, ...monthlyList, ...hourlyList];

      for (const worker of allFetched) {
        if (combined.length >= 10) break;
        if (!addedIds.has(worker.id)) {
          combined.push(worker);
          addedIds.add(worker.id);
        }
      }

      setWorkers(combined.slice(0, 10));
    } catch (err) {
      console.error("Error loading diverse workers on Home screen:", err);
      setWorkersError(err);
    } finally {
      setWorkersLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    loadDiverseWorkers();
  }, [loadDiverseWorkers]);

  // App Version Check with 3-second timeout guarantee
  useEffect(() => {
    let isMounted = true;
    const checkForUpdates = async () => {
      try {
        const appVersionData = {
          Os: Platform.OS,
          Name: "fanalfisal",
          Version: Constants.expoConfig?.version || "2.0.3",
        };

        const key = process.env.EXPO_PUBLIC_LEGACY_API_KEY;
        const versionPromise = checkAppVersion(key, appVersionData);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Version check timeout")), 3000)
        );

        const response = await Promise.race([versionPromise, timeoutPromise]);

        if (isMounted && response && response.success === 0) {
          setUpdateUrl(response.data?.url || "");
          setUpdateMessage(response.message || t("home.update_default_msg"));
          setIsUpdateRequired(true);
        }
      } catch (error) {
        console.warn("Version check skipped or timed out:", error.message);
      } finally {
        if (isMounted) {
          setIsCheckingVersion(false);
        }
      }
    };

    checkForUpdates();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isUpdateRequired) return true;
      return false;
    });

    return () => backHandler.remove();
  }, [isUpdateRequired]);

  // Hide tabs on mandatory update
  useEffect(() => {
    if (isUpdateRequired) {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
        headerShown: false,
        gestureEnabled: false,
      });
    }
  }, [isUpdateRequired, navigation]);

  // Mandatory Update Screen
  if (isUpdateRequired) {
    return (
      <View style={styles.updateContainer}>
        <Text style={[styles.updateTitle, { textAlign: RTL.textAlign() }]}>
          {t("home.update_title")}
        </Text>
        <Text style={[styles.updateMessage, { textAlign: RTL.textAlign() }]}>
          {updateMessage}
        </Text>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => {
            if (updateUrl) Linking.openURL(updateUrl);
          }}
        >
          <Text style={styles.updateButtonText}>{t("home.update_btn")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.safeArea}>
        {/* 1. Integrated Premium Light Header Row */}
        <AppBar />

        {isCheckingVersion ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2B9B72" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. Cinematic Banner carousel */}
            <Banner />

            {/* 3. iOS Squircle Glass Services Grid */}
            <ServicesList />

            {/* 4. Horizontal Swipeable Workers Deck */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionHeader, { flexDirection: RTL.rowDir() }]}>
                <Text style={styles.sectionTitle}>
                  {isRtl ? "أبرز العاملات" : "Recommended Staff"}
                </Text>
              </View>

              {workersLoading ? (
                <ActivityIndicator size="small" color="#2B9B72" style={{ marginVertical: 30 }} />
              ) : workersError ? (
                <NetworkErrorView
                  compact
                  title={isRtl ? "تعذر تحميل العاملات" : "Unable to load workers"}
                  message={isRtl ? "يرجى التحقق من الاتصال والمحاولة مجدداً" : "Please check connection and try again"}
                  onRetry={loadDiverseWorkers}
                />
              ) : (
                <FlatList
                  horizontal
                  data={workers}
                  keyExtractor={(item, index) => item.id?.toString() + index}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.horizontalList,
                    { flexDirection: RTL.rowDir() },
                  ]}
                  renderItem={({ item }) => {
                    const safeNameEn = item.companyService?.nameEn?.toLowerCase() || "";
                    const safeNameAr =
                      item.companyService?.nameAr || item.companyService?.name || "";

                    let serviceDisplayName = isRtl
                      ? (item.companyService?.nameAr || item.companyService?.name || "توسط")
                      : (item.companyService?.nameEn || "Mediation");

                    if (
                      safeNameEn.includes("mediation") ||
                      safeNameEn.includes("contract") ||
                      safeNameAr.includes("توسط") ||
                      safeNameAr.includes("تعاقد")
                    ) {
                      serviceDisplayName = isRtl ? "توسط" : "Mediation";
                    } else if (
                      safeNameEn.includes("hourly") ||
                      safeNameAr.includes("ساعة")
                    ) {
                      serviceDisplayName = isRtl ? "بالساعة" : "Hourly";
                    } else if (
                      safeNameEn.includes("monthly") ||
                      safeNameAr.includes("شهري")
                    ) {
                      serviceDisplayName = isRtl ? "عقد شهري" : "Monthly";
                    } else if (
                      safeNameEn.includes("clean") ||
                      safeNameAr.includes("تنظيف")
                    ) {
                      serviceDisplayName = isRtl ? "تنظيف" : "Cleaning";
                    }

                    const isHourlyRental =
                      safeNameEn.includes("hourly") ||
                      safeNameAr.includes("ساعة");

                    const defaultPlan =
                      item.prices?.find((p) => p.isDefault) || item.prices?.[0] || {};
                    const displayPrice = defaultPlan.price || 0;
                    const displayHours = defaultPlan.hours || null;

                    return (
                      <View style={styles.maidCardWrapper}>
                        <MaidCard
                          id={item.id}
                          name={item.name}
                          nationality={
                            isRtl
                              ? item.nationality?.nameAr
                              : item.nationality?.nameEn || item.nationality?.name
                          }
                          price={displayPrice}
                          hours={displayHours}
                          isHourlyRental={isHourlyRental}
                          photo={{ uri: item.photo }}
                          branch={
                            isRtl ? item.branch?.nameAr : item.branch?.nameEn
                          }
                          service={serviceDisplayName}
                          horizontal={false}
                        />
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  sectionContainer: {
    marginTop: 16,
    width: "100%",
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#111827",
  },
  horizontalList: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  maidCardWrapper: {
    width: 290,
  },
  errorText: {
    color: "#EF4444",
    fontFamily: "CairoBold",
    textAlign: "center",
    marginVertical: 20,
  },
  updateContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 20,
  },
  updateTitle: {
    fontSize: 24,
    color: "#EF4444",
    marginBottom: 20,
    fontFamily: "CairoBold",
    width: "100%",
  },
  updateMessage: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: "Cairo",
    width: "100%",
  },
  updateButton: {
    backgroundColor: "#002E5A",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "CairoBold",
  },
});
