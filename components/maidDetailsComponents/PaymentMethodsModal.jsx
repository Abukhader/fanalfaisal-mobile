import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PaymentMethodsModal = ({
  isVisible,
  onClose,
  paymentMethods,
  onSelectMethod,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>اختر طريقة الدفع</Text>

          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.paymentMethodId}
                style={styles.methodButton}
                onPress={() => onSelectMethod(method.paymentMethodId)}
                activeOpacity={0.7}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: method.imageUrl }}
                    style={styles.methodImage}
                  />
                </View>
                <Text style={styles.methodText}>{method.paymentMethodAr}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>إلغاء</Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(0, 9, 21, 0.45)", // تعتيم زجاجي ناعم للخلفية
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.96)", // حاوية زجاجية ناصعة ومقروءة
    borderRadius: 24,
    padding: 24,
    width: "90%",
    alignItems: "center",
    elevation: 0, // إلغاء الظلال السوداء المزعجة تماماً
    shadowColor: "#2B9B72",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1.2,
    borderColor: "rgba(43, 155, 114, 0.16)",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#002E5A", // كحلي ملكي
    marginBottom: 20,
    textAlign: "center",
  },
  methodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  methodButton: {
    padding: 12,
    margin: 6,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderWidth: 1.2,
    borderColor: "rgba(0, 46, 90, 0.06)",
    borderRadius: 18,
    alignItems: "center",
    width: 105,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  imageWrapper: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    borderRadius: 14,
    marginBottom: 8,
  },
  methodImage: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },
  methodText: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#002E5A",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#666",
  },
});

export default PaymentMethodsModal;

