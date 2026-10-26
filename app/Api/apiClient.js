// api/apiClient.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { fetchToken } from "./Token";


const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.fanalfisal.com.sa/api/",
  timeout: 10000, // ⏱️ مهلة قصوى 10 ثوانٍ لمنع التعليق اللانهائي
});

// ⬅️ Request Interceptor لإضافة التوكن
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userToken = await AsyncStorage.getItem("userToken");

      if (userData && !userToken) {
        console.warn("⚠️ Interceptor: Detected userData but missing userToken (corrupted session). Logging out...");
        await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
        router.replace("/LoginPromptPage");
        return Promise.reject(new Error("Session corrupted: missing token."));
      }

      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
        console.log("🔑 [Token] User Token:\nBearer " + userToken);
      } else {
        const token = await fetchToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("🔑 [Token] Admin / Bootstrap Token:\nBearer " + token);
        }
      }
    } catch (error) {
      console.error("❌ Error attaching token:", error.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⬅️ Response Interceptor لإعادة المحاولة إذا التوكن غير صالح أو تسجيل الخروج
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (userToken) {
          console.warn("User session expired (401), logging out...");
          await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
          router.replace("/login");
          return Promise.reject(error);
        }

        // مسح التوكن القديم
        await AsyncStorage.removeItem("authToken");

        // جلب توكن جديد
        const newToken = await fetchToken();

        // تحديث الهيدر وإعادة تنفيذ الطلب
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (tokenError) {
        console.error("❌ فشل في إعادة جلب التوكن:", tokenError.message);
        return Promise.reject(tokenError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
