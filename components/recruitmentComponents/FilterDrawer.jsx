import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetAllNationalitys } from "../../app/Api/Nationality";
import { GetAllReligions } from "../../app/Api/Religion";
import styles from "./FilterDrawer.styles";

const FilterDrawer = ({
  visible,
  onClose,
  filters,
  setFilters,
  onApplyFilters,
}) => {
  const [nationalities, setNationalities] = useState([]);
  const [religions, setReligions] = useState([]);

  useEffect(() => {
    if (visible) {
      GetAllNationalitys("ar")
        .then((data) => setNationalities(data?.data || []))
        .catch((err) => console.error("Error fetching nationalities:", err));

      GetAllReligions("ar")
        .then((data) => setReligions(data?.data || []))
        .catch((err) => console.error("Error fetching religions:", err));
    }
  }, [visible]);

  const handleReset = () => {
    setFilters({ nationality: "", religion: "", age: "", experience: "" });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={(e) => {
          if (Platform.OS !== "ios") onClose();
        }}
      >
        <View style={styles.drawer} onStartShouldSetResponder={() => true}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>فلترة العاملات</Text>

            {/* الجنسية */}
            <Text style={styles.label}>الجنسية</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.nationality}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, nationality: value }))
                }
                style={styles.picker}
                itemStyle={{
                  color: "#000",
                  fontSize: 16,
                  fontFamily: "Cairo",
                }}
              >
                <Picker.Item label="الكل" value="" />
                {nationalities.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={String(item.nameAr || "")}
                    value={item.id?.toString()}
                  />
                ))}
              </Picker>
            </View>

            {/* الديانة */}
            <Text style={styles.label}>الديانة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.religion}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, religion: value }))
                }
                style={styles.picker}
                itemStyle={{
                  color: "#000",
                  fontSize: 16,
                  fontFamily: "Cairo",
                }}
              >
                <Picker.Item label="الكل" value="" />
                {religions.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={String(item.nameAr || "")}
                    value={item.id?.toString()}
                  />
                ))}
              </Picker>
            </View>

            {/* العمر */}
            <Text style={styles.label}>العمر</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.age}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, age: value }))
                }
                style={styles.picker}
                itemStyle={{
                  color: "#000",
                  fontSize: 16,
                  fontFamily: "Cairo",
                }}
              >
                <Picker.Item label="الكل" value="" />
                <Picker.Item label="أقل من 30" value="<30" />
                <Picker.Item label="من 30 إلى 40" value="30-40" />
                <Picker.Item label="أكثر من 40" value=">40" />
              </Picker>
            </View>

            {/* الخبرة */}
            <Text style={styles.label}>الخبرة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.experience}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, experience: value }))
                }
                style={styles.picker}
                itemStyle={{
                  color: "#000",
                  fontSize: 16,
                  fontFamily: "Cairo",
                }}
              >
                <Picker.Item label="الكل" value="" />
                <Picker.Item label="لم يسبق لها العمل" value="0" />
                <Picker.Item label="سبق لها العمل" value="1" />
              </Picker>
            </View>

            {/* الأزرار */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.closeBtn]}
                onPress={onClose}
              >
                <Icon name="close" size={20} color="#fff" />
                <Text style={styles.btnText}>إغلاق</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.resetBtn]}
                onPress={handleReset}
              >
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.btnText}>إعادة تعيين</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyBtn]}
                onPress={onApplyFilters}
              >
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.btnText}>تطبيق</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterDrawer;
