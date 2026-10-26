import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AppBar from "../../components/AppBar";
import { RTL } from "../../utils/rtlHelper";
import LocationPickerModal from "../../components/locationComponents/LocationPickerModal";
import { getAppContent, DEFAULT_MOBILE_APP_CONTENT } from "../Api/AppContentService";

const APP_VERSION = Constants.expoConfig?.version || "1.0.21";

const More = () => {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appContent, setAppContent] = useState(DEFAULT_MOBILE_APP_CONTENT);
  const [showHelpDetails, setShowHelpDetails] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }

        // Fetch dynamic platform content & policies
        const content = await getAppContent(i18n.language);
        if (content) {
          setAppContent(content);
        }
      } catch (error) {
        console.error("Error fetching data in More screen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  // دالة تبديل اللغة
  const toggleLanguage = async () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("user-language", newLang);
  };

  const handleLogout = async () => {
    Alert.alert(t("more.logout_title"), t("more.logout_msg"), [
      { text: t("more.cancel"), style: "cancel" },
      {
        text: t("more.logout"),
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userData", "userOtp", "userToken"]);
          setUserData(null);
          setIsLoggedIn(false);
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(t("more.delete_title"), t("more.delete_msg"), [
      { text: t("more.cancel"), style: "cancel" },
      {
        text: t("signup.button_delete") || "Delete",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userData", "userOtp", "userToken"]);
          router.replace("/login");
        },
      },
    ]);
  };

  const formatCreationDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openPhone = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const openWhatsApp = (whatsapp) => {
    if (!whatsapp) return;
    const cleanNumber = whatsapp.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanNumber}`).catch(() => {});
  };

  const openEmail = (email) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  const handlePrivacyPress = () => {
    if (appContent.privacyPolicy?.linkToWeb && appContent.privacyPolicy?.webUrl) {
      Linking.openURL(appContent.privacyPolicy.webUrl).catch(() => {});
    } else {
      setShowPrivacyPolicy(!showPrivacyPolicy);
    }
  };

  const handleTermsPress = () => {
    if (appContent.termsAndConditions?.linkToWeb && appContent.termsAndConditions?.webUrl) {
      Linking.openURL(appContent.termsAndConditions.webUrl).catch(() => {});
    } else {
      setShowTerms(!showTerms);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002E5A" />
        <Text style={{ fontFamily: "Cairo", marginTop: 10 }}>
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  // Dynamic Content Strings
  const noticeTitle =
    (isAr ? appContent.importantNotice?.titleAr : (appContent.importantNotice?.titleEn || appContent.importantNotice?.titleAr)) ||
    t("more.important_notice");

  const noticeText =
    (isAr ? appContent.importantNotice?.mobileContentAr : (appContent.importantNotice?.mobileContentEn || appContent.importantNotice?.mobileContentAr)) ||
    t("more.notice_text");

  const privacyTitle =
    (isAr ? appContent.privacyPolicy?.titleAr : (appContent.privacyPolicy?.titleEn || appContent.privacyPolicy?.titleAr)) ||
    t("more.privacy");

  const privacyText =
    (isAr ? appContent.privacyPolicy?.mobileShortTextAr : (appContent.privacyPolicy?.mobileShortTextEn || appContent.privacyPolicy?.mobileShortTextAr)) ||
    t("more.privacy_text");

  const termsTitle =
    (isAr ? appContent.termsAndConditions?.titleAr : (appContent.termsAndConditions?.titleEn || appContent.termsAndConditions?.titleAr)) ||
    (isAr ? "الشروط والأحكام" : "Terms & Conditions");

  const termsText =
    (isAr ? appContent.termsAndConditions?.mobileShortTextAr : (appContent.termsAndConditions?.mobileShortTextEn || appContent.termsAndConditions?.mobileShortTextAr)) ||
    (isAr ? "تخضع كافة المعاملات والتعاقدات عبر التطبيق للوائح وزارة الموارد البشرية." : "All transactions are subject to Saudi labor regulations.");

  const workingHours = isAr
    ? appContent.helpAndSupport?.workingHoursAr
    : (appContent.helpAndSupport?.workingHoursEn || appContent.helpAndSupport?.workingHoursAr);

  return (
    <View style={styles.container}>
      <AppBar />

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Brand Gradient Profile Card */}
        <LinearGradient
          colors={["#002E5A", "#2B9B72"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileIconContainer}>
            <Icon name="person" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>
            {t("more.welcome", { name: userData?.name || t("more.guest") })}
          </Text>
          {isLoggedIn && (
            <View style={styles.profileDetailsContainer}>
              <Text style={styles.profileDetail}>
                {t("more.phone")}: {userData?.phone || "---"}
              </Text>
              <Text style={styles.profileDetail}>
                {t("more.member_since")}:{" "}
                {formatCreationDate(userData?.createdDate)}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Options List Container Card */}
        <View style={styles.optionsContainer}>
          {/* 1. Language Toggle Option */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={toggleLanguage}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(43, 155, 114, 0.08)" }]}>
              <Icon name="language" size={20} color="#2B9B72" />
            </View>
            <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
              {i18n.language === "ar" ? "English Language" : "اللغة العربية"}
            </Text>
            <Icon
              name={RTL.select("chevron-left", "chevron-right")}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* 2. Delivery Location Setting Option */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={() => {
              if (isLoggedIn) {
                setLocationModalVisible(true);
              } else {
                router.push("/LoginPromptPage");
              }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 46, 90, 0.08)" }]}>
              <Icon name="pin-drop" size={20} color="#002E5A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
                {t("more.delivery_location", "عنوان التوصيل وموقعي")}
              </Text>
              {userData?.district || userData?.address ? (
                <Text
                  style={[
                    {
                      fontSize: 11,
                      color: "#6B7280",
                      fontFamily: "Cairo",
                      marginTop: 2,
                    },
                    { textAlign: RTL.textAlign() },
                  ]}
                  numberOfLines={1}
                >
                  {userData?.district ? `${userData.district} • ` : ""}
                  {userData?.address || ""}
                </Text>
              ) : null}
            </View>
            <Icon
              name={RTL.select("chevron-left", "chevron-right")}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* 3. Complaints & Inquiries Option */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={() => {
              if (isLoggedIn) {
                router.push("/complaints");
              } else {
                router.push("/LoginPromptPage");
              }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 46, 90, 0.06)" }]}>
              <Icon name="support-agent" size={20} color="#002E5A" />
            </View>
            <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
              {t("more.complaints_center")}
            </Text>
            <Icon
              name={RTL.select("chevron-left", "chevron-right")}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* 4. Important Notice Option (Dynamic) */}
          {appContent.importantNotice?.isActive !== false && (
            <>
              <TouchableOpacity
                style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
                onPress={() => setShowImportantNotice(!showImportantNotice)}
              >
                <View style={[styles.iconContainer, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
                  <Icon name="warning" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.optionText, { textAlign: RTL.textAlign(), color: "#B45309" }]}>
                  {noticeTitle}
                </Text>
                <Icon
                  name={
                    showImportantNotice
                      ? "expand-less"
                      : RTL.select("chevron-left", "chevron-right")
                  }
                  size={20}
                  color="#F59E0B"
                />
              </TouchableOpacity>
              {showImportantNotice && (
                <View style={[styles.expandedContent, styles.noticeExpandedContent]}>
                  <Text
                    style={[
                      styles.importantNoticeText,
                      { textAlign: RTL.textAlign() },
                    ]}
                  >
                    {noticeText}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* 5. Help & Support Option (Dynamic Channels) */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={() => setShowHelpDetails(!showHelpDetails)}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 46, 90, 0.06)" }]}>
              <Icon name="help-outline" size={20} color="#002E5A" />
            </View>
            <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
              {t("more.help")}
            </Text>
            <Icon
              name={
                showHelpDetails
                  ? "expand-less"
                  : RTL.select("chevron-left", "chevron-right")
              }
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          {showHelpDetails && (
            <View style={styles.expandedContent}>
              {/* Phone Channel */}
              {!!appContent.helpAndSupport?.phone && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openPhone(appContent.helpAndSupport.phone)}
                  style={[styles.contactChannelRow, { flexDirection: RTL.rowDir() }]}
                >
                  <Icon name="call" size={18} color="#002E5A" />
                  <Text style={[styles.channelLabel, { textAlign: RTL.textAlign() }]}>
                    {t("more.support_phone")}:
                  </Text>
                  <Text style={styles.channelValue}>{appContent.helpAndSupport.phone}</Text>
                  <Icon name="open-in-new" size={14} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              )}

              {/* WhatsApp Channel */}
              {!!appContent.helpAndSupport?.whatsapp && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openWhatsApp(appContent.helpAndSupport.whatsapp)}
                  style={[styles.contactChannelRow, { flexDirection: RTL.rowDir() }]}
                >
                  <Icon name="chat" size={18} color="#25D366" />
                  <Text style={[styles.channelLabel, { textAlign: RTL.textAlign() }]}>
                    {isAr ? "واتساب الدعم:" : "WhatsApp Support:"}
                  </Text>
                  <Text style={styles.channelValue}>{appContent.helpAndSupport.whatsapp}</Text>
                  <Icon name="open-in-new" size={14} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              )}

              {/* Email Channel */}
              {!!appContent.helpAndSupport?.email && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openEmail(appContent.helpAndSupport.email)}
                  style={[styles.contactChannelRow, { flexDirection: RTL.rowDir() }]}
                >
                  <Icon name="email" size={18} color="#002E5A" />
                  <Text style={[styles.channelLabel, { textAlign: RTL.textAlign() }]}>
                    {t("more.support_email")}:
                  </Text>
                  <Text style={styles.channelValue}>{appContent.helpAndSupport.email}</Text>
                  <Icon name="open-in-new" size={14} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              )}

              {/* Working Hours */}
              {!!workingHours && (
                <View style={[styles.contactChannelRow, { flexDirection: RTL.rowDir() }]}>
                  <Icon name="access-time" size={18} color="#6B7280" />
                  <Text style={[styles.channelLabel, { textAlign: RTL.textAlign() }]}>
                    {isAr ? "ساعات العمل:" : "Working Hours:"}
                  </Text>
                  <Text style={styles.workingHoursValue}>{workingHours}</Text>
                </View>
              )}
            </View>
          )}

          {/* 6. Privacy Policy Option (Dynamic) */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={handlePrivacyPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 46, 90, 0.06)" }]}>
              <Icon name="security" size={20} color="#002E5A" />
            </View>
            <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
              {privacyTitle}
            </Text>
            <Icon
              name={
                appContent.privacyPolicy?.linkToWeb
                  ? "open-in-new"
                  : showPrivacyPolicy
                  ? "expand-less"
                  : RTL.select("chevron-left", "chevron-right")
              }
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          {showPrivacyPolicy && !appContent.privacyPolicy?.linkToWeb && (
            <View style={styles.expandedContent}>
              <Text
                style={[styles.expandedText, { textAlign: RTL.textAlign() }]}
              >
                {privacyText}
              </Text>
            </View>
          )}

          {/* 7. Terms & Conditions Option (Dynamic) */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={handleTermsPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: "rgba(0, 46, 90, 0.06)" }]}>
              <Icon name="article" size={20} color="#002E5A" />
            </View>
            <Text style={[styles.optionText, { textAlign: RTL.textAlign() }]}>
              {termsTitle}
            </Text>
            <Icon
              name={
                appContent.termsAndConditions?.linkToWeb
                  ? "open-in-new"
                  : showTerms
                  ? "expand-less"
                  : RTL.select("chevron-left", "chevron-right")
              }
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          {showTerms && !appContent.termsAndConditions?.linkToWeb && (
            <View style={styles.expandedContent}>
              <Text
                style={[styles.expandedText, { textAlign: RTL.textAlign() }]}
              >
                {termsText}
              </Text>
            </View>
          )}

          {/* 8. Login / Logout Option */}
          <TouchableOpacity
            style={[styles.optionItem, { flexDirection: RTL.rowDir() }]}
            onPress={isLoggedIn ? handleLogout : () => router.push("/login")}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isLoggedIn ? "rgba(239, 68, 68, 0.08)" : "rgba(0, 46, 90, 0.06)" },
              ]}
            >
              <Icon
                name={isLoggedIn ? "logout" : "login"}
                size={20}
                color={isLoggedIn ? "#EF4444" : "#002E5A"}
              />
            </View>
            <Text
              style={[
                styles.optionText,
                { textAlign: RTL.textAlign() },
                isLoggedIn && { color: "#EF4444", fontFamily: "CairoBold" },
              ]}
            >
              {isLoggedIn ? t("more.logout") : t("more.login")}
            </Text>
            <Icon
              name={RTL.select("chevron-left", "chevron-right")}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {/* 9. Delete Account Option (Only when logged in) */}
          {isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.optionItem,
                { flexDirection: RTL.rowDir(), borderBottomWidth: 0 },
              ]}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.iconContainer, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                <Icon name="delete-forever" size={20} color="#EF4444" />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { textAlign: RTL.textAlign(), color: "#EF4444", fontFamily: "CairoBold" },
                ]}
              >
                {t("more.delete_account")}
              </Text>
              <Icon
                name={RTL.select("chevron-left", "chevron-right")}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* App Version Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.appVersionText}>
            {t("more.version", "الإصدار")} {APP_VERSION}
          </Text>
        </View>
      </ScrollView>

      {/* Location Picker Modal Component */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        initialLat={userData?.latitude}
        initialLng={userData?.longitude}
        initialAddress={userData?.address}
        initialDistrict={userData?.district}
        onLocationSaved={(loc) => {
          setUserData((prev) => {
            const updated = {
              ...(prev || {}),
              latitude: loc.latitude,
              longitude: loc.longitude,
              address: loc.address,
              district: loc.district,
              mapUrl: loc.mapUrl,
            };
            AsyncStorage.setItem("userData", JSON.stringify(updated)).catch((err) =>
              console.warn("Error updating userData in AsyncStorage:", err)
            );
            return updated;
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollViewContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    elevation: 4,
    shadowColor: "#002E5A",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileName: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  profileDetailsContainer: {
    alignItems: "center",
    marginTop: 4,
    gap: 2,
  },
  profileDetail: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "rgba(255, 255, 255, 0.85)",
  },
  optionsContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionItem: {
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "CairoBold",
    ...RTL.marginSide(12),
    marginInline: 10,
  },
  expandedContent: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  noticeExpandedContent: {
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  expandedText: {
    fontFamily: "Cairo",
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 22,
  },
  importantNoticeText: {
    color: "#B45309",
    fontFamily: "Cairo",
    fontSize: 12,
    lineHeight: 20,
  },
  contactChannelRow: {
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  channelLabel: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#475569",
    marginHorizontal: 8,
  },
  channelValue: {
    fontSize: 13,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  workingHoursValue: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#64748B",
  },
  footerContainer: { marginTop: 10, alignItems: "center" },
  appVersionText: { fontSize: 11, color: "#9CA3AF", fontFamily: "Cairo" },
});

export default More;
