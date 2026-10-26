import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient"; // تأكد من المسار الصحيح

// ✅ 1. دالة لإضافة طلب جديد
export const addOrder = async (lang, orderData) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.post(`/Order/Add?Lang=${lang}`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error adding order:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ 2. دالة لجلب جميع الطلبات (مع التحقق من الاتصال)
export const getAllOrders = async (
  lang,
  status = null,
  clientId = null,
  officeId = null,
  workerId = null
) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.get(`/Order/GetAll`, {
      params: {
        Lang: lang,
        Status: status,
        ClientId: clientId,
        WorkerId: workerId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ 3. دالة لجلب تفاصيل طلب حسب المعرف (مع التحقق من الاتصال)
export const getOrderById = async (lang, id) => {
  try {
    await checkInternetConnection(); // التحقق من الاتصال بالإنترنت
    const response = await apiClient.get(`/Order/GetById`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching order by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};
