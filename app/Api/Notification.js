import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// دالة لجلب جميع الإشعارات
export const getNotifications = async (lang, userId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Notification/GetAll`, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getNotificationsByClientId = async (lang, clientId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Notification/GetByClientId`, {
      params: {
        Lang: lang,
        ClientId: clientId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications by user ID:", error);
    throw error;
  }
};

// دالة لجلب إشعارات بناءً على الـ UserId
export const getNotificationsByUserId = async (lang, userId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Notification/GetByUserId`, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications by user ID:", error);
    throw error;
  }
};

// دالة لجلب إشعار بناءً على الـ ID
export const getNotificationById = async (lang, id) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Notification/GetById`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notification by ID:", error);
    throw error;
  }
};

// دالة لتغيير حالة القراءة للإشعار
export const markNotificationAsRead = async (lang, id, clientId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.post(`/Notification/MarkAsRead`, null, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
