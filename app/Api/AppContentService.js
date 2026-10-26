import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

const CACHE_KEY = "cached_app_content";

export const DEFAULT_MOBILE_APP_CONTENT = {
  importantNotice: {
    isActive: true,
    titleAr: "تنبيه هام",
    titleEn: "Important Notice",
    mobileContentAr:
      "نود التنبيه بأن الشركة غير مسؤولة عن أي مبالغ يتم دفعها خارج منصة مساند أو خارج مقر الشركة، ولا نطلب تحويلات لحسابات شخصية. الرقم الموحد هو 920006629.",
    mobileContentEn:
      "Please note that the company is not responsible for any amounts paid outside the Musaned platform or company premises. The unified number is 920006629.",
    webContentAr:
      "شركة فن الفيصل للتوسط نود التنبيه بأن الشركة غير مسؤولة عن أي مبالغ يتم دفعها خارج منصة مساند أو خارج مقر الشركة. كما نؤكد أن الشركة لا تطلب أي تحويلات إلى حسابات بنكية شخصية، والرقم الموحد للشركة هو 920006629 للوقاية من التعرض لعمليات النصب أو الاحتيال.",
    webContentEn:
      "Fun Al-Faisal Recruitment Company would like to inform you that the company is not responsible for any amounts paid outside the Musaned platform or outside company headquarters.",
    useSameContent: false,
  },
  helpAndSupport: {
    phone: "920006629",
    whatsapp: "0500000000",
    email: "info@fanalfisal.com",
    workingHoursAr: "من الأحد إلى الخميس: 9:00 ص - 6:00 م",
    workingHoursEn: "Sun - Thu: 9:00 AM - 6:00 PM",
  },
  privacyPolicy: {
    titleAr: "سياسة الخصوصية",
    titleEn: "Privacy Policy",
    mobileShortTextAr:
      "نحن في شركة فن الفيصل للاستقدام نلتزم بحماية خصوصية بياناتك ومعلوماتك الشخصية وفق الأنظمة واللوائح المعتمدة بالمملكة العربية السعودية.",
    mobileShortTextEn:
      "At Fan Al-Faisal Recruitment, we are committed to protecting the privacy of your personal data under Saudi regulations.",
    linkToWeb: false,
    webUrl: "https://fanalfisal.com.sa/#/privacy",
  },
  termsAndConditions: {
    titleAr: "الشروط والأحكام",
    titleEn: "Terms & Conditions",
    mobileShortTextAr:
      "تخضع كافة المعاملات والتعاقدات عبر التطبيق لأنظمة العمل والعمال ولوائح وزارة الموارد البشرية والتنمية الاجتماعية.",
    mobileShortTextEn:
      "All transactions and contracts are subject to the labor regulations of the Ministry of Human Resources and Social Development.",
    linkToWeb: false,
    webUrl: "https://fanalfisal.com.sa/#/terms",
  },
};

/**
 * Normalizes backend content object or defaults
 */
