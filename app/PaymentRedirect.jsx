/*import * as SignalR from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { addContract } from "./Api/ContractService";
import { getInvoiceByOrderId } from "./Api/InvoiceService";
import { getFatoorahPaymentStatus } from "./Api/fatoorahApi";
import { addPayment } from "./Api/payment";

const PaymentRedirect = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'failure'
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessedPayment = useRef(false);

  // دالة التحقق من الدفع
  const handlePaymentVerification = async (url) => {
    if (hasProcessedPayment.current || !url) return;
    hasProcessedPayment.current = true;

    const urlParams = new URLSearchParams(url.split("?")[1]);
    const paymentId = urlParams.get("paymentId");
    const storedOrderId = await AsyncStorage.getItem("lastOrderId");
    const storedPaymentMethod = await AsyncStorage.getItem("lastPaymentMethod");

    if (!storedOrderId || !paymentId) {
      console.warn("🚫 تفاصيل الدفع مفقودة. لا يمكن التحقق.");
      setErrorMessage("تفاصيل الدفع مفقودة. لا يمكن التحقق.");
      setStatus("failure");
      return;
    }

    try {
      const res = await getFatoorahPaymentStatus("ar", paymentId);
      console.log("🟢 استجابة التحقق من الدفع:", JSON.stringify(res, null, 2)); // طباعة الرد بتنسيق JSON

      if (res?.success === 1 && res.message === "Paid") {
        const invoiceResponse = await getInvoiceByOrderId("ar", storedOrderId);
        const invoice = invoiceResponse.data;

        if (!invoice?.id || !invoice.order) {
          setErrorMessage("لم يتم العثور على تفاصيل الفاتورة أو الطلب.");
          setStatus("failure");
          return;
        }

        const paymentAmount = Number(invoice.grandTotal);
        const newPaymentRecord = {
          InvoiceId: invoice.id,
          PaymentMethod: storedPaymentMethod || "Online",
          ReferenceId: paymentId,
          Amount: paymentAmount,
          Currency: "SAR",
          Notes: `دفع للطلب رقم #${storedOrderId}`,
          OfficeId: invoice.branch?.officeId,
          BranchId: invoice.branchId,
        };

        // طباعة البيانات المرسلة لإضافة الدفع
        console.log(
          "🟢 إرسال تفاصيل الدفع:",
          JSON.stringify(newPaymentRecord, null, 2)
        );

        await addPayment("ar", newPaymentRecord, false);

        const contractModel = {
          OrderId: storedOrderId,
          ClientId: invoice.clientId,
          OfficeId: invoice.branch?.officeId,
          TotalCost: paymentAmount,
          IsRenewed: false,
          OriginalContractId: null,
          StartDate: invoice.order.startDate,
          EndDate: invoice.order.endDate,
        };

        // طباعة تفاصيل العقد المرسل
        console.log(
          "🟢 إرسال تفاصيل العقد:",
          JSON.stringify(contractModel, null, 2)
        );

        await addContract("ar", contractModel, []);

        await AsyncStorage.removeItem("lastOrderId");
        await AsyncStorage.removeItem("lastPaymentMethod");
        setStatus("success");
        Alert.alert("نجاح", "تمت عملية الدفع بنجاح!");
      } else {
        setErrorMessage(
          res.message || "فشلت عملية الدفع. الرجاء المحاولة مرة أخرى."
        );
        setStatus("failure");
        await AsyncStorage.removeItem("lastOrderId");
        await AsyncStorage.removeItem("lastPaymentMethod");
        Alert.alert("فشل", "فشلت عملية الدفع.");
      }
    } catch (error) {
      console.error("❗ خطأ أثناء التحقق من الدفع:", error);
      setErrorMessage("حدث خطأ غير متوقع أثناء التحقق من الدفع.");
      setStatus("failure");
      await AsyncStorage.removeItem("lastOrderId");
      await AsyncStorage.removeItem("lastPaymentMethod");
      Alert.alert("خطأ", "حدث خطأ غير متوقع.");
    }
  };

  useEffect(() => {
    // التحقق من الرابط عند فتح التطبيق
    Linking.getInitialURL().then((url) => handlePaymentVerification(url));
    Linking.addEventListener("url", (event) =>
      handlePaymentVerification(event.url)
    );

    // === تكامل SignalR ===
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl("http://api.fanalfisal.com.sa/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveWebhookResult", (result) => {
      console.log("وصل إشعار من السيرفر:", JSON.stringify(result, null, 2));
      Alert.alert("وصل Webhook", JSON.stringify(result));

      // إذا كان الإشعار يحتوي على paymentId، قم بالتحقق منه تلقائياً
      if (result.paymentId) {
        handlePaymentVerification(`?paymentId=${result.paymentId}`);
      }
    });

    connection
      .start()
      .then(() => console.log("تم الاتصال بـ NotificationHub"))
      .catch((err) => console.error("خطأ في الاتصال بـ SignalR:", err));

    // تنظيف عند الخروج
    return () => {
      Linking.removeEventListener("url", handlePaymentVerification);
      connection.stop();
    };
  }, []);

  const handleGoToMyOrders = () => {
    navigation.navigate("MyOrdersScreen");
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#003366" />
          <Text style={styles.loadingText}>جاري التحقق من عملية الدفع...</Text>
        </View>
      );
    }

    if (status === "success") {
      return (
        <View style={styles.center}>
          <Text style={styles.successText}>تم إنشاء الدفع والعقد بنجاح.</Text>
          <TouchableOpacity style={styles.button} onPress={handleGoToMyOrders}>
            <Text style={styles.buttonText}>الذهاب إلى طلباتي</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "failure") {
      return (
        <View style={styles.center}>
          <Text style={styles.failureText}>فشلت عملية الدفع.</Text>
          <Text style={styles.failureMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={handleGoToMyOrders}>
            <Text style={styles.buttonText}>الذهاب إلى طلباتي</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#003366",
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
  },
  failureText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
  },
  failureMessage: {
    marginTop: 10,
    color: "#555",
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#a68a5f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PaymentRedirect;*/
