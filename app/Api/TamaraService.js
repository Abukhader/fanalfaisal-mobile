import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

/**
 * إنشاء عملية دفع جديدة عبر بوابة تمارا (Tamara)
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} paymentData - { invoiceId, currency, successUrl, cancelUrl, failureUrl, email, description, instalments }
 * @returns {Promise<Object>} API response: { success: 1, message, data: { paymentUrl, tamaraOrderId, checkoutId, orderNum, invoiceId } }
 */
export const createTamaraPayment = async (lang = "ar", paymentData) => {
  try {
    await checkInternetConnection();

    console.log(
      "💳 [TAMARA_API] CreatePayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Tamara/CreatePayment?Lang=${lang}`,
            lang,
            payload: paymentData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Tamara/CreatePayment?Lang=${encodeURIComponent(lang)}`,
      paymentData
    );

    console.log(
      "💳 [TAMARA_API] CreatePayment Response:\n" +
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
      "❌ [TAMARA_API] CreatePayment Failed:\n",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * التحقق من حالة عملية الدفع وتسويتها عبر بوابة تمارا
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} checkData - { tamaraOrderId, paymentId, orderId, invoiceId }
 * @returns {Promise<Object>} API response: { success: 1, message, data: { ...order } }
 */
export const checkTamaraPayment = async (lang = "ar", checkData) => {
  try {
    await checkInternetConnection();

    console.log(
      "🔍 [TAMARA_API] CheckPayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Tamara/CheckPayment?Lang=${lang}`,
            lang,
            payload: checkData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Tamara/CheckPayment?Lang=${encodeURIComponent(lang)}`,
      checkData
    );

    console.log(
      "📥 [TAMARA_API] CheckPayment Response:\n" +
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
      "❌ [TAMARA_API] CheckPayment Failed:\n",
      error?.response?.data || error.message
    );
    throw error;
  }
};
