import apiClient from "./apiClient";

/**
 * جلب جميع وسائل وبوابات الدفع المتاحة لطلب معين
 * @param {string} lang - 'ar' or 'en'
 * @param {string} [orderId] - Optional Order GUID
 * @returns {Promise<Object>} API response
 */
export const getAvailablePaymentMethods = async (lang = "ar", orderId = null) => {
  try {
    const params = { Lang: lang };
    if (orderId) {
      params.OrderId = orderId;
    }
    const response = await apiClient.get("/PaymentMethods/Available", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Get Available Payment Methods failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
