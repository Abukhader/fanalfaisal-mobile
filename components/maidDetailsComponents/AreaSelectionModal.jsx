import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RTL } from "../../utils/rtlHelper";

const AreaSelectionModal = ({
  visible,
  onClose,
  deliveryAreas = [],
  searchQuery,
  setSearchQuery,
  selectedArea,
  setSelectedArea,
}) => {
  const { t } = useTranslation();

  // ✨ التعديل: الاعتماد على area.name فقط للبحث
  const filteredDeliveryAreas = deliveryAreas.filter((area) => {
    const areaName = area.name || "";
    return areaName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View
            style={[styles.areaModalHeader, { flexDirection: RTL.rowDir() }]}
          >
            <Text style={styles.modalTitle}>
              {t("order_modal.select_area", "اختر منطقة التوصيل")}
            </Text>
            <TouchableOpacity style={styles.closeButtonIcon} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            style={[styles.searchInput, { textAlign: RTL.textAlign() }]}
            placeholder={t("order_modal.search_area", "ابحث عن منطقة...")}
            placeholderTextColor="rgba(0, 46, 90, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Results List */}
          <ScrollView
            style={{ width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            {filteredDeliveryAreas.map((area, index) => {
              const isSelected = selectedArea?.id === area.id;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.areaListItem,
                    { flexDirection: RTL.rowDir() },
                    isSelected && styles.areaListItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedArea(area);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.areaItemName,
                      isSelected && { color: "#ffffff" },
                    ]}
                  >
                    {area.name}
                  </Text>
                  <Text
                    style={[
                      styles.areaItemPrice,
                      isSelected && { color: "#ffffff" },
                    ]}
                  >
                    {area.deliveryFee || 0} {t("common.currency")}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {filteredDeliveryAreas.length === 0 && (
              <Text style={styles.noResultsText}>
                {t("common.no_results", "لا توجد نتائج مطابقة")}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 9, 21, 0.45)", // تعتيم زجاجي ناعم
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.96)", // حاوية زجاجية ناصعة ومقروءة
    borderRadius: 24,
    padding: 24,
    width: "90%",
    height: "70%",
    alignItems: "center",
    elevation: 0, // إلغاء الظلال الداكنة
    shadowColor: "#2B9B72",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.2,
    borderColor: "rgba(43, 155, 114, 0.16)",
  },
  areaModalHeader: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#002E5A", // كحلي ملكي
  },
  closeButtonIcon: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#2B9B72", // أخضر زمردي
  },
  searchInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontFamily: "Cairo",
    marginBottom: 15,
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    color: "#002E5A",
  },
  areaListItem: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.04)",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: "100%",
    borderRadius: 14,
    marginBottom: 10,
  },
  areaListItemSelected: {
    backgroundColor: "#002E5A", // كحلي ملكي للتحديد
    borderColor: "#2B9B72",
    borderWidth: 1.2,
  },
  areaItemName: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#002E5A",
  },
  areaItemPrice: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#2B9B72", // أخضر زمردي
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Cairo",
    color: "#888",
  },
});

export default AreaSelectionModal;

