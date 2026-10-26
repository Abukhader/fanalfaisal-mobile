import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RTL } from "../../utils/rtlHelper";

const InfoItem = ({ iconName, label, value }) => {
  const isRTL = RTL.isRTL;

  return (
    <View style={[styles.infoItem, { flexDirection: RTL.rowDir() }]}>
      {/* أيقونة زجاجية زمردية على شكل Squircle عصري */}
      <View style={styles.iconWrapper}>
        <Icon name={iconName} size={20} color="#2B9B72" />
      </View>

      {/* نصوص مكدسة أفقياً بجانب الأيقونة لتجنب التداخل */}
      <View style={[styles.textContainer, isRTL ? { marginRight: 10 } : { marginLeft: 10 }]}>
        <Text style={[styles.labelText, { textAlign: RTL.textAlign() }]}>
          {label}
        </Text>
        <Text
          style={[styles.valueText, { textAlign: RTL.textAlign() }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoItem: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.75)", // خلية زجاجية مستقلة
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.12)", // إطار زمردي ناعم
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12, // شكل Squircle عصري بدلاً من الدائرة الكاملة التقليدية
    backgroundColor: "rgba(43, 155, 114, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  labelText: {
    fontSize: 10,
    color: "#64748B", // رمادي ناعم للعناوين
    fontFamily: "Cairo",
    marginBottom: 1,
  },
  valueText: {
    fontSize: 13,
    color: "#002E5A", // كحلي ملكي عريض للقيم
    fontFamily: "CairoBold",
  },
});

export default InfoItem;

