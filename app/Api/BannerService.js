import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

// Import preset slide images from assets
import Img1 from "@/assets/images/s-h-banner-img.jpg";
import Img2 from "@/assets/images/slide1.png";
import Img3 from "@/assets/images/slide3.png";

const CACHE_KEY = "cached_active_banners";

export const PRESET_IMAGES = {
  preset_1: Img1,
  preset_2: Img2,
  preset_3: Img3,
  "1": Img1,
  "2": Img2,
  "3": Img3,
};

export const DEFAULT_MOBILE_BANNERS = [
  {
    id: "default-1",
    src: Img1,
    imageUrl: null,
    defaultPresetKey: "preset_1",
    headingKey: "banner.b1_title",
    subheadingKey: "banner.b1_sub",
    titleAr: "شركة فن الفيصل للاستقدام",
    titleEn: "Fan Al Faisal Recruitment Company",
    subTitleAr: "أفضل اختيار للحصول على أفضل الخدمات بأقل الأسعار",
    subTitleEn: "Your best choice for the best services at the lowest prices",
    actionRoute: "/recruitment",
    services: [
      { labelKey: "banner.services.mediation", labelAr: "توسط", labelEn: "Mediation", route: "/recruitment", key: "توسط", icon: "assignment-ind", color: "rgba(43, 155, 114, 0.25)" },
      { labelKey: "banner.services.monthly", labelAr: "شهري", labelEn: "Monthly", route: "/monthlyContracts", key: "شهري", icon: "calendar-today", color: "rgba(0, 46, 90, 0.3)" },
      { labelKey: "banner.services.hourly", labelAr: "ساعة", labelEn: "Hourly", route: "/hourlyServices", key: "ساعة", icon: "alarm", color: "rgba(198, 164, 126, 0.35)" },
      { labelKey: "banner.services.cleaning", labelAr: "تنظيف", labelEn: "Cleaning", route: "/cleaning", key: "تنظيف", icon: "cleaning-services", color: "rgba(43, 155, 114, 0.25)" },
    ],
  },
  {
    id: "default-2",
    src: Img2,
    imageUrl: null,
    defaultPresetKey: "preset_2",
    headingKey: "banner.b2_title",
    subheadingKey: "banner.b2_sub",
    titleAr: "خدمات توسط عالمية",
    titleEn: "Global Mediation Services",
    subTitleAr: "حلول متكاملة لتلبية احتياجاتك",
    subTitleEn: "Comprehensive solutions to meet your needs",
    actionRoute: "/recruitment",
    services: [
      { labelKey: "banner.services.consulting", labelAr: "استشارات", labelEn: "Consulting", route: "/recruitment", key: "توسط", icon: "question-answer", color: "rgba(198, 164, 126, 0.35)" },
      { labelKey: "banner.services.fast", labelAr: "سريع", labelEn: "Fast", route: "/recruitment", key: "توسط", icon: "offline-bolt", color: "rgba(0, 46, 90, 0.3)" },
      { labelKey: "banner.services.skilled", labelAr: "ذوي خبرة", labelEn: "Skilled", route: "/recruitment", key: "توسط", icon: "star", color: "rgba(43, 155, 114, 0.25)" },
      { labelKey: "banner.services.support", labelAr: "دعم مستمر", labelEn: "Support", route: "/recruitment", key: "توسط", icon: "support-agent", color: "rgba(0, 46, 90, 0.3)" },
    ],
  },
  {
    id: "default-3",
    src: Img3,
    imageUrl: null,
    defaultPresetKey: "preset_3",
    headingKey: "banner.b3_title",
    subheadingKey: "banner.b3_sub",
    titleAr: "خدمات المقيمة الشهري وبالساعة",
    titleEn: "Monthly and Hourly Resident Services",
    subTitleAr: "أحدث الحلول التي تناسب احتياجاتك المختلفة",
    subTitleEn: "The latest solutions to meet your diverse needs",
    actionRoute: "/monthlyContracts",
    services: [
      { labelKey: "banner.services.monthly", labelAr: "شهري", labelEn: "Monthly", route: "/monthlyContracts", key: "شهري", icon: "calendar-today", color: "rgba(0, 46, 90, 0.3)" },
      { labelKey: "banner.services.hourly", labelAr: "ساعة", labelEn: "Hourly", route: "/hourlyServices", key: "ساعة", icon: "alarm", color: "rgba(198, 164, 126, 0.35)" },
      { labelKey: "banner.services.custom", labelAr: "مخصص", labelEn: "Custom", route: "/monthlyContracts", key: "شهري", icon: "dashboard-customize", color: "rgba(43, 155, 114, 0.25)" },
      { labelKey: "banner.services.quality", labelAr: "جودة", labelEn: "Quality", route: "/monthlyContracts", key: "شهري", icon: "verified", color: "rgba(0, 46, 90, 0.3)" },
    ],
  },
];

/**
 * Normalizes raw banner objects from backend or cache to uniform mobile UI structure
 */
function normalizeBanners(rawList) {
  const fallbackImages = [Img1, Img2, Img3];

  return rawList.map((item, index) => {
    // 1. Resolve image source (uploaded remote URL vs local preset image)
    let imageSource = null;
    let isRemote = false;

    if (item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"))) {
      imageSource = { uri: item.imageUrl };
      isRemote = true;
    } else if (item.defaultPresetKey && PRESET_IMAGES[item.defaultPresetKey]) {
      imageSource = PRESET_IMAGES[item.defaultPresetKey];
    } else {
      imageSource = fallbackImages[index % fallbackImages.length];
    }

    // 2. Default service badges if item doesn't specify custom ones
    const defaultServices = DEFAULT_MOBILE_BANNERS[index % DEFAULT_MOBILE_BANNERS.length].services;

    return {
      id: item.id || `banner-${index}`,
      src: imageSource,
      isRemote,
      imageUrl: item.imageUrl || null,
      defaultPresetKey: item.defaultPresetKey || `preset_${(index % 3) + 1}`,
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || item.titleAr || "",
      subTitleAr: item.subTitleAr || "",
      subTitleEn: item.subTitleEn || item.subTitleAr || "",
      actionRoute: item.actionRoute || "/recruitment",
      actionTextAr: item.actionTextAr || "اطلع على العاملات",
      actionTextEn: item.actionTextEn || "Explore Workers",
      showBadges: item.showBadges !== undefined ? item.showBadges : true,
      services: item.services && item.services.length > 0 ? item.services : defaultServices,
    };
  });
}

/**
 * Fetch active banners from API with cache-first and fallback-always strategy
 */
export const getActiveBanners = async (lang = "ar") => {
  // 1. Try to fetch from backend
  try {
    const response = await apiClient.get("Banner/GetActive", {
      params: { Lang: lang },
      timeout: 6000,
    });

    if (
      response?.data &&
      (response.data.success === 1 || response.data.Success === 1) &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      const normalized = normalizeBanners(response.data.data);
      // Cache valid result in AsyncStorage
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(response.data.data)).catch(() => {});
      return normalized;
    }
  } catch (error) {
    console.warn("Banner/GetActive failed or schema pending on backend. Checking cache/fallback...", error.message);
  }

  // 2. Try to retrieve cached banners
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeBanners(parsed);
      }
    }
  } catch (cacheErr) {
    console.warn("AsyncStorage cache read error for banners:", cacheErr.message);
  }

  // 3. Fallback to hardcoded default banners
  return DEFAULT_MOBILE_BANNERS;
};

export default {
  getActiveBanners,
  DEFAULT_MOBILE_BANNERS,
  PRESET_IMAGES,
};
