import { StyleSheet } from "react-native";
import { RTL } from "../../utils/rtlHelper";

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
      paddingTop: 20,
      backgroundColor: "#f5f5f5",
    },
    contentContainer: {
      paddingBottom: 30,
    },
    categoryCard: {
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: "#e0e0e0",
    },
    categoryHeader: {
      alignItems: "center",
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingBottom: 10,
      width: "100%",
    },
    categoryTitle: {
      fontSize: 18,
      color: "#007BFF",
      fontFamily: "CairoBold",
      flex: 1,
    },
    servicesList: {
      marginTop: 5,
    },
    serviceItem: {
      alignItems: "center",
      marginBottom: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: "#f9f9f9",
      borderRadius: 8,
      // ✨ المنطق المعكوس للحدود الجانبية
      // في العربي (RTL) نريد الحد على اليمين، وفي الإنجليزي على اليسار
      borderRightWidth: RTL.select(4, 0),
      borderLeftWidth: RTL.select(0, 4),
      borderRightColor: "#28a745",
      borderLeftColor: "#28a745",
    },
    serviceText: {
      fontSize: 14,
      color: "#555",
      fontFamily: "Cairo",
      flex: 1,
    },
  });

export default createStyles;
