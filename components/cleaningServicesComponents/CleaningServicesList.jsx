import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RTL } from "../../utils/rtlHelper";
import createStyles from "./CleaningServicesList.styles";

const CleaningServicesList = () => {
  const { t } = useTranslation();
  const styles = createStyles(); // استدعاء الستايلات الديناميكية

  // مصفوفة البيانات باستخدام مفاتيح الترجمة
  const cleaningServicesData = [
    { key: "floors", icon: "floor-lamp" },
    { key: "exterior", icon: "car-wash" },
    { key: "bathroom", icon: "toilet" },
    { key: "waste", icon: "trash-can-outline" },
    { key: "extra", icon: "plus-circle-outline" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {cleaningServicesData.map((category, index) => (
        <View key={index} style={styles.categoryCard}>
          <View
            style={[styles.categoryHeader, { flexDirection: RTL.rowDir() }]}
          >
            <Icon
              name={category.icon}
              size={28}
              color="#007BFF"
              style={RTL.marginSide(10)}
            />
            <Text
              style={[styles.categoryTitle, { textAlign: RTL.textAlign() }]}
            >
              {t(`cleaning_list.categories.${category.key}.title`)}
            </Text>
          </View>

          <View style={styles.servicesList}>
            {t(`cleaning_list.categories.${category.key}.items`, {
              returnObjects: true,
            }).map((service, sIndex) => (
              <View
                key={sIndex}
                style={[styles.serviceItem, { flexDirection: RTL.rowDir() }]}
              >
                <Icon
                  name="check-circle-outline"
                  size={18}
                  color="#28a745"
                  style={RTL.marginSide(10)}
                />
                <Text
                  style={[styles.serviceText, { textAlign: RTL.textAlign() }]}
                >
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default CleaningServicesList;
