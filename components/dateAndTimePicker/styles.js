// styles.js
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
    fontFamily: "CairoBold", // Applied CairoBold for modal titles
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    justifyContent: "center",
    textAlign: Platform.OS === "ios" ? "left" : "right",
    fontFamily: "Cairo", // Applied Cairo for input text
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    width: "48%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#003366",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "CairoBold", // Applied CairoBold for modal button text
  },
  calculatedDateText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Cairo", // Applied Cairo for calculated date text
  },
  pickerWheelContainer: {
    flexDirection: "row",
    height: 200,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
  },
  pickerColumn: {
    flex: 1,
    height: "100%",
    marginHorizontal: 5,
  },
  pickerItem: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Cairo", // Applied Cairo for general picker items
  },
  selectedPickerItem: {
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
  },
  selectedPickerItemText: {
    color: "#000",
    fontSize: 20,
    fontFamily: "CairoBold", // Applied CairoBold for selected picker item text
  },
});
