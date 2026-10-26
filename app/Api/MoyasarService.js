import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

/**
 * إنشاء عملية دفع جديدة عبر بوابة ميسر (Moyasar)
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} paymentData - { InvoiceId, Currency, Description, SuccessUrl, CancelUrl }
 * @returns {Promise<Object>} API response: { Success, Message, Data: { PaymentUrl, MoyasarInvoiceId, OrderNum, InvoiceId } }
 */
export const createMoyasarPayment = async (lang = "ar", paymentData) => {
  try {
    await checkInternetConnection();

    console.log(
      "💳 [MOYASAR_API] CreatePayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Moyasar/CreatePayment?Lang=${lang}`,
            lang,
            payload: paymentData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Moyasar/CreatePayment?Lang=${encodeURIComponent(lang)}`,
      paymentData
    );

    console.log(
      "💳 [MOYASAR_API] CreatePayment Response (Success):\n" +
        JSON.stringify(
          {
            status: response.status,
            statusText: response.statusText,
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
      "❌ [MOYASAR_API] CreatePayment Failed:\n" +
        JSON.stringify(
          {
            message: error.message,
            httpStatus: error?.response?.status,
            httpStatusText: error?.response?.statusText,
            responseData: error?.response?.data,
            sentPayload: paymentData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );
    throw error;
  }
};

/**
 * التحقق من حالة عملية الدفع عبر بوابة ميسر
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} checkData - { PaymentId, MoyasarInvoiceId, OrderId }
 * @returns {Promise<Object>} API response with status and order data
 */
export const checkMoyasarPayment = async (lang = "ar", checkData) => {
  try {
    await checkInternetConnection();

    console.log(
      "🔍 [MOYASAR_API] CheckPayment Request:\n" +
        JSON.stringify(
          {
            endpoint: `/Moyasar/CheckPayment?Lang=${lang}`,
            lang,
            payload: checkData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );

    const response = await apiClient.post(
      `/Moyasar/CheckPayment?Lang=${encodeURIComponent(lang)}`,
      checkData
    );

    console.log(
      "📥 [MOYASAR_API] CheckPayment Response:\n" +
        JSON.stringify(
          {
            status: response.status,
            statusText: response.statusText,
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
      "❌ [MOYASAR_API] CheckPayment Failed (Error):\n" +
        JSON.stringify(
          {
            message: error.message,
            httpStatus: error?.response?.status,
            httpStatusText: error?.response?.statusText,
            responseData: error?.response?.data,
            sentPayload: checkData,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
    );
    throw error;
  }
};
