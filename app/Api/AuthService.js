import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

/**
 * دالة للتحقق من إصدار التطبيق (CheckAppVersion)
 * @param {string} key - المفتاح الخاص بالتشفير أو التحقق
 * @param {object} appData - كائن يحتوي على (Os, Name, Version)
 */
export const checkAppVersion = async (key, appData) => {
  try {
    // ✅ التحقق من وجود اتصال بالإنترنت
    await checkInternetConnection();

    // إرسال طلب POST إلى المسار المحدد
    // نمرر الـ Key كـ Query Parameter والـ appData كـ Body
    const response = await apiClient.post(
      `/Authentication/CheckAppVersion`,
      appData,
      {
        params: {
          Key: key,
        },
      }
    );

    console.log("App Version Check Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error checking app version:", error);
    throw error;
  }
};
