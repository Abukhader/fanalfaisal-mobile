import apiClient from "./apiClient";

/**
 * إنشاء عملية دفع جديدة عبر بوابة Dinero
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} paymentData - { invoiceId, amount, customerName, customerEmail, customerPhone, returnUrl }
 * @returns {Promise<Object>} API response with checkoutUrl / invoiceId
 */
export const createPayment = async (lang = "ar", paymentData) => {
  try {
    const response = await apiClient.post(
      `/Payment/Pay?Lang=${encodeURIComponent(lang)}`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Create Dinero Payment failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * فحص وتأكيد حالة عملية الدفع
 * @param {string} lang - 'ar' or 'en'
 * @param {string} paymentId - Payment transaction ID
 * @returns {Promise<Object>} API response with status
 */
export const getPaymentStatus = async (lang = "ar", paymentId) => {
  try {
    const response = await apiClient.get(
      `/Payment/Status?Lang=${encodeURIComponent(lang)}&PaymentId=${encodeURIComponent(paymentId)}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Get Dinero Payment Status failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
