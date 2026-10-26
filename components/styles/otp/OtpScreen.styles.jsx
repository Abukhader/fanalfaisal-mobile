import { StyleSheet } from "react-native";

const OtpScreenStyles = (currentColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#003366", // استخدم اللون المحدد هنا أيضًا
    },
    logo: {
      width: 150,
      height: 150,
      marginBottom: 20,
    },
    loginText: {
      fontSize: 24,
      color: currentColors.background === "#fff" ? "#333" : "#fff", // استخدام اللون الأنسب بناءً على الوضع
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: "row",
      width: "95%",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    input: {
      width: "20%",
      height: 60,
      borderRadius: 8,
      backgroundColor: "rgba(255, 255, 255, .5)", // استخدام نفس الخلفية المخففة
      textAlign: "center",
      fontSize: 24,
      color: currentColors.text, // نفس اللون النص الذي يناسب الوضع
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, .2)",
    },
    button: {
      width: "95%",
      height: 60,
      backgroundColor: "#003366", // لون الزر متناسق مع الـ tint
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "bold",
      color: currentColors.background === "#fff" ? "#fff" : "#333", // النص بلون مغاير للخلفية
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: currentColors.background, // نفس خلفية modal المتوافقة مع الوضع
      padding: 30,
      width: "80%",
      borderRadius: 15,
      alignItems: "center",
      maxWidth: 400,
    },
    modalText: {
      fontSize: 22,
      marginBottom: 20,
      color: currentColors.text, // نفس اللون النص المناسب للوضع
      textAlign: "center",
    },
    modalButton: {
      width: "50%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: "#003366", // نفس لون الزر المتناسق مع الـ tint
    },
    modalButtonText: {
      fontSize: 20,
      color: "#fff", // دائمًا النص أبيض في الزر
      fontWeight: "bold",
    },
  });
};

export default OtpScreenStyles;
