import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppBar from "../AppBar";
import { RTL } from "../../utils/rtlHelper";

export default function ComplaintDetailsModal({
  visible,
  ticket,
  onClose,
  t,
  isRtl,
  getStatusColors,
  getKindBadgeStyle,
  getStatusLabel,
  formatTicketDate,
}) {
  if (!ticket) return null;

  const statusColors = getStatusColors(ticket.status);
  const kindStyle = getKindBadgeStyle(ticket.kind);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Immersive Light Brand Gradient Background */}
        <LinearGradient
          colors={["#F8FAFC", "#EDF7F4", "#EBF2F8"]}
          locations={[0.0, 0.5, 1.0]}
          style={StyleSheet.absoluteFillObject}
        />

        <AppBar />

        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { flexDirection: RTL.rowDir() }]}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.8}
            >
              <Icon
                name={RTL.select("arrow-forward", "arrow-back")}
                size={24}
                color="#002E5A"
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                {t("complaints.complaint_num")}
              </Text>
              <Text style={[styles.modalSubtitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                #{ticket.num}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColors.bg,
                  borderColor: statusColors.border,
                  borderWidth: 1,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColors.text, fontSize: 13, writingDirection: RTL.writingDirection() }]}>
                {getStatusLabel(ticket.status)}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Meta Information Grid */}
            <View style={styles.detailsMetaCard}>
              <View style={[styles.metaItemRow, { flexDirection: RTL.rowDir() }]}>
                <View style={[styles.metaItem, { flexDirection: RTL.rowDir() }]}>
                  <View style={styles.metaIconContainer}>
                    <Icon name="category" size={18} color="#2B9B72" />
                  </View>
                  <View style={[styles.metaTextWrapper, { flex: 1 }]}>
                    <Text style={[styles.metaLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.complaint_type")}</Text>
                    <Text style={[styles.metaValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{ticket.kind}</Text>
                  </View>
                </View>
                <View style={[styles.metaItem, { flexDirection: RTL.rowDir() }]}>
                  <View style={styles.metaIconContainer}>
                    <Icon name="business" size={18} color="#2B9B72" />
                  </View>
                  <View style={[styles.metaTextWrapper, { flex: 1 }]}>
                    <Text style={[styles.metaLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.branch")}</Text>
                    <Text style={[styles.metaValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{ticket.branch}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.metaItemRow, { flexDirection: RTL.rowDir(), marginTop: 16 }]}>
                <View style={[styles.metaItem, { flexDirection: RTL.rowDir() }]}>
                  <View style={styles.metaIconContainer}>
                    <Icon name="phone" size={18} color="#2B9B72" />
                  </View>
                  <View style={[styles.metaTextWrapper, { flex: 1 }]}>
                    <Text style={[styles.metaLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.contact_phone")}</Text>
                    <Text style={[styles.metaValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{ticket.phone}</Text>
                  </View>
                </View>
                <View style={[styles.metaItem, { flexDirection: RTL.rowDir() }]}>
                  <View style={styles.metaIconContainer}>
                    <Icon name="event" size={18} color="#2B9B72" />
                  </View>
                  <View style={[styles.metaTextWrapper, { flex: 1 }]}>
                    <Text style={[styles.metaLabel, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{t("complaints.complaint_date")}</Text>
                    <Text style={[styles.metaValue, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>{formatTicketDate(ticket.createdDate)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Ticket Details/Description */}
            <Text style={[styles.sectionHeading, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {t("complaints.details")}
            </Text>
            <View
              style={[
                styles.descriptionCard,
                {
                  borderLeftWidth: isRtl ? 0 : 4,
                  borderLeftColor: isRtl ? "transparent" : "#2B9B72",
                  borderRightWidth: isRtl ? 4 : 0,
                  borderRightColor: isRtl ? "#2B9B72" : "transparent",
                },
              ]}
            >
              <Text style={[styles.descriptionText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                {ticket.details}
              </Text>
            </View>

            {/* Visual Stepper / Timeline */}
            <Text style={[styles.sectionHeading, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
              {t("complaints.ticket_journey", "رحلة معالجة طلبك")}
            </Text>

            <View style={styles.timelineContainer}>
              {/* Step 1: Submission */}
              <View style={[styles.timelineNode, { flexDirection: RTL.rowDir() }]}>
                <View style={styles.timelineLeftColumn}>
                  <View style={[styles.timelineCircle, styles.timelineCircleDone]}>
                    <Icon name="check" size={12} color="#fff" />
                  </View>
                  <View style={[styles.timelineLine, styles.timelineLineDone]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStepTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                    {t("complaints.step_submitted", "تم تقديم الطلب بنجاح")}
                  </Text>
                  <Text style={[styles.timelineStepTime, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                    {formatTicketDate(ticket.createdDate)}
                  </Text>
                  <Text style={[styles.timelineStepDesc, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                    {isRtl
                      ? "تلقينا طلبك وسيقوم النظام بتوجيهه للقسم المختص لمراجعته."
                      : "We received your request and the system will route it to the specialist."}
                  </Text>
                </View>
              </View>

              {/* Step 2: In Progress */}
              {(() => {
                const isInProgressOrMore = ticket.status !== "Pending";
                return (
                  <View style={[styles.timelineNode, { flexDirection: RTL.rowDir() }]}>
                    <View style={styles.timelineLeftColumn}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isInProgressOrMore
                            ? styles.timelineCircleDone
                            : styles.timelineCirclePending,
                        ]}
                      >
                        {isInProgressOrMore ? (
                          <Icon name="check" size={12} color="#fff" />
                        ) : (
                          <View style={styles.timelinePendingDot} />
                        )}
                      </View>
                      <View
                        style={[
                          styles.timelineLine,
                          ticket.status === "Resolved" ||
                          ticket.status === "Completed" ||
                          ticket.status === "Closed"
                            ? styles.timelineLineDone
                            : styles.timelineLinePending,
                        ]}
                      />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStepTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                        {t("complaints.step_processing", "جاري دراسة الطلب")}
                      </Text>
                      {isInProgressOrMore && (
                        <Text style={[styles.timelineStepDesc, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                          {isRtl
                            ? `تم إسناد الطلب للموظف المسؤول (${
                                ticket.responsibleEmployee || "أخصائي الدعم"
                              }) للمراجعة والحل.`
                            : `The request is assigned to the specialist (${
                                ticket.responsibleEmployee || "Support Agent"
                              }) for review.`}
                        </Text>
                      )}
                      {!isInProgressOrMore && (
                        <Text style={[styles.timelineStepDesc, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                          {isRtl
                            ? "الطلب بانتظار تعيين الموظف المسؤول لبدء المعالجة."
                            : "The request is awaiting assignment to a support agent."}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })()}

              {/* Step 3: Resolved */}
              {(() => {
                const isResolved =
                  ticket.status === "Resolved" ||
                  ticket.status === "Completed" ||
                  ticket.status === "Closed";
                return (
                  <View
                    style={[
                      styles.timelineNode,
                      { flexDirection: RTL.rowDir(), marginBottom: 0 },
                    ]}
                  >
                    <View style={styles.timelineLeftColumn}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isResolved
                            ? styles.timelineCircleResolved
                            : styles.timelineCirclePending,
                        ]}
                      >
                        {isResolved ? (
                          <Icon name="check" size={12} color="#fff" />
                        ) : (
                          <View style={styles.timelinePendingDot} />
                        )}
                      </View>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStepTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                        {t("complaints.step_resolved", "تمت معالجة الطلب")}
                      </Text>
                      {isResolved && ticket.specialistReply ? (
                        <View style={styles.resolvedReplyContainer}>
                          <Text style={[styles.resolvedReplyTitle, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                            {t("complaints.reply_official", "الرد الرسمي والمقترح:")}
                          </Text>
                          <Text style={[styles.resolvedReplyText, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                            {ticket.specialistReply}
                          </Text>
                        </View>
                      ) : isResolved ? (
                        <Text style={[styles.timelineStepDesc, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                          {isRtl ? "تم إغلاق وتحديث حالة الطلب." : "The request was successfully closed."}
                        </Text>
                      ) : (
                        <Text style={[styles.timelineStepDesc, { textAlign: RTL.textAlign(), writingDirection: RTL.writingDirection() }]}>
                          {isRtl
                            ? "سيظهر رد الأخصائي والحل المقترح هنا فور الانتهاء من الدراسة."
                            : "The official reply and proposed resolution will appear here once finalized."}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })()}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalContent: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  modalHeader: { alignItems: "center", marginBottom: 20, gap: 12, width: "100%" },
  modalCloseButton: {
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
  modalTitle: { fontSize: 12, fontFamily: "Cairo", color: "#64748B", marginBottom: -4 },
  modalSubtitle: { fontSize: 20, fontFamily: "CairoBold", color: "#002E5A" },
  modalScrollContent: { paddingBottom: 40 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontFamily: "CairoBold" },

  detailsMetaCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  metaItemRow: { justifyContent: "space-between", gap: 16 },
  metaItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  metaIconContainer: {
    backgroundColor: "rgba(43, 155, 114, 0.08)",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  metaTextWrapper: {},
  metaLabel: { fontSize: 11, color: "#94A3B8", fontFamily: "Cairo" },
  metaValue: { fontSize: 13, fontFamily: "CairoBold", color: "#002E5A" },

  sectionHeading: {
    fontSize: 15,
    fontFamily: "CairoBold",
    color: "#002E5A",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  descriptionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2B9B72",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.14)",
    elevation: 0,
    shadowColor: "#2B9B72",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  descriptionText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },

  /* Timeline Styles */
  timelineContainer: {
    paddingLeft: 4,
    paddingRight: 4,
    marginBottom: 20,
  },
  timelineNode: {
    gap: 12,
    marginBottom: 16,
  },
  timelineLeftColumn: {
    alignItems: "center",
    width: 24,
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  timelineCircleDone: {
    backgroundColor: "#2B9B72",
  },
  timelineCirclePending: {
    backgroundColor: "#E2E8F0",
    borderWidth: 2,
    borderColor: "#94A3B8",
  },
  timelineCircleResolved: {
    backgroundColor: "#00479E",
  },
  timelinePendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
  },
  timelineLine: {
    position: "absolute",
    top: 24,
    bottom: -16,
    width: 2,
    left: 11,
    zIndex: 1,
  },
  timelineLineDone: {
    backgroundColor: "#2B9B72",
  },
  timelineLinePending: {
    backgroundColor: "#E2E8F0",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 1,
  },
  timelineStepTitle: {
    fontFamily: "CairoBold",
    fontSize: 14,
    color: "#002E5A",
  },
  timelineStepTime: {
    fontFamily: "Cairo",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  timelineStepDesc: {
    fontFamily: "Cairo",
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
  resolvedReplyContainer: {
    backgroundColor: "rgba(43, 155, 114, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(43, 155, 114, 0.15)",
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
  },
  resolvedReplyTitle: {
    fontFamily: "CairoBold",
    fontSize: 11,
    color: "#2B9B72",
    marginBottom: 4,
  },
  resolvedReplyText: {
    fontFamily: "Cairo",
    fontSize: 13,
    color: "#002E5A",
    lineHeight: 20,
  },
});
