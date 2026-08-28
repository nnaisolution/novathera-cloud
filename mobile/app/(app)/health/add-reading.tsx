import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import type { HealthObservationInput, ObservationType } from "../../../src/shared";
import { CANONICAL_UNITS } from "../../../src/shared";

import { Card } from "../../../src/components/Card";
import { OptionSelector, type SelectorOption } from "../../../src/components/OptionSelector";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { isConsentRequiredError } from "../../../src/features/consent/consent";
import { useIngestObservations } from "../../../src/features/health/hooks/useIngestObservations";
import { OBSERVATION_LABELS, OBSERVATION_SHORT_LABELS } from "../../../src/features/health/observations";
import { toNormalizedObservation, validateObservation } from "../../../src/health/process";
import { writeObservationToHealthConnect } from "../../../src/integrations/healthConnect";
import { writeObservationToHealthKit } from "../../../src/integrations/healthkit";
import { colors, radii, spacing, typography } from "../../../src/theme";

/** Types the manual form covers. HEIGHT / STEPS / OTHER stay out of this screen. */
const MANUAL_TYPES = [
  "WEIGHT",
  "BLOOD_PRESSURE",
  "BLOOD_GLUCOSE",
  "HEART_RATE",
  "SPO2",
  "BODY_TEMPERATURE",
  "PAIN",
] as const satisfies readonly ObservationType[];

type ManualType = (typeof MANUAL_TYPES)[number];

const TYPE_OPTIONS: SelectorOption<ManualType>[] = MANUAL_TYPES.map((type) => ({
  value: type,
  label: OBSERVATION_SHORT_LABELS[type],
}));

const PAIN_OPTIONS: SelectorOption<string>[] = Array.from({ length: 11 }, (_, score) => ({
  value: String(score),
  label: String(score),
}));

const LOINC_SYSTOLIC = "8480-6";
const LOINC_DIASTOLIC = "8462-4";

const FIELD_HINTS: Record<ManualType, string> = {
  WEIGHT: "Recorded in kg. Values are normalized before upload.",
  BLOOD_PRESSURE: "Systolic and diastolic in mmHg, stored as a pair.",
  BLOOD_GLUCOSE: "Recorded in mmol/L.",
  HEART_RATE: "Beats per minute.",
  SPO2: "Oxygen saturation as a percentage.",
  BODY_TEMPERATURE: "Recorded in °C.",
  PAIN: "0 is no pain, 10 is the worst pain imaginable.",
};

const PLACEHOLDERS: Record<Exclude<ManualType, "BLOOD_PRESSURE" | "PAIN">, string> = {
  WEIGHT: "e.g. 72.4",
  BLOOD_GLUCOSE: "e.g. 5.4",
  HEART_RATE: "e.g. 68",
  SPO2: "e.g. 98",
  BODY_TEMPERATURE: "e.g. 36.6",
};

