import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";
import { getActiveBanners, DEFAULT_MOBILE_BANNERS } from "../../app/Api/BannerService";

export default function Banner() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [bannerList, setBannerList] = useState(DEFAULT_MOBILE_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  // Fetch dynamic banners on mount and when language changes
  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const data = await getActiveBanners(i18n.language);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBannerList(data);
          setActiveIndex(0);
        }
      } catch (err) {
        console.warn("Banner load error:", err.message);
      }
    };

    loadBanners();
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!bannerList || bannerList.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev === bannerList.length - 1 ? 0 : prev + 1));
    }, 6500); // Relaxed slide interval
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bannerList.length]);

  const handleDotPress = (index) => {
    setActiveIndex(index);
    startAutoPlay();
  };

  const handleBadgePress = (route, serviceKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (route) {
      router.push({
        pathname: route,
        params: serviceKey ? { serviceKey } : undefined,
      });
    }
  };

  const handleBannerPress = (banner) => {
    if (banner?.actionRoute) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      router.push({
        pathname: banner.actionRoute,
      });
    }
  };

  const currentBanner = bannerList[activeIndex] || bannerList[0] || DEFAULT_MOBILE_BANNERS[0];

  // Resolve Heading & Subheading bilingual text
  const isAr = i18n.language === "ar";
  const heading =
    (isAr ? currentBanner.titleAr : (currentBanner.titleEn || currentBanner.titleAr)) ||
    (currentBanner.headingKey ? t(currentBanner.headingKey) : "");

  const subheading =
    (isAr ? currentBanner.subTitleAr : (currentBanner.subTitleEn || currentBanner.subTitleAr)) ||
    (currentBanner.subheadingKey ? t(currentBanner.subheadingKey) : "");

  const actionText =
    (isAr ? currentBanner.actionTextAr : (currentBanner.actionTextEn || currentBanner.actionTextAr)) ||
    (isAr ? "اطلع على العاملات" : "Explore Workers");

  const services = currentBanner.services || [];
  const showBadges = currentBanner.showBadges !== false;

  return (
    <View style={styles.bannerContainer}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => handleBannerPress(currentBanner)}
        style={styles.imageAndTextContainer}
      >
        {/* High-Performance Standard Image (Remote or Local Preset) */}
        <Image
          source={currentBanner.src}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Elegant Vignette Gradient Overlay (Teal-to-Navy Brand Blend) */}
        <LinearGradient
          colors={["rgba(43, 155, 114, 0.15)", "rgba(0, 46, 90, 0.50)", "rgba(0, 18, 36, 0.90)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.textsContainer, { alignItems: RTL.flexAlign() }]}
        >
          {/* Headline */}
          {!!heading && (
            <Text style={[styles.heading, { textAlign: RTL.textAlign() }]} numberOfLines={2}>
              {heading}
            </Text>
          )}

          {/* Subheading */}
          {!!subheading && (
            <Text style={[styles.subheading, { textAlign: RTL.textAlign() }]} numberOfLines={2}>
              {subheading}
            </Text>
          )}

          {/* Interactive Floating Pill Badges Row or Action Button */}
          {showBadges && services.length > 0 ? (
            <View style={[styles.servicesContainer, { flexDirection: RTL.rowDir() }]}>
              {services.map((service, index) => {
                const label =
                  service.labelKey ? t(service.labelKey) :
                  (isAr ? (service.labelAr || service.key) : (service.labelEn || service.key));

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleBadgePress(service.route, service.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.badgePill,
                      { backgroundColor: service.color || "rgba(43, 155, 114, 0.35)", flexDirection: RTL.rowDir() },
                    ]}
                  >
                    <Icon
                      name={service.icon || "star"}
                      size={12}
                      color="#FFFFFF"
                      style={RTL.select({ marginLeft: 3 }, { marginRight: 3 })}
                    />
                    <Text style={styles.badgeText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : currentBanner.actionRoute ? (
            <TouchableOpacity
              onPress={() => handleBannerPress(currentBanner)}
              activeOpacity={0.85}
              style={[styles.actionBtn, { flexDirection: RTL.rowDir() }]}
            >
              <Text style={styles.actionBtnText}>{actionText}</Text>
              <Icon
                name={RTL.select("arrow-back", "arrow-forward")}
                size={14}
                color="#002E5A"
                style={RTL.select({ marginRight: 4 }, { marginLeft: 4 })}
              />
            </TouchableOpacity>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>

      {/* Navigation Indicators (Modern Pill Style) */}
      {bannerList.length > 1 && (
        <View style={[styles.indicatorContainer, { flexDirection: RTL.indicatorDir() }]}>
          {bannerList.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleDotPress(i)}
                activeOpacity={0.8}
                style={[
                  styles.indicatorDot,
                  isActive ? styles.indicatorDotActive : styles.indicatorDotInactive,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  imageAndTextContainer: {
    width: "92%",
    height: 220,
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#002E5A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: "#002E5A",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  textsContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "flex-end", // Push all texts and badges to the vignette-protected bottom
  },
  heading: {
    fontSize: 16,
    fontFamily: "CairoBold",
    color: "#FFFFFF",
    marginBottom: 4,
    width: "100%",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subheading: {
    fontSize: 11,
    fontFamily: "Cairo",
    color: "#E2E8F0",
    marginBottom: 12,
    width: "100%",
    lineHeight: 16,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  servicesContainer: {
    width: "100%",
    flexWrap: "wrap",
    gap: 6,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 10,
  },
  actionBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnText: {
    color: "#002E5A",
    fontFamily: "CairoBold",
    fontSize: 11,
  },
  indicatorContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    width: "100%",
    gap: 6,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
  },
  indicatorDotActive: {
    width: 20,
    backgroundColor: "#2B9B72", // Brand Accent Teal
  },
  indicatorDotInactive: {
    width: 8,
    backgroundColor: "#E2E8F0",
  },
});
