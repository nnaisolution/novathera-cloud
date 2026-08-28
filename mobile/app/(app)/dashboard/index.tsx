import { Stack, useRouter } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../../src/components/Card";
import { LineChart } from "../../../src/components/LineChart";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { StateMessage } from "../../../src/components/StateMessage";
import { MetricCard } from "../../../src/features/health/components/MetricCard";
import {
  useLatestObservations,
  useObservationSeries,
} from "../../../src/features/health/hooks/useObservations";
import {
  OBSERVATION_LABELS,
  formatShortDate,
  formatUnit,
  formatValue,
  isChartable,
  type Observation,
} from "../../../src/features/health/observations";
import { usePatientProfile, buildGreeting } from "../../../src/features/patient/hooks/usePatientProfile";
import { colors, radii, spacing, typography } from "../../../src/theme";

const SCREEN_OPTIONS = { headerShown: false };

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = new Date();

  const profile = usePatientProfile();
  const latest = useLatestObservations();

  const featured = latest.entries.find((entry) => isChartable(entry.type)) ?? null;
  const series = useObservationSeries(featured?.type ?? null);

  const isLoading = latest.isPending;
  const isEmpty = !isLoading && !latest.isError && latest.entries.length === 0;

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={latest.isFetching && !latest.isPending}
            onRefresh={() => {
              latest.refetch();
              void series.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Nova Thera</Text>
          <Text style={styles.greeting}>{buildGreeting(profile.data?.displayName, now)}</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
        </View>

        {latest.isError ? (
          <StateMessage
            tone="error"
            title="We couldn't load your readings"
            body="Your data is safe. Pull down to try again, or check back once you're back online."
            actionLabel="Retry"
            onAction={latest.refetch}
          />
        ) : isLoading ? (
          <StateMessage tone="loading" title="Loading your readings" body="Fetching the latest from your record." />
        ) : isEmpty ? (
          <StateMessage
            tone="empty"
            title="No readings yet"
            body="Log your first reading — weight, pulse, or glucose — and your trends will start building here."
            note="Readings can only be saved while your treatment consent is active."
            actionLabel="Add a reading"
            onAction={() => router.push("/(app)/health/add-reading")}
          />
        ) : (
          <>
            {featured ? (
              <FeaturedChart
                featured={featured}
                series={series.data ?? []}
                isLoading={series.isPending}
                isError={series.isError}
                onRetry={() => void series.refetch()}
              />
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest readings</Text>
              <Text style={styles.sectionCaption}>Normalized values from your care record</Text>
              <View style={styles.grid}>
                {latest.entries.map((entry) => (
                  <MetricCard key={entry.id} observation={entry} now={now} />
                ))}
              </View>
            </View>

            <PrimaryButton label="View trends" onPress={() => router.push("/(app)/dashboard/trends")} />
          </>
        )}
      </ScrollView>
    </>
  );
}

type FeaturedChartProps = {
  featured: Observation;
  series: readonly Observation[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function FeaturedChart({ featured, series, isLoading, isError, onRetry }: FeaturedChartProps) {
  const points = series
    .filter((entry) => entry.value !== null)
    .map((entry) => ({ x: entry.effectiveAt.getTime(), y: entry.value ?? 0 }))
    .sort((a, b) => a.x - b.x);

  const label = OBSERVATION_LABELS[featured.type];
  const unit = formatUnit(featured.type, featured.unit);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (isError) {
    return (
      <StateMessage
        tone="error"
        title={`We couldn't load ${label.toLowerCase()} history`}
        body="Your latest reading is still shown below. Try again in a moment."
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <StateMessage
        tone="loading"
        title={`Loading ${label.toLowerCase()}`}
        body={`Fetching your ${label.toLowerCase()} history.`}
      />
    );
  }

  return (
    <Card title={label} caption={unit || undefined}>
      {points.length < 2 ? (
        <Text style={styles.chartHint}>
          One reading so far. Log another and the trend line will appear here.
        </Text>
      ) : (
        <LineChart
          points={points}
          accessibilityLabel={`${label} over your last ${points.length} readings`}
          formatValue={(value) => formatValue(featured.type, value)}
          footerLeft={firstPoint ? formatShortDate(new Date(firstPoint.x)) : undefined}
          footerRight={lastPoint ? formatShortDate(new Date(lastPoint.x)) : undefined}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
    gap: spacing.lg,
  },
  header: { gap: spacing.xs, marginBottom: spacing.xs },
  kicker: {
    ...typography.label,
    color: colors.secondary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  greeting: { ...typography.display, color: colors.text },
  dateChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  dateChipText: { ...typography.caption, color: colors.primary, fontWeight: "600" },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.heading, color: colors.text },
  sectionCaption: { ...typography.caption, color: colors.textMuted, marginTop: -4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  chartHint: { ...typography.body, color: colors.textMuted },
});