function normalizeContent(raw) {
  if (!raw) return DEFAULT_MOBILE_APP_CONTENT;

  return {
    importantNotice: {
      isActive: raw.importantNotice?.isActive !== undefined ? raw.importantNotice.isActive : true,
      titleAr: raw.importantNotice?.titleAr || DEFAULT_MOBILE_APP_CONTENT.importantNotice.titleAr,
      titleEn: raw.importantNotice?.titleEn || DEFAULT_MOBILE_APP_CONTENT.importantNotice.titleEn,
      mobileContentAr:
        raw.importantNotice?.useSameContent
          ? raw.importantNotice?.webContentAr || DEFAULT_MOBILE_APP_CONTENT.importantNotice.mobileContentAr
          : raw.importantNotice?.mobileContentAr || raw.importantNotice?.webContentAr || DEFAULT_MOBILE_APP_CONTENT.importantNotice.mobileContentAr,
      mobileContentEn:
        raw.importantNotice?.useSameContent
          ? raw.importantNotice?.webContentEn || DEFAULT_MOBILE_APP_CONTENT.importantNotice.mobileContentEn
          : raw.importantNotice?.mobileContentEn || raw.importantNotice?.webContentEn || DEFAULT_MOBILE_APP_CONTENT.importantNotice.mobileContentEn,
      useSameContent: !!raw.importantNotice?.useSameContent,
    },
    helpAndSupport: {
      phone: raw.helpAndSupport?.phone || DEFAULT_MOBILE_APP_CONTENT.helpAndSupport.phone,
      whatsapp: raw.helpAndSupport?.whatsapp || DEFAULT_MOBILE_APP_CONTENT.helpAndSupport.whatsapp,
      email: raw.helpAndSupport?.email || DEFAULT_MOBILE_APP_CONTENT.helpAndSupport.email,
      workingHoursAr: raw.helpAndSupport?.workingHoursAr || DEFAULT_MOBILE_APP_CONTENT.helpAndSupport.workingHoursAr,
      workingHoursEn: raw.helpAndSupport?.workingHoursEn || DEFAULT_MOBILE_APP_CONTENT.helpAndSupport.workingHoursEn,
    },
    privacyPolicy: {
      titleAr: raw.privacyPolicy?.titleAr || DEFAULT_MOBILE_APP_CONTENT.privacyPolicy.titleAr,
      titleEn: raw.privacyPolicy?.titleEn || DEFAULT_MOBILE_APP_CONTENT.privacyPolicy.titleEn,
      mobileShortTextAr: raw.privacyPolicy?.mobileShortTextAr || DEFAULT_MOBILE_APP_CONTENT.privacyPolicy.mobileShortTextAr,
      mobileShortTextEn: raw.privacyPolicy?.mobileShortTextEn || DEFAULT_MOBILE_APP_CONTENT.privacyPolicy.mobileShortTextEn,
      linkToWeb: !!raw.privacyPolicy?.linkToWeb,
      webUrl: raw.privacyPolicy?.webUrl || DEFAULT_MOBILE_APP_CONTENT.privacyPolicy.webUrl,
    },
    termsAndConditions: {
      titleAr: raw.termsAndConditions?.titleAr || DEFAULT_MOBILE_APP_CONTENT.termsAndConditions.titleAr,
      titleEn: raw.termsAndConditions?.titleEn || DEFAULT_MOBILE_APP_CONTENT.termsAndConditions.titleEn,
      mobileShortTextAr: raw.termsAndConditions?.mobileShortTextAr || DEFAULT_MOBILE_APP_CONTENT.termsAndConditions.mobileShortTextAr,
      mobileShortTextEn: raw.termsAndConditions?.mobileShortTextEn || DEFAULT_MOBILE_APP_CONTENT.termsAndConditions.mobileShortTextEn,
      linkToWeb: !!raw.termsAndConditions?.linkToWeb,
      webUrl: raw.termsAndConditions?.webUrl || DEFAULT_MOBILE_APP_CONTENT.termsAndConditions.webUrl,
    },
  };
}

/**
 * Fetch app content from API with caching and fallback
 */
export const getAppContent = async (lang = "ar") => {
  // 1. Try to fetch from backend
  try {
    const response = await apiClient.get("AppContent/Get", {
      params: { Lang: lang },
      timeout: 6000,
    });

    if (
      response?.data &&
      (response.data.success === 1 || response.data.Success === 1) &&
      response.data.data
    ) {
      const normalized = normalizeContent(response.data.data);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(response.data.data)).catch(() => {});
      return normalized;
    }
  } catch (error) {
    console.warn("AppContent/Get failed or schema pending on backend. Checking cache/fallback...", error.message);
  }

  // 2. Try to retrieve cached app content
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        return normalizeContent(parsed);
      }
    }
  } catch (cacheErr) {
    console.warn("AsyncStorage cache read error for app content:", cacheErr.message);
  }

  // 3. Fallback
  return DEFAULT_MOBILE_APP_CONTENT;
};

export default {
  getAppContent,
  DEFAULT_MOBILE_APP_CONTENT,
};
