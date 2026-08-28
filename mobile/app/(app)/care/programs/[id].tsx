import { useLocalSearchParams } from "expo-router";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../../src/components/Card";
import { Chip } from "../../../../src/components/Chip";
import { Screen } from "../../../../src/components/Screen";
import { StateMessage } from "../../../../src/components/StateMessage";
import { useProgramEnrollment } from "../../../../src/features/programs/hooks/usePrograms";
import {
  enrollmentStatusChip,
  formatEnrollmentDate,
  isAftercareEnrollment,
  parseProgramChecklist,
} from "../../../../src/features/programs/programs";
import { colors, spacing, typography } from "../../../../src/theme";

function routeId(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

export default function ProgramDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = routeId(params.id);
  const detail = useProgramEnrollment(id);

  const enrollment = detail.enrollment;
  const aftercare = enrollment ? isAftercareEnrollment(enrollment) : false;
  const status = enrollment ? enrollmentStatusChip(enrollment.status) : null;
  const started = enrollment ? formatEnrollmentDate(enrollment.startedAt) : null;
  const ended = enrollment ? formatEnrollmentDate(enrollment.endedAt) : null;
  const checklist = enrollment ? parseProgramChecklist(enrollment.program.instructions) : [];

  return (
    <Screen
      kicker={aftercare ? "Aftercare" : "Care plan"}
      title={enrollment?.program.title ?? "Program"}
      subtitle={
        aftercare
          ? "Follow-up from your care team after a procedure."
          : "Your enrollment in this treatment program."
      }
      refreshControl={
        <RefreshControl
          refreshing={detail.isFetching && !detail.isPending}
          onRefresh={detail.refetch}
          tintColor={colors.primary}
        />
      }
    >
      {detail.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load this program"
          body="Your enrollment is unchanged. Try again in a moment."
          actionLabel="Retry"
          onAction={detail.refetch}
        />
      ) : detail.isPending ? (
        <StateMessage
          tone="loading"
          title="Loading this program"
          body="Fetching your enrollment."
        />
      ) : enrollment === undefined || status === null ? (
        <StateMessage
          tone="empty"
          title="This program isn't on your record"
          body="It may have been removed, or the link is out of date. Your other enrollments are still listed under Care."
        />
      ) : (
        <>
          <Card>
            <View style={styles.statusRow}>
              <Chip label={status.label} tone={status.tone} />
              {enrollment.program.active ? null : (
                <Chip label="Inactive" tone="neutral" />
              )}
            </View>
            {enrollment.program.description ? (
              <Text style={styles.body}>{enrollment.program.description}</Text>
            ) : (
              <Text style={styles.body}>
                Your care team hasn&apos;t added a description for this program yet.
              </Text>
            )}
            <View style={styles.meta}>
              <MetaRow label="Started" value={started ?? "Date unavailable"} />
              {ended ? <MetaRow label="Ended" value={ended} /> : null}
            </View>
          </Card>

          <Card title="Tasks and checklists">
            {checklist.length === 0 ? (
              <Text style={styles.body}>
                Your enrollment is here, but this program has no checklist yet. Completing
                steps in the app is not tracked — there is no tasks API on the care record.
              </Text>
            ) : (
              <>
                <Text style={styles.body}>
                  These steps come from your care program. They are a copy of the plan, not
                  a to-do list you can mark done in the app.
                </Text>
                {checklist.map((item, index) => (
                  <View key={`${item.title}-${index}`} style={styles.checkRow}>
                    <Text style={styles.checkMark}>{index + 1}</Text>
                    <View style={styles.checkCopy}>
                      <Text style={styles.checkTitle}>{item.title}</Text>
                      {item.detail ? <Text style={styles.checkDetail}>{item.detail}</Text> : null}
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  body: { ...typography.body, color: colors.textMuted },
  meta: { gap: spacing.xs },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkMark: {
    ...typography.label,
    color: colors.primary,
    minWidth: 20,
    marginTop: 1,
  },
  checkCopy: { flex: 1, gap: 2 },
  checkTitle: { ...typography.label, color: colors.text },
  checkDetail: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  metaLabel: { ...typography.caption, color: colors.textMuted },
  metaValue: { ...typography.label, color: colors.text, flexShrink: 1, textAlign: "right" },
});
