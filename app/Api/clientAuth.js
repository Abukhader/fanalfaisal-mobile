import NetInfo from "@react-native-community/netinfo"; // استيراد مكتبة NetInfo
import { fetchToken } from "./Token";
import apiClient from "./apiClient";

// دالة للتحقق من الاتصال بالإنترنت
const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// دالة للتسجيل
export const registerClient = async (lang = "ar", phone) => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.post(
      `/Client/Register`,
      null, // لا يوجد جسم (body) في الطلب
      {
        params: {
          Lang: lang,
          Phone: phone,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error registering client:", error);
    throw error;
  }
};

// دالة لإضافة عميل جديد
export const addClient = async (lang = "ar", newRecord) => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.post(`/Client/Add`, newRecord, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding new client:", error);
    throw error;
  }
};

// دالة لتسجيل الدخول
export const UserLogin = async (lang = "ar", phone) => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const token = await fetchToken(); // جلب التوكن عند الحاجة
    const response = await apiClient.post(
      "/Client/Login", // تأكد من الـ URL الصحيح
      null, // لا يوجد جسم (body) في الطلب
      {
        params: {
          Lang: lang,
          Phone: phone,
        },
        headers: {
          Authorization: `Bearer ${token}`, // تمرير التوكن في رأس الطلب
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// دالة لإرسال OTP
export const sendOtp = async (lang = "ar", phone) => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.post(
      `/Client/SendOtp`,
      null, // لا يوجد جسم (body) في الطلب
      {
        params: {
          Lang: lang,
          Phone: phone,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// دالة للتحقق من رمز التحقق (Validate OTP)
export const validateOtp = async (lang = "ar", phone, otp) => {
  try {
    // 1. التحقق من الاتصال بالإنترنت
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    // 2. إرسال طلب التحقق إلى السيرفر
    const response = await apiClient.post(
      `/Client/ValidateOtp`,
      null, // لا يوجد جسم (body) للطلب بناءً على نمط الدوال السابقة لديك
      {
        params: {
          Lang: lang,
          Phone: phone,
          Otp: otp,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error validating OTP:", error);
    throw error;
  }
};
