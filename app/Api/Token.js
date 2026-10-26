import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";

const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

let activeTokenPromise = null;

export const fetchToken = async () => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error("لا يوجد اتصال بالإنترنت");
    }

    let token = await AsyncStorage.getItem("authToken");

    if (!token) {
      if (activeTokenPromise) {
        return activeTokenPromise;
      }

      activeTokenPromise = (async () => {
        console.log("⚠️ Token not found, fetching new token...");
        const response = await axios.post(
          "https://api.fanalfisal.com.sa/api/Authentication/Login",
          {
            name: "Admin",                 // "Admin"
            pass: process.env.EXPO_PUBLIC_LEGACY_AUTH_PASSWORD,
            Role: "Admin",                 // "Admin"
          },
          {
            headers: {
              "X-Api-Key": process.env.EXPO_PUBLIC_LEGACY_API_KEY,
            },
            timeout: 5000, // ⏱️ مهلة 5 ثواني فقط
          }
        );

        const fetchedToken = response?.data?.data?.token;

        if (!fetchedToken) {
          throw new Error("❌ التوكن غير موجود في الاستجابة");
        }


        await AsyncStorage.setItem("authToken", fetchedToken);
        return fetchedToken;
      })();

      try {
        token = await activeTokenPromise;
      } finally {
        activeTokenPromise = null;
      }
    }

    return token;
  } catch (error) {
    console.error("❌ Failed to fetch token:", error.message);
    throw error;
  }
};

