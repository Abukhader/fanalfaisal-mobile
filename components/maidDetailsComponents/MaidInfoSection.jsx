import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RTL } from "../../utils/rtlHelper";
import InfoItem from "./InfoItem";

const MaidInfoSection = ({ maid }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <View style={styles.container}>
      {/* الجزء العلوي: لوحة بيانات مشقوقة أفقياً بشكل مبتكر */}
      <View style={[styles.headerSplit, { flexDirection: RTL.rowDir() }]}>
        {/* إطار الصورة الكوكبي المتطور مع مؤشر الحالة المضيء */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarHaloOuter}>
            <View style={styles.avatarHaloInner}>
              <Image
                source={{ uri: maid.photo }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
          {/* نقطة حالة الاتصال / التوفر النشط */}
          <View
            style={[
              styles.statusDot,
              RTL.select(
                { right: 2, bottom: 2 },
                { left: 2, bottom: 2 }
              ),
            ]}
          />
        </View>

        {/* لوحة تفاصيل الاسم والتقييم والتوثيق */}
        <View
          style={[
            styles.profileDetails,
            {
              alignItems: RTL.flexAlign(),
              marginStart: RTL.isRTL ? 0 : 16,
              marginEnd: RTL.isRTL ? 16 : 0,
            },
          ]}
        >
          <Text style={[styles.name, { textAlign: RTL.textAlign() }]}>
            {maid.name}
          </Text>

          <View style={[styles.badgesRow, { flexDirection: RTL.rowDir() }]}>
            {/* وسم التوثيق الفاخر */}
            <View style={[styles.verifiedBadge, { flexDirection: RTL.rowDir() }]}>
              <Icon
                name="check-decagram"
                size={13}
                color="#2B9B72"
                style={RTL.select({ marginRight: 4 }, { marginLeft: 4 })}
              />
              <Text style={styles.verifiedText}>
                {t("maid_info.verified", "سيرة موثقة")}
              </Text>
            </View>
          </View>

          {/* نص الحالة الجانبي */}
          <Text style={[styles.subtitleText, { textAlign: RTL.textAlign() }]}>
            {t("maid_info.ready_to_start", "جاهزة للعمل والتعاقد فوراً")}
          </Text>
        </View>
      </View>

      {/* خط فاصل زجاجي فائق التنسيق */}
      <View style={styles.divider} />

      {/* شبكة المعلومات المحدثة بأيقونات خطية مميزة */}
      <View style={[styles.infoGrid, { flexDirection: RTL.rowDir() }]}>
        <InfoItem
          iconName="account-clock-outline"
          label={t("maid_info.age")}
          value={`${maid.age}`}
        />

        <InfoItem
          iconName="earth"
          label={t("maid_info.nationality")}
          value={
            isArabic
              ? maid.nationality?.nameAr
              : maid.nationality?.nameEn || maid.nationality?.name
          }
        />

        <InfoItem
          iconName="briefcase-variant-outline"
          label={t("maid_info.experience")}
          value={
            maid.experienceYears > 0
              ? `${maid.experienceYears} ${isArabic ? "سنوات" : "Years"}`
              : t("maid_info.no_experience")
          }
        />

        <InfoItem
          iconName="book-open-outline"
          label={t("maid_info.religion")}
          value={
            (isArabic ? maid.religion?.nameAr : maid.religion?.nameEn) ||
            t("maid_info.non_muslim")
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.75)", // زجاجي أبيض ناعم
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.16)", // إطار زمردي دقيق
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  headerSplit: {
    width: "100%",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarHaloOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHaloInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#2B9B72",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8FAFC",
  },
  statusDot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2B9B72", // زمردي مضيء
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#2B9B72",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#002E5A", // كحلي ملكي
    marginBottom: 4,
  },
  badgesRow: {
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.18)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 9.5,
    fontFamily: "CairoBold",
    color: "#2B9B72", // أخضر زمردي
  },

  subtitleText: {
    fontSize: 11,
    fontFamily: "Cairo",
    color: "#64748B", // رمادي ناعم
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(0, 46, 90, 0.06)",
    marginVertical: 16,
  },
  infoGrid: {
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default MaidInfoSection;

