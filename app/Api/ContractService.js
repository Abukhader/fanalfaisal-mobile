import { checkInternetConnection } from "../../utils/netInfo"; // ✅ استيراد الدالة
import apiClient from "./apiClient";

// دالة لاسترجاع جميع العقود (GetAll)
export const getAllContracts = async (lang, clientId, officeId, workerId) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const response = await apiClient.get(`/Contract/GetAll`, {
      params: {
        Lang: lang,
        ClientId: clientId,
        OfficeId: officeId,
        WorkerId: workerId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};

// دالة لاسترجاع عقد محدد حسب المعرف (GetById)
export const getContractById = async (lang, id) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const response = await apiClient.get(`/Contract/GetById`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contract by ID:", error);
    throw error;
  }
};

// دالة لإضافة عقد جديد (Add)
export const addContract = async (lang, newRecord, files) => {
  try {
    await checkInternetConnection(); // ✅ تحقق من الاتصال

    const formData = new FormData();
    formData.append("NewRecord", JSON.stringify(newRecord));
    files.forEach((file) => {
      formData.append("File", file);
    });

    const response = await apiClient.post(`/Contract/Add`, formData, {
      params: {
        Lang: lang,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding contract:", error);
    throw error;
  }
};

export const renewContract = async (lang, newRecord, files = []) => {
  try {
    await checkInternetConnection();

    const formData = new FormData();

    // السيرفر يتوقع الكائن كـ String داخل NewRecord
    formData.append("NewRecord", JSON.stringify(newRecord));

    // إضافة الملفات إذا وجدت
    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.uri) {
          formData.append("File", {
            uri: file.uri,
            name: file.name || "upload.jpg",
            type: file.type || "image/jpeg",
          });
        }
      });
    }

    const response = await apiClient.post(`/Contract/Renew`, formData, {
      params: { Lang: lang },
      headers: {
        Accept: "application/json",
        // نترك Axios يضيف Content-Type تلقائياً مع boundary
      },
      // هذا الجزء يضمن عدم تلاعب Axios بتنسيق FormData في React Native
      transformRequest: (data, headers) => {
        return data;
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error renewing contract details:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const printContract = async (lang, id) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.post(`/Contract/Print`, null, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data; // سيعيد الكائن الذي يحتوي على success و files
  } catch (error) {
    console.error("Error printing contract:", error);
    throw error;
  }
};
