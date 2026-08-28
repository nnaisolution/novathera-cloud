import { Stack, useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { ObservationType } from "../../../src/shared";

import { Card } from "../../../src/components/Card";
import { LineChart } from "../../../src/components/LineChart";
import { OptionSelector, type SelectorOption } from "../../../src/components/OptionSelector";
import { StateMessage } from "../../../src/components/StateMessage";
import {
  useLatestObservations,
  useObservationSeries,
} from "../../../src/features/health/hooks/useObservations";
import {
  OBSERVATION_LABELS,
  OBSERVATION_SHORT_LABELS,
  formatShortDate,
  formatUnit,
  formatValue,
  isChartable,
  summarize,
  type ObservationStats,
} from "../../../src/features/health/observations";
import { RANGE_OPTIONS, windowObservations, type RangeDays } from "../../../src/features/health/window";
import { colors, radii, spacing, stackHeaderOptions, typography } from "../../../src/theme";

const SCREEN_OPTIONS = {
  ...stackHeaderOptions,
  title: "Trends",
};

/** Selector values have to be strings, so the numeric range round-trips here. */
type RangeValue = `${RangeDays}`;

const RANGE_BY_VALUE: Record<RangeValue, RangeDays> = { "7": 7, "30": 30, "90": 90 };

const RANGE_SELECTOR_OPTIONS: SelectorOption<RangeValue>[] = RANGE_OPTIONS.map((days) => ({
  value: `${days}`,
  label: `${days} days`,
}));

export default function TrendsScreen() {
  const router = useRouter();
  const now = new Date();

  const latest = useLatestObservations();
  const [chosenType, setChosenType] = useState<ObservationType | null>(null);
  const [range, setRange] = useState<RangeDays>(30);

  // Blood pressure is left out rather than offered and then broken: its value
  // lives in a `components` column that `health.list` does not select.
  const availableTypes = latest.entries.filter((entry) => isChartable(entry.type)).map((entry) => entry.type);
  const hasBloodPressureData = latest.entries.some((entry) => entry.type === "BLOOD_PRESSURE");

  const selectedType =
    chosenType !== null && availableTypes.includes(chosenType) ? chosenType : (availableTypes[0] ?? null);

  const series = useObservationSeries(selectedType);
  const window = windowObservations(series.data ?? [], range, now);

  if (latest.isError) {
    return (
      <TrendsShell>
        <StateMessage
          tone="error"
          title="We couldn't load your trends"
          body="Your data is safe. Try again in a moment."
          actionLabel="Retry"
          onAction={latest.refetch}
        />
      </TrendsShell>
    );
  }

  if (latest.isPending) {
    return (
      <TrendsShell>
        <StateMessage tone="loading" title="Loading your trends" body="Checking which metrics you're tracking." />
      </TrendsShell>
    );
  }

  if (selectedType === null) {
    return (
      <TrendsShell>
        <StateMessage
          tone="empty"
          title="Nothing to chart yet"
          body={
            hasBloodPressureData
              ? "Your blood pressure readings are saved, but this view can't chart them. Log a weight, pulse, or glucose reading to start a trend."
              : "Trends appear once you've logged a reading. Weight, pulse, and glucose are good places to start."
          }
          note="Readings can only be saved while your treatment consent is active."
          actionLabel="Add a reading"
          onAction={() => router.push("/(app)/health/add-reading")}
        />
      </TrendsShell>
    );
  }

  const label = OBSERVATION_LABELS[selectedType];
  const unit = formatUnit(selectedType, series.data?.[0]?.unit ?? null);
  const stats = summarize(window.observations);

  const metricOptions: SelectorOption<ObservationType>[] = availableTypes.map((type) => ({
    value: type,
    label: OBSERVATION_SHORT_LABELS[type],
  }));

  return (
    <TrendsShell>
      {metricOptions.length > 1 ? (
        <OptionSelector
          options={metricOptions}
          value={selectedType}
          onChange={setChosenType}
          accessibilityLabel="Choose a metric"
          layout="scroll"
        />
      ) : null}

      <OptionSelector
        options={RANGE_SELECTOR_OPTIONS}
        value={`${range}`}
        onChange={(next) => setRange(RANGE_BY_VALUE[next])}
        accessibilityLabel="Choose a time range"
      />

      {series.isError ? (
        <StateMessage
          tone="error"
          title={`We couldn't load ${label.toLowerCase()}`}
          body="Try again in a moment. Your other readings are unchanged."
          actionLabel="Retry"
          onAction={() => void series.refetch()}
        />
      ) : series.isPending ? (
        <StateMessage
          tone="loading"
          title={`Loading ${label.toLowerCase()}`}
          body={`Fetching your ${label.toLowerCase()} history.`}
        />
      ) : (
        <Card title={label} caption={unit || undefined}>
          {window.observations.length === 0 ? (
            <Text style={styles.hint}>
              No {label.toLowerCase()} readings in the last {range} days. Try a wider range.
            </Text>
          ) : window.observations.length === 1 ? (
            <Text style={styles.hint}>Only one reading in this range. A second one draws the line.</Text>
          ) : (
            <LineChart
              points={window.observations.map((entry) => ({
                x: entry.effectiveAt.getTime(),
                y: entry.value ?? 0,
              }))}
              height={200}
              accessibilityLabel={`${label} across the last ${range} days, ${window.observations.length} readings`}
              formatValue={(value) => formatValue(selectedType, value)}
              footerLeft={formatShortDate(window.start)}
              footerRight={formatShortDate(window.end)}
            />
          )}
        </Card>
      )}

      {stats ? <SummaryGrid type={selectedType} unit={unit} stats={stats} /> : null}

      {window.mayBeIncomplete ? (
        <Notice title="This window may be incomplete">
          Your health record returns at most 100 readings at a time and can&apos;t be filtered by date. The
          oldest {label.toLowerCase()} reading we received is newer than {range} days ago, so earlier readings
          in this range exist but weren&apos;t sent.
        </Notice>
      ) : null}

      {hasBloodPressureData ? (
        <Notice title="Blood pressure isn't charted here">
          Systolic and diastolic are recorded as a pair, and this view only receives a single normalized value,
          so plotting it would misrepresent the reading.
        </Notice>
      ) : null}
    </TrendsShell>
  );
}

function TrendsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeBody}>{children}</Text>
    </View>
  );
}