function parseQuantity(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

function unitFor(type: ManualType): string {
  return CANONICAL_UNITS[type] ?? "";
}

function buildInput(
  type: ManualType,
  value: string,
  systolic: string,
  diastolic: string,
  pain: string,
): HealthObservationInput {
  const effectiveAt = new Date().toISOString();
  if (type === "BLOOD_PRESSURE") {
    const systolicValue = parseQuantity(systolic);
    const diastolicValue = parseQuantity(diastolic);
    const components =
      systolicValue !== undefined && diastolicValue !== undefined
        ? [
            { code: LOINC_SYSTOLIC, valueQuantity: systolicValue, unit: "mmHg" },
            { code: LOINC_DIASTOLIC, valueQuantity: diastolicValue, unit: "mmHg" },
          ]
        : undefined;
    return { type, source: "MANUAL", effectiveAt, components };
  }
  const valueQuantity = type === "PAIN" ? parseQuantity(pain) : parseQuantity(value);
  return {
    type,
    source: "MANUAL",
    effectiveAt,
    valueQuantity,
    valueUnit: unitFor(type),
  };
}

export default function AddReadingScreen() {
  const router = useRouter();
  const ingest = useIngestObservations();
  const [type, setType] = useState<ManualType>("WEIGHT");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pain, setPain] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const consentRequired = ingest.isError && isConsentRequiredError(ingest.error);

  function clearFeedback() {
    setValidationMessage(null);
    if (ingest.isError || ingest.isSuccess) ingest.reset();
  }

  function resetFields() {
    setValue("");
    setSystolic("");
    setDiastolic("");
    setPain("");
  }

  function onChangeType(next: ManualType) {
    setType(next);
    resetFields();
    clearFeedback();
  }

  async function onSave() {
    const input = buildInput(type, value, systolic, diastolic, pain);
    const errors = validateObservation(input);
    if (errors.length) {
      setValidationMessage(errors[0]);
      return;
    }
    setValidationMessage(null);
    ingest.reset();
    const observation = await toNormalizedObservation(input);
    try {
      await ingest.mutateAsync({ observations: [observation] });
      void writeObservationToHealthKit(observation);
      void writeObservationToHealthConnect(observation);
      resetFields();
    } catch {
      // Surfaced through `ingest.isError` below.
    }
  }

  return (
    <Screen
      kicker="Manual entry"
      title="Add a reading"
      subtitle="Pick a metric, enter the value, and it is validated and normalized before it reaches your record."
    >
      <OptionSelector
        options={TYPE_OPTIONS}
        value={type}
        onChange={onChangeType}
        accessibilityLabel="Choose a reading type"
        layout="scroll"
      />
      <Card>
        {type === "BLOOD_PRESSURE" ? (
          <>
            <Text style={styles.fieldLabel}>Systolic</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 120"
              placeholderTextColor={colors.textMuted}
              value={systolic}
              onChangeText={(next) => {
                setSystolic(next);
                clearFeedback();
              }}
              style={styles.input}
              accessibilityLabel="Systolic blood pressure in mmHg"
            />
            <Text style={styles.fieldLabel}>Diastolic</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g. 80"
              placeholderTextColor={colors.textMuted}
              value={diastolic}
              onChangeText={(next) => {
                setDiastolic(next);
                clearFeedback();
              }}
              style={styles.input}
              accessibilityLabel="Diastolic blood pressure in mmHg"
            />
          </>
        ) : type === "PAIN" ? (
          <>
            <Text style={styles.fieldLabel}>{OBSERVATION_LABELS[type]}</Text>
            <OptionSelector
              options={PAIN_OPTIONS}
              value={pain}
              onChange={(next) => {
                setPain(next);
                clearFeedback();
              }}
              accessibilityLabel="Pain score from 0 to 10"
              layout="scroll"
            />
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>{OBSERVATION_LABELS[type]}</Text>
            <TextInput
              keyboardType={type === "HEART_RATE" || type === "SPO2" ? "number-pad" : "decimal-pad"}
              placeholder={PLACEHOLDERS[type]}
              placeholderTextColor={colors.textMuted}
              value={value}
              onChangeText={(next) => {
                setValue(next);
                clearFeedback();
              }}
              style={styles.input}
              accessibilityLabel={`${OBSERVATION_LABELS[type]} in ${unitFor(type)}`}
            />
          </>
        )}
        <Text style={styles.fieldHint}>{FIELD_HINTS[type]}</Text>
      </Card>
      {validationMessage ? (
        <StateMessage tone="error" title="That reading can't be saved" body={validationMessage} />
      ) : null}
      {consentRequired ? (
        <StateMessage
          tone="error"
          title="Treatment consent is required"
          body="Readings are only stored while treatment consent is active. Grant it, then come back and save again."
          actionLabel="Review consent"
          onAction={() => router.push("/(app)/account/consent")}
        />
      ) : ingest.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't save that reading"
          body="Check that you're still signed in, then try again."
        />
      ) : ingest.isSuccess ? (
        <StateMessage
          tone="empty"
          title="Reading saved"
          body="It's on your record and will show on the dashboard."
          actionLabel="Done"
          onAction={() => router.back()}
        />
      ) : null}
      <PrimaryButton
        label={ingest.isPending ? "Saving…" : ingest.isSuccess ? "Saved" : "Save securely"}
        disabled={ingest.isPending || ingest.isSuccess}
        onPress={() => void onSave()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { ...typography.label, color: colors.secondary, letterSpacing: 0.4, textTransform: "uppercase" },
  fieldHint: { ...typography.caption, color: colors.textMuted },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 20,
    color: colors.text,
  },
});
