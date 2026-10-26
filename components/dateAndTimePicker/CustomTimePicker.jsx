// CustomTimePicker.js
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles"; // Import styles

const CustomTimePicker = ({ visible, onClose, onTimeChange, initialTime }) => {
  // Define your allowed time range
  const START_HOUR = 8; // 8 AM
  const END_HOUR = 14; // 2 PM (14:00)

  // Generate hours within the allowed range
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  ); // Generates [8, 9, 10, 11, 12, 13, 14]

  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59

  // Initialize selectedHour/Minute, ensuring it falls within the allowed range
  const initialHour = initialTime
    ? initialTime.getHours()
    : new Date().getHours();
  const initialMinute = initialTime
    ? initialTime.getMinutes()
    : new Date().getMinutes();

  const [selectedHour, setSelectedHour] = useState(() => {
    if (initialHour >= START_HOUR && initialHour <= END_HOUR) {
      return initialHour;
    }
    return START_HOUR; // Default to start hour if initial is outside range
  });
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);

  const handleConfirm = () => {
    onTimeChange(selectedHour, selectedMinute);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.pickerModalContent}>
          <Text style={styles.modalTitle}>اختر الوقت</Text>
          <View style={styles.pickerWheelContainer}>
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const itemHeight = 40;
                const index = Math.round(yOffset / itemHeight);
                setSelectedHour(hours[index] || selectedHour);
              }}
            >
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  onPress={() => setSelectedHour(hour)}
                  style={[
                    styles.pickerItem,
                    selectedHour === hour && styles.selectedPickerItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedHour === hour && styles.selectedPickerItemText,
                    ]}
                  >
                    {String(hour).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const itemHeight = 40;
                const index = Math.round(yOffset / itemHeight);
                setSelectedMinute(minutes[index] || selectedMinute);
              }}
            >
              {minutes.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  onPress={() => setSelectedMinute(minute)}
                  style={[
                    styles.pickerItem,
                    selectedMinute === minute && styles.selectedPickerItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedMinute === minute &&
                        styles.selectedPickerItemText,
                    ]}
                  >
                    {String(minute).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.modalButtonText}>تأكيد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomTimePicker;
