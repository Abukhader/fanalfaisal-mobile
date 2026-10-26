import AsyncStorage from "@react-native-async-storage/async-storage";

// استرجاع الـ OTP
const getOtp = async () => {
  try {
    const otp = await AsyncStorage.getItem("userOtp");
    return otp;
  } catch (error) {
    console.error("Error retrieving OTP:", error);
  }
};

// استرجاع بيانات المستخدم
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData;
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
  }
};
