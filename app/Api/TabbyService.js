import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

/**
 * إنشاء عملية دفع جديدة عبر بوابة تابي (Tabby)
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} paymentData - { invoiceId, currency, successUrl, cancelUrl, failureUrl, email, description }
 * @returns {Promise<Object>} API response: { success: 1, message, data: { paymentUrl, tabbyPaymentId, sessionId, checkoutId, orderNum, invoiceId } }
 */
export const createTabbyPayment = async (lang = "ar", paymentData) => {
  try {
    await checkInternetConnection();

    console.log(
      "💳 [TABBY_API] CreatePayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Tabby/CreatePayment?Lang=${lang}`,
            lang,
            payload: paymentData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Tabby/CreatePayment?Lang=${encodeURIComponent(lang)}`,
      paymentData
    );

    console.log(
      "💳 [TABBY_API] CreatePayment Response:\n" +
        JSON.stringify(
          {
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [TABBY_API] CreatePayment Failed:\n",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * التحقق من حالة عملية الدفع وتسويتها عبر بوابة تابي
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} checkData - { tabbyPaymentId, paymentId, orderId }
 * @returns {Promise<Object>} API response: { success: 1, message, data: { ...order } }
 */
export const checkTabbyPayment = async (lang = "ar", checkData) => {
  try {
    await checkInternetConnection();

    console.log(
      "🔍 [TABBY_API] CheckPayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Tabby/CheckPayment?Lang=${lang}`,
            lang,
            payload: checkData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Tabby/CheckPayment?Lang=${encodeURIComponent(lang)}`,
      checkData
    );

    console.log(
      "📥 [TABBY_API] CheckPayment Response:\n" +
        JSON.stringify(
          {
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ [TABBY_API] CheckPayment Failed:\n",
      error?.response?.data || error.message
    );
    throw error;
  }
};
