// i18n.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      const savedLang = await AsyncStorage.getItem("user-language");
      // إذا لم توجد لغة، نستخدم 'ar' مباشرة
      callback(savedLang || "ar");
    } catch (error) {
      callback("ar");
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem("user-language", lng);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: "v3",
    fallbackLng: "ar", // التأكد من وجود لغة احتياطية فورية
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false, // مهم جداً لمنع الـ Flicker في React Native
    },
  });

export default i18n;
