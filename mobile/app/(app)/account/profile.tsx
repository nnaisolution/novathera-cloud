import { useState, type ReactNode } from "react";
import { RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";
import { StateMessage } from "../../../src/components/StateMessage";
import { usePatientProfile } from "../../../src/features/patient/hooks/usePatientProfile";
import { useUpdatePatientProfile } from "../../../src/features/patient/hooks/useUpdatePatientProfile";
import {
  DISPLAY_NAME_MAX,
  LOCALE_MAX,
  TIMEZONE_MAX,
  buildPatch,
  describeLocale,
  deviceRegionalSettings,
  isEmptyPatch,
  validateDraft,
  type ProfileDraft,
} from "../../../src/features/patient/profile";
import { colors, radii, spacing, typography } from "../../../src/theme";

export default function ProfileScreen() {
  const profile = usePatientProfile();
  const update = useUpdatePatientProfile();

  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [saved, setSaved] = useState(false);

  const record = profile.data ?? null;

  const stored: ProfileDraft | null = record
    ? {
        displayName: record.displayName ?? "",
        locale: record.locale,
        timezone: record.timezone,
      }
    : null;

  // The draft, once started, wins over background refetches so typing is never
  // overwritten mid-edit.
  const current = draft ?? stored;

  const patch = current && stored ? buildPatch(current, stored) : {};
  const dirty = !isEmptyPatch(patch);
  const validationError = current ? validateDraft(current) : null;

  const device = deviceRegionalSettings();
  const deviceDiffers =
    device !== null &&
    current !== null &&
    (device.locale !== current.locale.trim() || device.timezone !== current.timezone.trim());

  const clearFeedback = () => {
    setSaved(false);
    if (update.isError) update.reset();
  };

  const edit = (field: keyof ProfileDraft, value: string) => {
    if (!current) return;
    clearFeedback();
    setDraft({ ...current, [field]: value });
  };

  async function handleSave() {
    if (!current || validationError || !dirty) return;
    setSaved(false);
    try {
      await update.mutateAsync(patch);
      // Clearing the draft lets the refetched record become the source of truth.
      setDraft(null);
      setSaved(true);
    } catch {
      // Surfaced through `update.isError` below.
    }
  }

  return (
    <Screen
      kicker="Account"
      title="Patient profile"
      subtitle="What Nova Thera holds about you, and the parts you can change yourself."
      refreshControl={
        <RefreshControl
          refreshing={profile.isFetching && !profile.isPending}
          onRefresh={() => void profile.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      {profile.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load your profile"
          body="Your record is safe. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void profile.refetch()}
        />
      ) : profile.isPending ? (
        <StateMessage tone="loading" title="Loading your profile" body="Fetching your details." />
      ) : record === null || current === null ? (
        <StateMessage
          tone="error"
          title="We couldn't find your record"
          body="You're signed in, but this patient record no longer exists. Please contact the clinic so they can sort it out."
        />
      ) : (
        <>
          <Card title="Your name" caption="Used in greetings">
            <Field
              label="Display name"
              hint={`How the app addresses you. Up to ${DISPLAY_NAME_MAX} characters.`}
            >
              <TextInput
                value={current.displayName}
                onChangeText={(value) => edit("displayName", value)}
                placeholder="e.g. Alex Chen"
                placeholderTextColor={colors.textMuted}
                maxLength={DISPLAY_NAME_MAX}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                accessibilityLabel="Display name"
              />
            </Field>
          </Card>

          <Card title="Language and time zone" caption="Affects formatting">
            <Field label="Language" hint={`Tag like "en" or "en-CA". ${describeLocale(current.locale)}.`}>
              <TextInput
                value={current.locale}
                onChangeText={(value) => edit("locale", value)}
                placeholder="en-CA"
                placeholderTextColor={colors.textMuted}
                maxLength={LOCALE_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                accessibilityLabel="Language tag"
              />
            </Field>

            <Field label="Time zone" hint="IANA name, like America/Toronto.">
              <TextInput
                value={current.timezone}
                onChangeText={(value) => edit("timezone", value)}
                placeholder="America/Toronto"
                placeholderTextColor={colors.textMuted}
                maxLength={TIMEZONE_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                accessibilityLabel="Time zone"
              />
            </Field>

            {deviceDiffers && device ? (
              <SecondaryButton
                label="Match this device"
                onPress={() => {
                  clearFeedback();
                  setDraft({ ...current, locale: device.locale, timezone: device.timezone });
                }}
              />
            ) : null}
            <Text style={styles.hint}>
              Appointment times are always shown in the clinic&apos;s own time zone, whatever this is
              set to.
            </Text>
          </Card>

          {validationError ? (
            <StateMessage tone="error" title="That change can't be saved" body={validationError} />
          ) : null}
          {update.isError ? (
            <StateMessage
              tone="error"
              title="We couldn't save your changes"
              body="Please try again. Nothing in your record has changed."
            />
          ) : null}
          {saved && !dirty ? <Text style={styles.success}>Profile saved.</Text> : null}

          <PrimaryButton
            label={update.isPending ? "Saving…" : "Save changes"}
            disabled={!dirty || validationError !== null || update.isPending}
            onPress={() => void handleSave()}
          />
          {dirty && !update.isPending ? (
            <SecondaryButton
              label="Discard changes"
              onPress={() => {
                setDraft(null);
                clearFeedback();
              }}
            />
          ) : null}

          <Card title="Your record">
            <ReadOnlyRow label="Patient ID" value={record.id} />
            <ReadOnlyRow label="With Nova Thera since" value={formatJoined(record.createdAt)} />
          </Card>

          <Card title="Held by the clinic, not shown here">
            <Text style={styles.body}>
              Your phone number is the credential you sign in with. It&apos;s stored encrypted and
              hashed for lookup, and the app is never sent it back — so it can&apos;t be displayed or
              changed here.
            </Text>
            <Text style={styles.body}>
              Nova Thera doesn&apos;t keep an email address or postal address for you at all. Date of
              birth and sex at birth sit on your clinical record, which this app has no read access
              to. Ask the clinic to change any of these.
            </Text>
          </Card>
        </>
      )}
    </Screen>
  );
}

function formatJoined(createdAt: Date): string {
  if (Number.isNaN(createdAt.getTime())) return "Unknown";
  return createdAt.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function Field({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  fieldLabel: {
    ...typography.label,
    color: colors.secondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 17,
    color: colors.text,
  },
  hint: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
  body: { ...typography.body, color: colors.textMuted },
  success: { ...typography.caption, color: colors.success, lineHeight: 17 },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.label, color: colors.text, flexShrink: 1 },
});
