// utils/netInfo.js
import NetInfo from "@react-native-community/netinfo";

export const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  if (state.isConnected) {
    return true;
  } else {
    console.log("No internet connection.");
    throw new Error("لا يوجد اتصال بالإنترنت.");
  }
};
