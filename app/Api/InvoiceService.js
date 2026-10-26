import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// إضافة فاتورة جديدة
export const addInvoice = async (lang, newRecord) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.post(`/Invoice/Add`, newRecord, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding invoice:", error);
    throw error;
  }
};

export const getInvoiceByOrderId = async (lang, orderId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Invoice/GetByOrderId`, {
      params: {
        Lang: lang,
        OrderId: orderId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by OrderId:", error);
    throw error;
  }
};
