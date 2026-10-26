import { checkInternetConnection } from "../../utils/netInfo"; // ✅ استيراد الدالة
import apiClient from "./apiClient";

export const getAllDeliveryZones = async (lang, officeId) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.get(`/DeliveryZone/GetAll`, {
      params: { Lang: lang },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    throw error;
  }
};

export const getDeliveryZoneById = async (lang, id) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.get(`/DeliveryZone/GetById`, {
      params: { Lang: lang, Id: id },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching delivery zone by ID:", error);
    throw error;
  }
};

export const getDeliveryZonesByBranchId = async (lang, branchId) => {
  try {
    await checkInternetConnection();
    const response = await apiClient.get(`/DeliveryZone/GetByBranchId`, {
      params: { Lang: lang, BranchId: branchId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching delivery zones by branch ID:", error);
    throw error;
  }
};
