import NetInfo from "@react-native-community/netinfo";
import apiClient from "./apiClient";

// دالة للتحقق من الاتصال بالإنترنت
const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

export const getAllWorkers = async (
  lang,
  officeId,
  userId,
  nationalityId,
  religionId,
  jobTitle,
  companyServiceId,
  branchId,
  hasExperience,
  maritalStatus,
  minAge,
  maxAge,
  availabilityStatus = 1,
  page = 1,
  pageSize = 10,
  signal = null
) => {
  try {
    // التحقق من الاتصال بالإنترنت
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.get(`/Worker/GetAll`, {
      params: {
        Lang: lang,
        NationalityId: nationalityId,
        ReligionId: religionId,
        JobTitle: jobTitle,
        CompanyServiceId: companyServiceId,
        BranchId: branchId,
        HasExperience: hasExperience, // ✨ تم التعديل هنا لتطابق الكلمة الصحيحة
        MaritalStatus: maritalStatus,
        MinAge: minAge,
        MaxAge: maxAge,
        Available: availabilityStatus,
        Page: page,
        PageSize: pageSize,
      },
      signal,
    });

    return response.data;
  } catch (error) {
    if (error.name === 'CanceledError' || error.message === 'canceled') {
      // Ignore cancellation errors
      throw error;
    }
    console.error("Error fetching workers:", error);
    throw error;
  }
};

// دالة لجلب بيانات عامل محدد حسب المعرف
export const getWorkerById = async (lang, id) => {
  try {
    // التحقق من الاتصال بالإنترنت
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.get(`/Worker/GetById`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching worker by ID:", error);
    throw error;
  }
};

// دالة لجلب سيرة ذاتية لعامل محدد
export const getWorkerCv = async (lang, id) => {
  try {
    // التحقق من الاتصال بالإنترنت
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const response = await apiClient.get(`/Worker/GetCV`, {
      params: {
        Lang: lang,
        Id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching worker CV:", error);
    throw error;
  }
};
