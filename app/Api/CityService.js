import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// دالة لاسترجاع جميع المدن (GetAll)
export const GetCities = async (lang) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/City/GetAll`, {
      params: {
        Lang: lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
};
