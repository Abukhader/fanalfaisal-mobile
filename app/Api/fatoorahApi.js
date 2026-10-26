import { checkInternetConnection } from "../../utils/netInfo"; // ✅ استيراد الدالة
import apiClient from "./apiClient";

// دالة لبدء الدفع (InitiatePayment)
export const initiateFatoorahPayment = async (lang, invoiceId, currency) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const response = await apiClient.post(`/Fatoorah/InitiatePayment`, null, {
      params: {
        Lang: lang,
        InvoiceId: invoiceId,
        Currency: currency,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error initiating Fatoorah payment:", error);
    throw error;
  }
};

// دالة لتنفيذ الدفع (ExecutePayment)
export const executeFatoorahPayment = async (lang, model) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const response = await apiClient.post(`/Fatoorah/ExecutePayment`, model, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error executing Fatoorah payment:", error);
    throw error;
  }
};

// دالة للتحقق من حالة الدفع (GetPaymentStatus)
export const getFatoorahPaymentStatus = async (lang, paymentId) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const response = await apiClient.post(
      `/Fatoorah/GetPaymentStatus?Lang=${lang}&PaymentId=${paymentId}`,
      null
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Fatoorah payment status:", error);
    throw error;
  }
};

export const checkFatoorahPayment = async (
  lang,
  paymentId,
  orderId,
  paymentMethod
) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.post(`/Fatoorah/CheckPayment`, null, {
      params: {
        Lang: lang,
        PaymentId: paymentId,
        OrderId: orderId,
        PaymentMethod: paymentMethod,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking Fatoorah payment:", error);
    throw error;
  }
};
