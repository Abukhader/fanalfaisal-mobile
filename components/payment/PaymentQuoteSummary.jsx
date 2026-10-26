import { View, Text, StyleSheet } from "react-native";

export default function PaymentQuoteSummary({ quote, isRTL, changed = false }) {
  const text = (ar, en) => isRTL ? ar : en;
  const format = (value) => new Intl.NumberFormat(isRTL ? "ar-SA" : "en-SA", { style: "currency", currency: "SAR" }).format(value);
  if (!quote) return <Text accessibilityRole="alert" style={styles.error}>{text("تفاصيل المبلغ غير متاحة. حدّث وسائل الدفع قبل المتابعة.", "Pricing is unavailable. Refresh payment methods before continuing.")}</Text>;
  return <View accessibilityLiveRegion="polite" style={styles.container}>
    {changed && <Text accessibilityRole="alert" style={styles.notice}>{text("تغيّر مبلغ الدفع. راجع التفاصيل الجديدة ثم أكّد المتابعة.", "The payment amount changed. Review the updated details and confirm to continue.")}</Text>}
    {[[text("المبلغ المستحق", "Amount due"), quote.base], [text(`رسوم خدمة (${quote.percent}٪)`, `Service fee (${quote.percent}%)`), quote.fee], [text("الإجمالي المطلوب دفعه", "Total to pay"), quote.total]].map(([label, value], index) => (
      <View key={index} style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }, index === 2 && styles.total]}>{label}</Text>
        <Text style={[styles.value, index === 2 && styles.total]}>{format(value)}</Text>
      </View>
    ))}
  </View>;
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  row: { justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 5 },
  label: { flex: 1, color: "#475569", fontSize: 14 },
  value: { color: "#334155", fontSize: 15 },
  total: { fontWeight: "700", color: "#002E5A" },
  error: { color: "#B91C1C", paddingVertical: 12 },
  notice: { color: "#92400E", paddingVertical: 10 },
});
