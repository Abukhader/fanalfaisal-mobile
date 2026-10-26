// CustomDateTimePicker.js
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomDateTimePicker = ({
  isVisible,
  mode,
  value,
  onCancel,
  onConfirm,
  onChange,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.pickerContent}>
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="inline"
            onChange={onChange}
            style={styles.picker}
            // ✅ هذا هو الحل الجذري: استخدام خاصية textColor لـ iOS
            textColor="black"
          />
          <TouchableOpacity onPress={onConfirm} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>تم</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  pickerContent: {
    backgroundColor: "#000",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 350,
    justifyContent: "center",
  },
  picker: {
    backgroundColor: "#000",
    // ✅ إزالة خاصية color من هنا لأن textColor هي الأولوية
    // color: "black",
    flex: 1,
  },
  doneButton: {
    alignItems: "flex-end",
    padding: 10,
  },
  doneButtonText: {
    color: "blue",
    fontSize: 16,
  },
});

export default CustomDateTimePicker;
