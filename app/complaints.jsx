import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import moment from "moment";
import "moment/locale/ar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppBar from "../components/AppBar";
import ComplaintDetailsModal from "../components/complaintComponents/ComplaintDetailsModal";
import ComplaintForm from "../components/complaintComponents/ComplaintForm";
import ComplaintStatsCard from "../components/complaintComponents/ComplaintStatsCard";
import ComplaintTicketCard from "../components/complaintComponents/ComplaintTicketCard";
import { RTL } from "../utils/rtlHelper";
import { getAllBranches } from "./Api/BranchService";
import { getClientComplaints, addComplaint } from "./Api/ComplaintService";

export default function ComplaintsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  moment.locale(i18n.language);
  const isRtl = i18n.language === "ar";

  // User and loading states
  const [userData, setUserData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, استفسار, شكوى, طلب

  // Navigation / Modal States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    branch: "",
    branchId: "",
    kind: "شكوى", // استفسار, شكوى, طلب
    details: "",
  });

  const [formErrors, setFormErrors] = useState({
    phone: "",
    branch: "",
    details: "",
  });

  const stats = React.useMemo(() => {
    const list = complaints || [];
    const total = list.length;
    const pending = list.filter((c) => c.status === "Pending").length;
    const inProgress = list.filter((c) => c.status === "In Progress").length;
    const resolved = list.filter((c) => c.status === "Completed" || c.status === "Resolved").length;
    const percent = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, inProgress, resolved, percent };
  }, [complaints]);

  // Fetch active user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        const userTokenString = await AsyncStorage.getItem("userToken");
        if (userDataString && userTokenString) {
          const parsed = JSON.parse(userDataString);
          setUserData(parsed);
          setFormData((prev) => ({
            ...prev,
            phone: parsed.phone || "",
          }));
        } else {
          if (userDataString || userTokenString) {
            await AsyncStorage.multiRemove(["userData", "userToken", "userOtp"]);
          }
          router.replace("/LoginPromptPage");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch complaints list
  const fetchComplaints = async () => {
    if (!userData) return;
    try {
      setLoadingList(true);
      const response = await getClientComplaints(i18n.language, userData?.id);
      if (response.success === 1) {
        const list = response.data || [];
        setComplaints(list);
        if (list.length === 0) {
          setShowForm(true); // Default to form if no complaints exist
        }
      } else {
        console.warn("Failed to fetch complaints:", response.message);
        const errorDesc = response.message && response.message !== "null"
          ? response.message
          : t("contracts.error_fetch");
        showMessage({
          message: t("common.error"),
          description: errorDesc,
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      showMessage({
        message: t("common.error"),
        description: t("contracts.error_fetch"),
        type: "danger",
      });
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  };

  // Fetch branches
  const fetchBranchesList = async () => {
    try {
      const response = await getAllBranches(i18n.language);
      if (response && Array.isArray(response.data)) {
        setBranches(response.data);
        
        // Auto-select default branch if applicable
        if (userData?.branchId) {
          const matched = response.data.find((b) => b.id === userData.branchId);
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              branch: isRtl ? matched.nameAr : matched.nameEn || matched.nameAr,
              branchId: matched.id,
            }));
          } else if (response.data.length > 0) {
            const firstBranch = response.data[0];
            setFormData((prev) => ({
              ...prev,
              branch: isRtl ? firstBranch.nameAr : firstBranch.nameEn || firstBranch.nameAr,
              branchId: firstBranch.id,
            }));
          }
        } else if (response.data.length > 0) {
          const firstBranch = response.data[0];
          setFormData((prev) => ({
            ...prev,
            branch: isRtl ? firstBranch.nameAr : firstBranch.nameEn || firstBranch.nameAr,
            branchId: firstBranch.id,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchComplaints();
      fetchBranchesList();
    }
  }, [userData, i18n.language]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  // Input Handlers
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { phone: "", branch: "", details: "" };

    const phoneStr = formData.phone ? String(formData.phone).trim() : "";
    const detailsStr = formData.details ? String(formData.details).trim() : "";

    if (!phoneStr) {
      errors.phone = t("complaints.required_field");
      isValid = false;
    }
    if (!formData.branch) {
      errors.branch = t("complaints.required_field");
      isValid = false;
    }
    if (!detailsStr) {
      errors.details = t("complaints.required_field");
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoadingSubmit(true);
      const payload = {
        clientId: userData.id,
        clientName: userData.name,
        nationalId: userData.nationalId,
        branch: formData.branch,
        branchId: formData.branchId,
        phone: formData.phone,
        kind: formData.kind,
        details: formData.details,
      };

      const response = await addComplaint(i18n.language, payload);
      if (response.success === 1) {
        showMessage({
          message: t("common.success"),
          description: t("complaints.submit_success"),
          type: "success",
        });
        setFormData((prev) => ({ ...prev, details: "" }));
        setShowForm(false);
        await fetchComplaints();
      } else {
        console.warn("Complaint submission failed:", response.message);
        const errorDesc = response.message && response.message !== "null"
          ? response.message
          : t("common.error_connection");
        showMessage({
          message: t("common.error"),
          description: errorDesc,
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      showMessage({
        message: t("common.error"),
        description: t("common.error_connection"),
        type: "danger",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Filtering Logic
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.num.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "ALL" || c.kind === filterType;
    return matchesSearch && matchesFilter;
  });

  // Status Badge Colors (Dynamic & Brand Aligned)
  const getStatusColors = (status) => {
    switch (status) {
      case "Completed":
      case "Resolved":
        return {
          text: "#2B9B72", // Emerald Teal
          bg: "rgba(43, 155, 114, 0.08)",
          border: "rgba(43, 155, 114, 0.18)"
        };
      case "In Progress":
        return {
          text: "#00479E", // Sapphire Blue
          bg: "rgba(0, 71, 158, 0.08)",
          border: "rgba(0, 71, 158, 0.18)"
        };
      case "Pending":
        return {
          text: "#D97706", // Amber/Orange
          bg: "rgba(217, 119, 6, 0.08)",
          border: "rgba(217, 119, 6, 0.18)"
        };
      case "Closed":
        return {
          text: "#64748B", // Slate
          bg: "rgba(100, 116, 139, 0.08)",
          border: "rgba(100, 116, 139, 0.18)"
        };
      default:
        return {
          text: "#002E5A", // Royal Navy
          bg: "rgba(0, 46, 90, 0.08)",
          border: "rgba(0, 46, 90, 0.18)"
        };
    }
  };

  // Kind Badge Colors (Dynamic & Color Coded for Easy Scanning)
  const getKindBadgeStyle = (kind) => {
    switch (kind) {
      case "استفسار":
        return {
          text: "#00479E", // Sapphire Blue
          bg: "rgba(0, 71, 158, 0.06)",
          border: "rgba(0, 71, 158, 0.12)"
        };
      case "شكوى":
        return {
          text: "#DC2626", // Crimson Red
          bg: "rgba(220, 38, 38, 0.06)",
          border: "rgba(220, 38, 38, 0.12)"
        };
      case "طلب":
        return {
          text: "#2B9B72", // Emerald Teal
          bg: "rgba(43, 155, 114, 0.06)",
          border: "rgba(43, 155, 114, 0.12)"
        };
      default:
        return {
          text: "#002E5A", // Royal Navy
          bg: "rgba(0, 46, 90, 0.06)",
          border: "rgba(0, 46, 90, 0.12)"
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return t("complaints.pending");
      case "In Progress":
        return t("complaints.in_progress");
      case "Resolved":
      case "Completed":
        return t("complaints.resolved");
      case "Closed":
        return t("complaints.closed");
      default:
        return status;
    }
  };

  const formatTicketDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("LL");
  };

  return (
    <View style={styles.container}>
      {/* Immersive Light Brand Gradient Background */}
      <LinearGradient
        colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
        locations={[0.0, 0.5, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      <AppBar />

      <View style={styles.content}>
        {/* Header Row */}
        <View style={[styles.headerRow, { flexDirection: RTL.rowDir() }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Icon name={RTL.select("arrow-forward", "arrow-back")} size={24} color="#002E5A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {t("complaints.center_title")}
            </Text>
            <Text style={[styles.subHeaderText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {showForm
                ? t("complaints.submit_complaint")
                : `${complaints.length} ${t("complaints.my_complaints")}`}
            </Text>
          </View>
          {!showForm && complaints.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={styles.newRequestButtonHeader}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2B9B72", "#22805E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.newRequestButtonHeaderGradient, { flexDirection: RTL.rowDir() }]}
              >
                <Icon name="add" size={18} color="#fff" />
                <Text style={styles.newRequestButtonHeaderText}>
                  {isRtl ? "جديد" : "New"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {loadingList ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#2B9B72" />
            <Text style={[styles.loadingText, { writingDirection: RTL.writingDirection() }]}>{t("common.loading", "جاري التحميل...")}</Text>
          </View>
        ) : showForm ? (
          /* ─────────────── FORM VIEW ─────────────── */
          <ComplaintForm
            userData={userData}
            branches={branches}
            formData={formData}
            formErrors={formErrors}
            loadingSubmit={loadingSubmit}
            isRtl={isRtl}
            t={t}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            showCancel={complaints.length > 0}
          />
        ) : (
          /* ─────────────── LIST VIEW ─────────────── */
          <View style={{ flex: 1 }}>
            {/* Search Input */}
            <View style={[styles.searchContainer, { flexDirection: RTL.rowDir() }]}>
              <Icon name="search" size={20} color="#002E5A" />
              <TextInput
                style={[styles.searchInput, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}
                placeholder={t("complaints.search_placeholder")}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Icon name="clear" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Category Chips */}
            <View style={{ marginBottom: 12 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.filterScroll, { flexDirection: RTL.rowDir() }]}
              >
                {["ALL", "استفسار", "شكوى", "طلب"].map((type) => {
                  const isActive = filterType === type;
                  const label =
                    type === "ALL"
                      ? isRtl
                        ? "الكل"
                        : "All"
                      : type === "استفسار"
                      ? t("complaints.type_inquiry")
                      : type === "طلب"
                      ? t("complaints.type_request")
                      : t("complaints.type_complaint");
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFilterType(type)}
                      activeOpacity={0.8}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                    >
                      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive, { writingDirection: RTL.writingDirection() }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tickets List */}
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2B9B72"]} />
              }
            >
              {/* Stats Card */}
              {complaints.length > 0 && (
                <ComplaintStatsCard stats={stats} t={t} isRtl={isRtl} />
              )}

              {filteredComplaints.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons name="comment-question-outline" size={64} color="rgba(43, 155, 114, 0.25)" />
                  </View>
                  <Text style={[styles.emptyText, { writingDirection: RTL.writingDirection() }]}>{t("complaints.no_complaints")}</Text>
                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={() => setShowForm(true)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#002E5A", "#00479E"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.emptyAddButtonGradient}
                    >
                      <Text style={[styles.emptyAddButtonText, { writingDirection: RTL.writingDirection() }]}>
                        {t("complaints.submit_complaint")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredComplaints.map((item) => (
                  <ComplaintTicketCard
                    key={item.id}
                    item={item}
                    onPress={() => setSelectedTicket(item)}
                    t={t}
                    getStatusColors={getStatusColors}
                    getKindBadgeStyle={getKindBadgeStyle}
                    getStatusLabel={getStatusLabel}
                    formatTicketDate={formatTicketDate}
                  />
                ))
              )}
            </ScrollView>

            {/* Floating Action Button */}
            {complaints.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.fab,
                  RTL.select({ left: 20 }, { right: 20 }),
                ]}
                onPress={() => setShowForm(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#2B9B72", "#22805E"]}
                  style={styles.fabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="add" size={28} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ─────────────── DETAILS MODAL ─────────────── */}
      <ComplaintDetailsModal
        visible={selectedTicket !== null}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        t={t}
        isRtl={isRtl}
        getStatusColors={getStatusColors}
        getKindBadgeStyle={getKindBadgeStyle}
        getStatusLabel={getStatusLabel}
        formatTicketDate={formatTicketDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { alignItems: "center", marginBottom: 20, gap: 12, width: "100%" },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 46, 90, 0.05)",
    elevation: 0,
    shadowColor: "#002E5A",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: { fontSize: 22, fontFamily: "CairoBold", color: "#002E5A" },
  subHeaderText: {
    fontSize: 12,
    fontFamily: "Cairo",
    color: "#64748B",
    marginTop: -2,
  },
  newRequestButtonHeader: {
    borderRadius: 12,
    overflow: "hidden",
  },
  newRequestButtonHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  newRequestButtonHeaderText: {
    color: "#FFFFFF",
    fontFamily: "CairoBold",
    fontSize: 12,
  },
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontFamily: "Cairo", color: "#002E5A" },
  scrollContentContainer: { paddingBottom: 100 },

  /* ─── Search & Filters ─── */
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
    elevation: 0,
    shadowColor: "#002E5A",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#002E5A",
    padding: 0,
  },
  filterScroll: { paddingVertical: 4, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0, 46, 90, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.06)",
  },
  filterChipActive: {
    backgroundColor: "#002E5A",
    borderColor: "#002E5A",
  },
  filterChipText: { fontFamily: "CairoBold", fontSize: 13, color: "#64748B" },
  filterChipTextActive: { color: "#FFFFFF" },

  /* ─── Floating Action Button ─── */
  fab: {
    position: "absolute",
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18, // Squircle FAB
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ─── Empty State ─── */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 46, 90, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(0, 46, 90, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyAddButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyAddButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyAddButtonText: { fontFamily: "CairoBold", color: "#FFFFFF", fontSize: 13 },
});
