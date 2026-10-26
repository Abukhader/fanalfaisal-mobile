import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RTL } from "../../utils/rtlHelper";

export default function ComplaintForm({
  userData,
  branches,
  formData,
  formErrors,
  loadingSubmit,
  isRtl,
  t,
  onInputChange,
  onSubmit,
  onCancel,
  showCancel,
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        {/* Form Title & Subtitle */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection(), marginBottom: 4 }]}>
            {t("complaints.submit_complaint")}
          </Text>
          <Text style={[styles.sectionSubtitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {isRtl
              ? "يرجى كتابة التفاصيل بدقة لمساعدتنا على خدمتك بشكل أسرع"
              : "Please fill in the details below to help us process your request faster."}
          </Text>
        </View>

        {/* Verified Personal Details Card */}
        <View style={styles.verifiedCard}>
          <View style={[styles.verifiedCardHeader, { flexDirection: RTL.rowDir() }]}>
            <Text style={[styles.verifiedCardTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {t("complaints.personal_details")}
            </Text>
            <View style={[styles.verifiedBadge, { flexDirection: RTL.rowDir() }]}>
              <Icon name="verified-user" size={12} color="#2B9B72" />
              <Text style={[styles.verifiedBadgeText, { writingDirection: RTL.writingDirection() }]}>
                {isRtl ? "موثق" : "Verified"}
              </Text>
            </View>
          </View>

          <View style={[styles.verifiedDetailsRow, { flexDirection: RTL.rowDir() }]}>
            <View style={[styles.verifiedItem, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.verifiedIconContainer}>
                <Icon name="person" size={16} color="#2B9B72" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifiedLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.client_name")}</Text>
                <Text style={[styles.verifiedValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]} numberOfLines={1}>
                  {userData?.name || "---"}
                </Text>
              </View>
            </View>
            <View style={[styles.verifiedItem, { flexDirection: RTL.rowDir() }]}>
              <View style={styles.verifiedIconContainer}>
                <Icon name="badge" size={16} color="#2B9B72" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.verifiedLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.national_id")}</Text>
                <Text style={[styles.verifiedValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{userData?.nationalId || "---"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1. Request Type Selector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {t("complaints.complaint_type")}
          </Text>
          <View style={[styles.typeCardsContainer, { flexDirection: RTL.rowDir() }]}>
            {[
              {
                value: "استفسار",
                title: t("complaints.type_inquiry"),
                color: "#00479E",
                icon: "help-outline",
              },
              {
                value: "شكوى",
                title: t("complaints.type_complaint"),
                color: "#DC2626",
                icon: "error-outline",
              },
              {
                value: "طلب",
                title: t("complaints.type_request"),
                color: "#2B9B72",
                icon: "assignment",
              },
            ].map((item) => {
              const isSelected = formData.kind === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => onInputChange("kind", item.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.typeCard,
                    isSelected && {
                      borderColor: item.color,
                      backgroundColor: `${item.color}08`,
                      elevation: 2,
                    },
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    color={isSelected ? item.color : "#94A3B8"}
                  />
                  <Text
                    style={[
                      styles.typeCardText,
                      isSelected && { color: item.color, fontFamily: "CairoBold" },
                      { writingDirection: RTL.writingDirection() },
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Branch Selector Chips */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {t("complaints.branch")}
          </Text>
          {formErrors.branch ? (
            <Text style={[styles.errorText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {formErrors.branch}
            </Text>
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.branchChipsContainer, { flexDirection: RTL.rowDir() }]}
          >
            {branches.map((b) => {
              const branchName = isRtl ? b.nameAr : b.nameEn || b.nameAr;
              const isSelected = formData.branch === branchName;
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => {
                    onInputChange("branch", branchName);
                    // Update branchId parent state manually or via helper
                    onInputChange("branchId", b.id);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.branchChip,
                    isSelected && styles.branchChipSelected,
                    { flexDirection: RTL.rowDir(), alignItems: "center", gap: 4 },
                  ]}
                >
                  <Icon
                    name="location-on"
                    size={14}
                    color={isSelected ? "#fff" : "#94A3B8"}
                  />
                  <Text
                    style={[
                      styles.branchChipText,
                      isSelected && styles.branchChipTextSelected,
                      { writingDirection: RTL.writingDirection() },
                    ]}
                  >
                    {branchName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Contact Phone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
            {t("complaints.contact_phone")}
          </Text>
          <View style={[styles.textInputWrapper, { flexDirection: RTL.rowDir() }]}>
            <Icon name="phone" size={18} color="#002E5A" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(val) => onInputChange("phone", val)}
              placeholder="05xxxxxxxx"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {formErrors.phone ? (
            <Text style={[styles.errorText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {formErrors.phone}
            </Text>
          ) : null}
        </View>

        {/* 4. Details */}
        <View style={styles.inputGroup}>
          <View
            style={{
              flexDirection: RTL.rowDir(),
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={[styles.inputLabel, { marginBottom: 0, textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}
            >
              {t("complaints.details")}
            </Text>
            <Text style={[styles.charCountText, { writingDirection: RTL.writingDirection() }]}>
              {formData.details.length} / 500
            </Text>
          </View>
          <View style={[styles.textInputWrapper, styles.multilineWrapper]}>
            <TextInput
              style={[styles.textInput, styles.multilineInput, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}
              multiline
              maxLength={500}
              numberOfLines={6}
              value={formData.details}
              onChangeText={(val) => onInputChange("details", val)}
              placeholder={t("complaints.details_placeholder")}
              placeholderTextColor="#94A3B8"
            />
          </View>
          {formErrors.details ? (
            <Text style={[styles.errorText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {formErrors.details}
            </Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={[styles.formActions, { flexDirection: RTL.rowDir() }]}>
          {showCancel && onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { writingDirection: RTL.writingDirection() }]}>{t("complaints.cancel")}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={loadingSubmit}
            style={styles.submitButtonTouchable}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2B9B72", "#22805E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {loadingSubmit ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.submitButtonText, { writingDirection: RTL.writingDirection() }]}>{t("complaints.send")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: { paddingBottom: 100 },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: "Cairo",
    fontSize: 12,
    color: "#64748B",
    marginTop: -2,
  },
  verifiedCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  verifiedCardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  verifiedCardTitle: {
    fontSize: 12,
    fontFamily: "CairoBold",
    color: "#94A3B8",
    marginBottom: 10,
  },
  verifiedBadge: {
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  verifiedBadgeText: {
    fontFamily: "CairoBold",
    fontSize: 10,
    color: "#2B9B72",
  },
  verifiedDetailsRow: { justifyContent: "space-between", gap: 12 },
  verifiedItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  verifiedIconContainer: {
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedLabel: { fontSize: 10, color: "#94A3B8", fontFamily: "Cairo" },
  verifiedValue: { fontSize: 13, fontFamily: "CairoBold", color: "#002E5A" },

  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 8,
  },
  typeCardsContainer: { justifyContent: "space-between", gap: 8 },
  typeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 6,
  },
  typeCardText: { fontSize: 12, fontFamily: "Cairo", color: "#64748B" },

  branchChipsContainer: { paddingVertical: 4, gap: 8 },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.08)",
    backgroundColor: "#FFFFFF",
  },
  branchChipSelected: {
    borderColor: "#002E5A",
    backgroundColor: "#002E5A",
  },
  branchChipText: { fontSize: 13, fontFamily: "CairoBold", color: "#64748B" },
  branchChipTextSelected: { color: "#FFFFFF" },

  textInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(0, 46, 90, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
  },
  inputIcon: {},
  textInput: {
    flex: 1,
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#002E5A",
    padding: 0,
  },
  multilineWrapper: { alignItems: "stretch", paddingVertical: 10 },
  multilineInput: { minHeight: 120, verticalAlign: "top" },
  errorText: { color: "#EF4444", fontSize: 11, fontFamily: "CairoBold", marginTop: 4 },

  formActions: { justifyContent: "flex-end", gap: 12, marginTop: 10 },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: { fontFamily: "CairoBold", color: "#64748B", fontSize: 14 },
  submitButtonTouchable: {
    borderRadius: 14,
    overflow: "hidden",
    minWidth: 110,
  },
  submitButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: { fontFamily: "CairoBold", color: "#FFFFFF", fontSize: 14 },
  charCountText: {
    fontFamily: "Cairo",
    fontSize: 11,
    color: "#94A3B8",
  },
});
