import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkInternetConnection } from "../../utils/netInfo";
import apiClient from "./apiClient";

// جلب جميع العروض حسب اللغة و OfficeId
export const getAllOffers = async (lang, officeId) => {
  try {
    await checkInternetConnection();

    const userToken = await AsyncStorage.getItem("userToken");
    console.log("📡 [Offer/GetAll Request Details]:", {
      url: "https://api.fanalfisal.com.sa/api/Offer/GetAll",
      params: {
        Lang: lang,
        _t: new Date().getTime(),
      },
      headers: {
        Authorization: userToken ? `Bearer ${userToken.substring(0, 15)}...` : "Bootstrap token (attached by interceptor)",
      }
    });

    const response = await apiClient.get(`/Offer/GetAll`, {
      params: {
        Lang: lang,
        _t: new Date().getTime(),
      },
    });

    console.log("📥 [Offer/GetAll Response]:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [Offer/GetAll Request Failed]:", error.response?.data || error.message);
    throw error;
  }
};
