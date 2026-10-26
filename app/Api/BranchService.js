import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// جلب جميع الفروع حسب اللغة و OfficeId
export const getAllBranches = async (lang, officeId) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Branch/GetAll`, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};
