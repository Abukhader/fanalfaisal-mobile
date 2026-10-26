import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

export const GetAllCompanyService = async (lang) => {
  try {
    await checkInternetConnection();

    const response = await apiClient.get(`/CompanyService/GetAll`, {
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
