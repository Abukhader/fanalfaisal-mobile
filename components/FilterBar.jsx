import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  I18nManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { RTL } from "../utils/rtlHelper";

// ✨ استيرادات الـ API
import { getAllBranches } from "../app/Api/BranchService";
import { GetAllNationalitys } from "../app/Api/Nationality";
import { GetAllReligions } from "../app/Api/Religion";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// الإحداثيات الدائرية المحددة للـ 5 أزرار مع نصف قطر متعرج (Staggered Orbit) لمنع تداخل النصوص
const RADIAL_OFFSETS = [
  { dx: 0, dy: -1, r: 175 },       // الزر 0: للأعلى مباشرة (مدار خارجي)
  { dx: 0.38, dy: -0.92, r: 125 },  // الزر 1: (مدار داخلي)
  { dx: 0.71, dy: -0.71, r: 175 },  // الزر 2: مائل بزاوية (مدار خارجي)
  { dx: 0.92, dy: -0.38, r: 125 },  // الزر 3: (مدار داخلي)
  { dx: 1, dy: 0, r: 175 },         // الزر 4: لليسار مباشرة (مدار خارجي)
];

const FilterBar = ({ filters, setFilters }) => {
  const { t, i18n } = useTranslation();
  const [nationalities, setNationalities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activePicker, setActivePicker] = useState(null);

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // جلب البيانات بناءً على اللغة الحالية
    GetAllNationalitys(i18n.language).then((data) =>
      setNationalities(data?.data || [])
    );
    GetAllReligions(i18n.language).then((data) =>
      setReligions(data?.data || [])
    );

    const officeId = "0c443f1f-eeeb-456a-bd82-c857510d9c4d";
    getAllBranches(i18n.language, officeId)
      .then((data) => {
        setBranches(data?.data || []);
      })
      .catch((error) => {
        console.error("Error fetching branches for FilterBar:", error);
      });
  }, [i18n.language]);

  // تعريف الفلاتر وأيقوناتها وبياناتها
  const FILTER_TYPES = [
    { key: "branchId", labelKey: "filter.branch", icon: "store-marker-outline", items: branches },
    { key: "nationality", labelKey: "filter.nationality", icon: "flag-outline", items: nationalities },
    { key: "religion", labelKey: "filter.religion", icon: "moon-waning-crescent", items: religions },
    {
      key: "age",
      labelKey: "filter.age",
      icon: "account-outline",
      items: [
        { label: t("filter.age_options.under_30"), value: "<30" },
        { label: t("filter.age_options.30_40"), value: "30-40" },
        { label: t("filter.age_options.over_40"), value: ">40" },
      ],
    },
    {
      key: "experience",
      labelKey: "filter.experience",
      icon: "trophy-outline",
      items: [
        { label: t("filter.exp_options.new"), value: "0" },
        { label: t("filter.exp_options.experienced"), value: "1" },
      ],
    },
  ];

  // حساب عدد الفلاتر النشطة حالياً
  const activeCount = Object.keys(filters).reduce((acc, key) => {
    if (key !== "serviceId" && filters[key] !== "" && filters[key] !== null) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setIsOpen(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  };

  const closeMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(animation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  };

  const handleSelectOption = (type, itemValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setFilters({
      ...filters,
      [type]: itemValue,
    });
    setActivePicker(null);
    closeMenu(); // إغلاق المدار بمجرد اختيار الفلتر لرؤية النتائج فوراً
  };

  const handleReset = () => {
    if (activeCount === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setFilters({
      nationality: "",
      religion: "",
      age: "",
      experience: "",
      branchId: "",
      serviceId: filters.serviceId, // الحفاظ على نوع الخدمة الحالي
    });
    closeMenu();
  };

  // تحريكات زر إعادة التعيين (مدار داخلي مائل بزاوية 135 وبمسافة 76 بكسل)
  const resetTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1 * 0.71 * 76],
  });

  const resetTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -0.71 * 76],
  });

  const resetScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  // تحريكات الزر الرئيسي (دوران وتكبير)
  const fabRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  });

  const fabScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  // في الهواتف التي لغة نظامها عربية (isRTL = true)، يقوم React Native بعكس اليمين واليسار تلقائياً.
  // لذا نحدد الموضع بحيث يبقى الزر دائماً على اليمين الحقيقي وتفتح القوائم نحو الداخل بشكل سليم.
  const isRTL = I18nManager.isRTL;
  const fabPositionStyle = isRTL ? { left: 20 } : { right: 20 };
  const subButtonPositionStyle = isRTL ? { left: 18 } : { right: 18 };
  const badgePositionStyle = isRTL ? { left: -4 } : { right: -4 };

  return (
    <View style={styles.fullscreenContainer} pointerEvents="box-none">
      {/* خلفية التعتيم الشفافة عند فتح المدار */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
          onPress={closeMenu}
        >
          <Animated.View style={[styles.backdrop, { opacity: animation }]} />
        </TouchableOpacity>
      )}

      {/* أزرار الفلاتر المدارية الدائرية */}
      {isOpen &&
        FILTER_TYPES.map((item, index) => {
          const isFilterActive =
            filters[item.key] !== "" && filters[item.key] !== null;

          // إيجاد الاسم المختار لعرضه كعنوان تحت الأيقونة
          const selectedItem = item.items.find(
            (i) => (i.id?.toString() || i.value) === filters[item.key]
          );
          const displayLabel = selectedItem
            ? (i18n.language === "ar" ? selectedItem.nameAr : selectedItem.nameEn) ||
              selectedItem.label ||
              selectedItem.name
            : t(item.labelKey);

          // حساب الإزاحة الخاصة بكل زر بناءً على نصف القطر المتعرج والتحريك
          const buttonRadius = RADIAL_OFFSETS[index].r;

          const subButtonTranslateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -1 * RADIAL_OFFSETS[index].dx * buttonRadius],
          });

          const subButtonTranslateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, RADIAL_OFFSETS[index].dy * buttonRadius],
          });

          const subButtonScale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          });

          const subButtonRotate = animation.interpolate({
            inputRange: [0, 1],
            outputRange: ["-180deg", "0deg"],
          });

          return (
            <Animated.View
              key={item.key}
              style={[
                styles.subButtonContainer,
                subButtonPositionStyle,
                {
                  transform: [
                    { translateX: subButtonTranslateX },
                    { translateY: subButtonTranslateY },
                    { scale: subButtonScale },
                    { rotate: subButtonRotate },
                  ],
                  opacity: animation,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.subButtonOrb,
                  isFilterActive ? styles.activeSubButtonOrb : {},
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setActivePicker(item.key);
                }}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={isFilterActive ? "#FFFFFF" : "#2B9B72"}
                />
              </TouchableOpacity>

              {/* بطاقة النص العائمة تحت الأيقونة المدارية */}
              <View style={styles.labelWrapper}>
                <Text
                  style={[
                    styles.subButtonLabel,
                    isFilterActive ? styles.activeSubButtonLabel : {},
                  ]}
                  numberOfLines={1}
                >
                  {displayLabel}
                </Text>
              </View>
            </Animated.View>
          );
        })}

      {/* زر إعادة تعيين الفلاتر - يظهر في المدار الداخلي القريب عند تفعيل أي فلتر */}
      {isOpen && (
        <Animated.View
          style={[
            styles.subButtonContainer,
            subButtonPositionStyle,
            {
              transform: [
                { translateX: resetTranslateX },
                { translateY: resetTranslateY },
                { scale: resetScale },
              ],
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={activeCount > 0 ? 0.8 : 1}
            style={[
              styles.subButtonOrb,
              styles.resetButtonOrb,
              activeCount > 0 ? styles.activeResetButtonOrb : {},
            ]}
            onPress={handleReset}
          >
            <Icon
              name="filter-remove-outline"
              size={20}
              color={activeCount > 0 ? "#EF4444" : "#94A3B8"}
            />
          </TouchableOpacity>

          <View style={styles.labelWrapper}>
            <Text
              style={[
                styles.subButtonLabel,
                activeCount > 0 ? styles.activeResetButtonLabel : { color: "#94A3B8" },
              ]}
              numberOfLines={1}
            >
              {t("recruitment.reset_filters")}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* الزر العائم الرئيسي (FAB) */}
      <Animated.View
        style={[
          styles.fabWrapper,
          fabPositionStyle,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleMenu}
          style={styles.fabTouch}
        >
          <LinearGradient
            colors={["#002E5A", "#00479E", "#2B9B72"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <Icon name={isOpen ? "close" : "tune"} size={26} color="#FFFFFF" />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>

        {/* شارة عدد الفلاتر النشطة */}
        {!isOpen && activeCount > 0 && (
          <View style={[styles.activeBadge, badgePositionStyle]}>
            <Text style={styles.activeBadgeText}>{activeCount}</Text>
          </View>
        )}
      </Animated.View>

      {/* النوافذ المنبثقة (Modals) لاختيار القيم كدرج سفلي زجاجي فاخر */}
      {FILTER_TYPES.map((item) => {
        const modalItems = [
          {
            id: "",
            nameAr: "الكل",
            nameEn: "All",
            label: t("common.all"),
            value: "",
          },
          ...item.items,
        ];

        return (
          <Modal
            key={`modal-${item.key}`}
            visible={activePicker === item.key}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setActivePicker(null)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setActivePicker(null)}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                {/* مقبض السحب الزخرفي */}
                <View style={styles.dragHandle} />

                <Text style={[styles.modalTitle, { textAlign: "center" }]}>
                  {t("common.choose")} {t(item.labelKey)}
                </Text>

                <FlatList
                  data={modalItems}
                  keyExtractor={(val, idx) => idx.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.optionsList}
                  renderItem={({ item: subItem }) => {
                    const itemValue = subItem.id?.toString() || subItem.value;
                    const isSelected = itemValue === filters[item.key];
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          isSelected ? styles.selectedOptionItem : {},
                          { flexDirection: RTL.rowDir() },
                        ]}
                        onPress={() => handleSelectOption(item.key, itemValue)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.selectedOptionText : {},
                            { textAlign: RTL.textAlign() },
                          ]}
                        >
                          {(i18n.language === "ar"
                            ? subItem.nameAr
                            : subItem.nameEn) ||
                            subItem.label ||
                            subItem.name}
                        </Text>
                        {isSelected && (
                          <Icon name="check-circle" size={20} color="#2B9B72" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 9, 21, 0.45)",
  },
  fabWrapper: {
    position: "absolute",
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#002E5A",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1010,
  },
  fabTouch: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    overflow: "hidden",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBadge: {
    position: "absolute",
    top: -4,
    backgroundColor: "#2B9B72",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 10,
    lineHeight: 12,
  },
  subButtonContainer: {
    position: "absolute",
    bottom: 94,
    width: 60, // زيادة العرض لمنع تداخل النصوص الجانبية
    alignItems: "center",
    zIndex: 1005,
  },
  subButtonOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(43, 155, 114, 0.2)",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  activeSubButtonOrb: {
    backgroundColor: "#2B9B72",
    borderColor: "#2B9B72",
  },
  labelWrapper: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(0, 46, 90, 0.8)",
    borderRadius: 6,
    maxWidth: 78, // وضع حد للحدود لتفادي التداخل
  },
  subButtonLabel: {
    fontFamily: "CairoBold",
    fontSize: 9,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 12,
  },
  activeSubButtonLabel: {
    color: "#4ade80", // إضاءة خضراء للنص عند النشاط
  },
  resetButtonOrb: {
    backgroundColor: "rgba(241, 245, 249, 0.9)",
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  activeResetButtonOrb: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  activeResetButtonLabel: {
    color: "#f87171", // لون أحمر فاتح هادئ للنص عند النشاط
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 9, 21, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 34,
    elevation: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "CairoBold",
    fontSize: 17,
    marginBottom: 16,
    color: "#002E5A",
  },
  optionsList: {
    paddingBottom: 12,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  selectedOptionItem: {
    backgroundColor: "rgba(43, 155, 114, 0.02)",
  },
  optionText: {
    fontFamily: "Cairo",
    fontSize: 15,
    color: "#475569",
    flex: 1,
  },
  selectedOptionText: {
    color: "#2B9B72",
    fontFamily: "CairoBold",
  },
});

export default FilterBar;
