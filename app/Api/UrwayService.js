import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// دالة لإضافة رابط الدفع
export const getPaymentUrl = async (lang, model) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.post(`/Urway/GetPaymentUrl`, model, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payment URL:", error);
    throw error;
  }
};

// دالة للتحقق من حالة الدفع
export const checkPayment = async (lang, model) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.post(`/Urway/CheckPayment`, model, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};
