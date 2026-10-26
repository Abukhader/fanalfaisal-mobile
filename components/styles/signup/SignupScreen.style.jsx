import { Platform, StyleSheet } from "react-native";
import { RTL } from "../../../utils/rtlHelper"; // استيراد الهيلبر

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "CairoBold",
    marginBottom: 15,
  },
  inputContainer: {
    // flexDirection سيتم تمريره من المكون باستخدام RTL.rowDir()
    alignItems: "center",
    width: "95%",
    height: Platform.OS === "ios" ? 80 : 60,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, .5)",
    marginBottom: 20,
    paddingHorizontal: 10, // استخدام padding أفقي موحد
  },
  input: {
    flex: 1, // العودة لاستخدام flex لملء المساحة بعد الأيقونة
    height: "100%",
    fontSize: 16,
    color: "#333",
    fontFamily: "Cairo",
    // textAlign سيتم تمريره من المكون باستخدام RTL.textAlign()
  },
  inputIcon: {
    // الهامش الجانبي للأيقونة يعتمد على الاتجاه
    ...RTL.select({ marginLeft: 10 }, { marginRight: 10 }),
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, .2)",
    paddingVertical: 15,
    borderRadius: 8,
    width: "95%",
    alignItems: "center",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, .3)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "CairoBold",
  },
  signupText: {
    fontSize: 14,
    color: "white",
    fontFamily: "Cairo",
  },
  link: {
    color: "#339966",
    textDecorationLine: "underline",
    fontFamily: "CairoBold",
    fontSize: 14,
  },
  // أسلوب عرض المحاذاة في المودال
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    width: "85%",
    borderRadius: 15,
    alignItems: "center",
    maxWidth: 400,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
    fontFamily: "Cairo",
    textAlign: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  picker: {
    flex: 1,
    color: "#333",
    backgroundColor: "transparent",
    // المحاذاة الداخلية للـ Picker
    ...RTL.select({ textAlign: "right" }, { textAlign: "left" }),
  },
  pickerItem: {
    fontSize: 16,
    height: Platform.OS === "ios" ? 150 : 50,
    fontFamily: "Cairo",
  },
});

export default styles;
