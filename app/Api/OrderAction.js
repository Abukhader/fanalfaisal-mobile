import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// ✅ 1. جلب جميع الإجراءات حسب اللغة ومعرف الطلب OrderId
export const getAllOrderActions = async (lang, orderId) => {
  try {
    await checkInternetConnection(); // التحقق من الاتصال بالإنترنت
    const response = await apiClient.get(`/OrderAction/GetAll`, {
      params: {
        Lang: lang,
        OrderId: orderId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching order actions:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ 2. جلب إجراء معين حسب المعرف Id
export const getOrderActionById = async (lang, id) => {
  try {
    await checkInternetConnection(); // التحقق من الاتصال بالإنترنت
    const response = await apiClient.get(`/OrderAction/GetById`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching order action by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};
