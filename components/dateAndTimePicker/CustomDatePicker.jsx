// CustomDatePicker.js
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles"; // Import styles

const CustomDatePicker = ({ visible, onClose, onDateChange, initialDate }) => {
  // Helper function to safely get date components, defaulting to current date if initialDate is null
  const getInitialDateComponents = (date) => {
    const d = date || new Date(); // Use provided date or current date
    return {
      day: d.getDate(),
      month: d.getMonth() + 1, // Month is 0-indexed in Date, so add 1
      year: d.getFullYear(),
    };
  };

  const initialComponents = getInitialDateComponents(initialDate);

  const [selectedDay, setSelectedDay] = useState(initialComponents.day);
  const [selectedMonth, setSelectedMonth] = useState(initialComponents.month);
  const [selectedYear, setSelectedYear] = useState(initialComponents.year);

  // Function to get the number of days in a given month and year
  // (month here should be 1-indexed for logical input, but will be converted for Date constructor)
  const daysInMonth = (month, year) => {
    // Correctly handle 0-indexed month for Date constructor
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: daysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months are 1-12
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  // EFFECT 1: Adjust day if the selected month/year has fewer days
  useEffect(() => {
    const maxDay = daysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedMonth, selectedYear, selectedDay]); // Add selectedDay to dependencies

  // EFFECT 2: Synchronize internal state when `initialDate` prop changes
  // This is crucial for when the parent component updates `initialDate`
  useEffect(() => {
    const newInitialComponents = getInitialDateComponents(initialDate);
    // Only update if there's a meaningful change to avoid infinite loops
    if (
      newInitialComponents.day !== selectedDay ||
      newInitialComponents.month !== selectedMonth ||
      newInitialComponents.year !== selectedYear
    ) {
      setSelectedDay(newInitialComponents.day);
      setSelectedMonth(newInitialComponents.month);
      setSelectedYear(newInitialComponents.year);
    }
  }, [initialDate]); // Re-run this effect when initialDate prop changes

  const handleConfirm = () => {
    // Subtract 1 from selectedMonth when creating the Date object (0-indexed)
    const newDate = new Date(selectedYear, selectedMonth - 2, selectedDay);
    onDateChange(newDate);
    onClose();
  };

  // Helper to scroll to the initial position
  const scrollToInitial = (scrollViewRef, value, data, itemHeight) => {
    const index = data.indexOf(value);
    if (scrollViewRef.current && index !== -1) {
      // Add padding items to the index calculation
      scrollViewRef.current.scrollTo({
        y: (index + 2) * itemHeight, // +2 for the top padding items
        animated: false,
      });
    }
  };

  const dayScrollRef = React.useRef();
  const monthScrollRef = React.useRef();
  const yearScrollRef = React.useRef();

  // Scroll to initial values when the modal becomes visible
  useEffect(() => {
    if (visible) {
      const itemHeight = 40; // Must match styles.pickerItem.height
      // Wait for a tiny moment for layout to complete
      setTimeout(() => {
        scrollToInitial(dayScrollRef, selectedDay, days, itemHeight);
        scrollToInitial(monthScrollRef, selectedMonth, months, itemHeight);
        scrollToInitial(yearScrollRef, selectedYear, years, itemHeight);
      }, 100); // Small delay to ensure layout is ready
    }
  }, [visible, selectedDay, selectedMonth, selectedYear, days, months, years]); // Depend on relevant states/arrays

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.pickerModalContent}>
          <Text style={styles.modalTitle}>اختر التاريخ</Text>
          <View style={styles.pickerWheelContainer}>
            <ScrollView
              ref={dayScrollRef}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const itemHeight = 40;
                // Adjust index for padding items
                const rawIndex = Math.floor(yOffset / itemHeight);
                const actualIndex = Math.max(
                  0,
                  Math.min(months.length - 1, rawIndex - 2)
                ); // Subtract for top padding items
                if (days[actualIndex] !== undefined) {
                  setSelectedDay(days[actualIndex]);
                }
              }}
            >
              {/* Added empty padding items for better scroll snap effect */}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View key={`pad-day-top-${i}`} style={styles.pickerItem} />
                ))}
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.pickerItem,
                    selectedDay === day && styles.selectedPickerItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedDay === day && styles.selectedPickerItemText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View key={`pad-day-bottom-${i}`} style={styles.pickerItem} />
                ))}
            </ScrollView>
            <ScrollView
              ref={monthScrollRef}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const itemHeight = 40;
                const rawIndex = Math.round(yOffset / itemHeight);
                const actualIndex = rawIndex - 2;
                if (months[actualIndex] !== undefined) {
                  setSelectedMonth(months[actualIndex]);
                }
              }}
            >
              {/* Added empty padding items for better scroll snap effect */}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View key={`pad-month-top-${i}`} style={styles.pickerItem} />
                ))}
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  onPress={() => setSelectedMonth(month)}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && styles.selectedPickerItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedMonth === month && styles.selectedPickerItemText,
                    ]}
                  >
                    {new Date(2000, month - 1, 1).toLocaleDateString("ar-EG", {
                      month: "long",
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View
                    key={`pad-month-bottom-${i}`}
                    style={styles.pickerItem}
                  />
                ))}
            </ScrollView>
            <ScrollView
              ref={yearScrollRef}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const yOffset = event.nativeEvent.contentOffset.y;
                const itemHeight = 40;
                const rawIndex = Math.round(yOffset / itemHeight);
                const actualIndex = rawIndex - 2;
                if (years[actualIndex] !== undefined) {
                  setSelectedYear(years[actualIndex]);
                }
              }}
            >
              {/* Added empty padding items for better scroll snap effect */}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View key={`pad-year-top-${i}`} style={styles.pickerItem} />
                ))}
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => setSelectedYear(year)}
                  style={[
                    styles.pickerItem,
                    selectedYear === year && styles.selectedPickerItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.selectedPickerItemText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
              {Array(2)
                .fill(null)
                .map((_, i) => (
                  <View
                    key={`pad-year-bottom-${i}`}
                    style={styles.pickerItem}
                  />
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

export default CustomDatePicker;
