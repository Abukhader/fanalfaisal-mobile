import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

/**
 * تحديث الموقع الجغرافي للعميل
 * @param {string} lang - 'ar' or 'en'
 * @param {Object} locationData - { latitude, longitude, address, district, mapUrl }
 * @returns {Promise<Object>} API response
 */
export const updateClientLocation = async (lang = "ar", locationData) => {
  try {
    const lat = Number(locationData.latitude);
    const lng = Number(locationData.longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      (lat === 0 && lng === 0) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new Error("Invalid coordinate values provided.");
    }

    const payload = {
      latitude: lat,
      longitude: lng,
      address: locationData.address || "",
      district: locationData.district || "",
    };

    console.log("📍 [API Call] Updating Client Location with payload:", payload);
    const response = await apiClient.post(
      `/Client/UpdateLocation?Lang=${encodeURIComponent(lang)}`,
      payload
    );

    console.log("✅ [API Success] Client location updated:", response.data);

    // تحديث البيانات المحلية في AsyncStorage
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        const updatedUser = {
          ...parsedUser,
          latitude: lat,
          longitude: lng,
          address: payload.address,
          district: payload.district,
          mapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (storageErr) {
      console.warn("Storage update note:", storageErr);
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ [API Error] Update Client Location failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
