import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// دالة لاسترجاع جميع العمال (GetAll)
export const GetAllReligions = async (lang) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/Religion/GetAll`, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching workers:", error);
    throw error;
  }
};
