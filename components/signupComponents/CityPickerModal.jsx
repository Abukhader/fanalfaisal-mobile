import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";

const CityPickerModal = ({
  visible,
  onClose,
  cities,
  onSelect,
  selectedCityId,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // فلترة المدن بناءً على نص البحث
  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities;
    return cities.filter((city) => {
      const cityName = city.nameAr || city.name || "";
      return cityName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [cities, searchQuery]);

  // تصفير البحث عند الإغلاق
  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const handleSelect = (id) => {
    onSelect(id);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* خلفية شفافة قابلة للضغط لإغلاق المودال */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* محتوى المودال */}
        <SafeAreaView style={styles.modalContent}>
          {/* شريط السحب (Indicator) */}
          <View style={styles.dragIndicator} />

          {/* الترويسة */}
          <View style={[styles.header, { flexDirection: RTL.rowDir() }]}>
            <Text style={styles.headerTitle}>
              {t("signup.select_city", "اختر المدينة")}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="#002E5A" />
            </TouchableOpacity>
          </View>

          {/* حقل البحث */}
          <View
            style={[styles.searchInputWrapper, { flexDirection: RTL.rowDir() }]}
          >
            <Icon name="search" size={22} color="#64748B" />
            <TextInput
              style={[
                styles.searchInput,
                { textAlign: RTL.textAlign() },
                RTL.marginSide(10),
              ]}
              placeholder={t("signup.search_city", "ابحث عن مدينة...")}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              cursorColor="#2B9B72"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon
                  name="cancel"
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* قائمة المدن */}
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="location-off"
                  size={48}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyText}>
                  {t("signup.no_cities_found", "لم يتم العثور على مدن")}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === selectedCityId;
              const cityName = item.nameAr || item.name;

              return (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    { flexDirection: RTL.rowDir() },
                    isSelected && styles.cityItemSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text
                    style={[
                      styles.cityName,
                      isSelected && styles.cityNameSelected,
                    ]}
                  >
                    {cityName}
                  </Text>
                  {isSelected && (
                    <Icon name="check-circle" size={22} color="#2B9B72" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 46, 90, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    minHeight: "50%",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    elevation: 10,
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  dragIndicator: {
    width: 44,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#002E5A",
  },
  closeButton: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  searchInputWrapper: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    height: "100%",
    fontFamily: "Cairo",
  },
  listContainer: {
    paddingBottom: 20,
  },
  cityItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityItemSelected: {
    backgroundColor: "#EDF7F4",
    borderRadius: 14,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  cityName: {
    fontSize: 15,
    color: "#334155",
    fontFamily: "Cairo",
  },
  cityNameSelected: {
    color: "#2B9B72",
    fontFamily: "CairoBold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    marginTop: 12,
    fontFamily: "Cairo",
  },
});

export default CityPickerModal;
