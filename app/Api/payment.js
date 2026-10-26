import { checkInternetConnection } from "../../utils/netInfo"; // ✅ استيراد الدالة
import apiClient from "./apiClient";

// دالة لإضافة دفعة جديدة (Payment/Add)
export const addPayment = async (lang, newRecord, isCash) => {
  try {
    await checkInternetConnection(); // ✅ التحقق من الاتصال

    const response = await apiClient.post(`/Payment/Add`, newRecord, {
      params: {
        Lang: lang,
        Cash: isCash,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
};
