import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// جلب شكاوى العميل الحالي من السيرفر
export const getClientComplaints = async (lang, clientId) => {
  try {
    await checkInternetConnection();
    console.log("🔄 Fetching complaints. Lang:", lang, "ClientId:", clientId);

    const response = await apiClient.get(`/Complaint/GetMyComplaints`, {
      params: {
        Lang: lang,
        ClientId: clientId, // مرسل احتياطاً
      },
    });

    console.log("✅ GetMyComplaints API response status:", response.status);
    console.log("✅ GetMyComplaints API response data:", JSON.stringify(response.data));

    if (response.data && response.data.success === 1) {
      const list = response.data.data || [];
      // خريطة لضمان توافق الحقول مع ما يتوقعه الجزء الأمامي
      const mappedList = list.map((item) => ({
        ...item,
        num: item.complaintNumber || item.num,
        branch: item.branchName || item.branch,
      }));
      return {
        success: 1,
        data: mappedList,
      };
    }

    return response.data || { success: 0, data: [], message: "Failed to fetch" };
  } catch (error) {
    console.error("❌ Error fetching client complaints:", error);
    if (error.response) {
      console.error("❌ Error response status:", error.response.status);
      console.error("❌ Error response data:", JSON.stringify(error.response.data));
    }
    // إرجاع بنية خطأ متوافقة
    return {
      success: 0,
      data: [],
      message: error.response?.data?.message || error.message,
    };
  }
};

// تقديم شكوى أو استفسار أو طلب جديد
export const addComplaint = async (lang, complaintData) => {
  try {
    await checkInternetConnection();
    console.log("🔄 Adding complaint. Lang:", lang, "Payload:", JSON.stringify(complaintData));

    // السيرفر يتوقع: branchId, phone, kind, details
    const payload = {
      clientId: complaintData.clientId, // مرسل احتياطاً
      branchId: complaintData.branchId,
      phone: complaintData.phone,
      kind: complaintData.kind,
      details: complaintData.details,
    };

    const response = await apiClient.post(`/Complaint/Add`, payload, {
      params: {
        Lang: lang,
      },
    });

    console.log("✅ AddComplaint API response status:", response.status);
    console.log("✅ AddComplaint API response data:", JSON.stringify(response.data));

    if (response.data && response.data.success === 1 && response.data.data) {
      const item = response.data.data;
      return {
        success: 1,
        data: {
          ...item,
          num: item.complaintNumber || item.num,
          branch: item.branchName || item.branch,
        },
      };
    }

    return response.data || { success: 0, message: "Failed to submit complaint" };
  } catch (error) {
    console.error("❌ Error submitting complaint:", error);
    if (error.response) {
      console.error("❌ Error response status:", error.response.status);
      console.error("❌ Error response data:", JSON.stringify(error.response.data));
    }
    return {
      success: 0,
      message: error.response?.data?.message || error.message,
    };
  }
};
