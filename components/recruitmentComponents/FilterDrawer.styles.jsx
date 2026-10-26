import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  drawer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: Platform.OS === "ios" ? 25 : 20,
    paddingHorizontal: 20,
    width: width * 0.9,
    maxHeight: height * 0.85,
    direction: "rtl",
    textAlign: "right",
    paddingBottom: 30, // ← مضاف لتحسين التمرير
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    fontSize: 22,
    fontFamily: "CairoBold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontFamily: "CairoBold",
    marginTop: 15,
    marginBottom: 5,
    color: "#555",
    textAlign: "right",
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        height: 40,
        paddingHorizontal: 5,
        paddingVertical: 5,
      },
      android: {
        height: 40,
        paddingHorizontal: 0,
      },
    }),
  },
  picker: {
    fontFamily: "Cairo",
    width: "100%",
    color: "#000", // ← مضاف للوضوح في iOS و Android
    ...Platform.select({
      ios: {
        height: "100%",
      },
    }),
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    flexWrap: "wrap",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: 100,
  },
  closeBtn: {
    backgroundColor: "#f44336",
  },
  resetBtn: {
    backgroundColor: "#ff9800",
  },
  applyBtn: {
    backgroundColor: "#4CAF50",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "CairoBold",
    marginLeft: 5,
  },
});

export default styles;