type SummaryGridProps = {
  type: ObservationType;
  unit: string;
  stats: ObservationStats;
};

function SummaryGrid({ type, unit, stats }: SummaryGridProps) {
  const cells = [
    { key: "latest", label: "Latest", value: formatValue(type, stats.latest) },
    { key: "average", label: "Average", value: formatValue(type, stats.average) },
    { key: "min", label: "Lowest", value: formatValue(type, stats.min) },
    { key: "max", label: "Highest", value: formatValue(type, stats.max) },
  ];

  return (
    <Card title="In this range" caption={`${stats.count} reading${stats.count === 1 ? "" : "s"}`}>
      <View style={styles.summaryGrid}>
        {cells.map((cell) => (
          <View key={cell.key} style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>{cell.label}</Text>
            <View style={styles.summaryValueRow}>
              <Text style={styles.summaryValue}>{cell.value}</Text>
              {unit ? <Text style={styles.summaryUnit}>{unit}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl + spacing.sm, gap: spacing.md },
  hint: { ...typography.body, color: colors.textMuted },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  summaryCell: { flexGrow: 1, flexBasis: "45%", gap: 2 },
  summaryLabel: { ...typography.caption, color: colors.textMuted },
  summaryValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  summaryValue: { ...typography.title, color: colors.text },
  summaryUnit: { ...typography.caption, color: colors.textMuted },
  notice: {
    backgroundColor: colors.accentMuted,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: spacing.md,
    gap: 4,
  },
  noticeTitle: { ...typography.label, color: colors.text },
  noticeBody: { ...typography.caption, color: colors.text, lineHeight: 18 },
});
