import apiClient from "./apiClient";

/**
 * 1. جلب نص وبنود إقرار واستلام العاملة للطلب
 * @param {string} lang - 'ar' or 'en'
 * @param {string} orderId - Order GUID
 * @returns {Promise<Object>} API response
 */
export const getHandoverTerms = async (lang = "ar", orderId) => {
  try {
    const response = await apiClient.get("/Handover/GetTerms", {
      params: {
        Lang: lang,
        OrderId: orderId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Get Handover Terms failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 2. طلب إرسال رمز التحقق OTP عبر الواتساب لتأكيد الاستلام
 * @param {string} lang - 'ar' or 'en'
 * @param {string} orderId - Order GUID
 * @returns {Promise<Object>} API response
 */
export const requestHandoverOtp = async (lang = "ar", orderId) => {
  try {
    const response = await apiClient.post(
      `/Handover/RequestOtp?Lang=${encodeURIComponent(lang)}`,
      { orderId }
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Request Handover OTP failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 3. تأكيد وتثبيت إقرار الاستلام برمز التحقق OTP
 * @param {string} lang - 'ar' or 'en'
 * @param {string} orderId - Order GUID
 * @param {string} otp - 6-digit OTP code entered by client
 * @returns {Promise<Object>} API response
 */
export const acceptHandover = async (lang = "ar", orderId, otp) => {
  try {
    const response = await apiClient.post(
      `/Handover/Accept?Lang=${encodeURIComponent(lang)}`,
      {
        orderId,
        otp,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Accept Handover failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
