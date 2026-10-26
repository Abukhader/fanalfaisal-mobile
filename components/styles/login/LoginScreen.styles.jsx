import { Platform, StyleSheet } from "react-native"; // استيراد Platform هنا

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // إضافة مسافة علوية للمحتوى لكي لا يختفي تحت الـ AppBar
    paddingTop: Platform.OS === "ios" ? 80 + 20 : 56 + 20, // ارتفاع الـ AppBar + padding إضافي
  },
  appBarHeader: {
    // تم دمج أنماط الـ AppBar هنا
    backgroundColor: "#003366", // نفس لون خلفية الشاشة
    elevation: 0, // إزالة الظل في الأندرويد
    shadowOpacity: 0, // إزالة الظل في iOS
    height: Platform.OS === "ios" ? 80 : 56, // ارتفاع مناسب للـ Appbar
    paddingTop: Platform.OS === "ios" ? 30 : 0, // مسافة علوية لـ iOS
    width: "100%", // تأكد من أن الشريط يأخذ العرض الكامل
    position: "absolute", // لجعله يطفو فوق المحتوى
    top: 0,
    left: 0,
    zIndex: 10, // لضمان ظهوره فوق العناصر الأخرى
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 24,
    color: "white",
    fontFamily: "CairoBold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    width: "95%",
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, .5)",
    marginBottom: 20,
    alignItems: "center",
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    width: "90%",
    height: "100%",
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "95%",
    height: 60,
    backgroundColor: "rgba(255, 255, 255, .2)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "CairoBold",
    color: "#ddd",
  },
  signupText: {
    color: "white",
    marginTop: 10,
    fontFamily: "Cairo",
  },
  link: {
    color: "#339966",
    textDecorationLine: "underline",
    fontFamily: "CairoBold",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    width: "80%",
    borderRadius: 15,
    alignItems: "center",
    maxWidth: 400,
  },
  modalText: {
    fontSize: 22,
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  modalButton: {
    width: "50%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    zIndex: 20,
  },
});

export default styles;
