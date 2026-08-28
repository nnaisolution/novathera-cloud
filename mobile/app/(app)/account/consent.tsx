import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { Chip } from "../../../src/components/Chip";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";
import { StateMessage } from "../../../src/components/StateMessage";
import {
  CONSENT_PURPOSES,
  PURPOSE_COPY,
  isConsentActive,
  latestByPurpose,
  type ConsentPurpose,
  type ConsentRecord,
} from "../../../src/features/consent/consent";
import { consentMutationInput, useConsentList, useSetConsent } from "../../../src/features/consent/hooks/useConsent";
import { colors, spacing, typography } from "../../../src/theme";

export default function ConsentScreen() {
  const list = useConsentList();
  const setConsent = useSetConsent();

  const latest = latestByPurpose(list.data ?? []);
  const pendingPurpose = setConsent.isPending ? setConsent.variables?.purpose : undefined;

  async function toggle(purpose: ConsentPurpose, granted: boolean) {
    try {
      await setConsent.mutateAsync(consentMutationInput(purpose, granted));
    } catch {
      // Surfaced through `setConsent.isError` below.
    }
  }

  function requestToggle(purpose: ConsentPurpose, granted: boolean) {
    if (granted) {
      void toggle(purpose, true);
      return;
    }

    const copy = PURPOSE_COPY[purpose];
    const treatmentNote =
      purpose === "TREATMENT"
        ? " Readings cannot be saved without treatment consent."
        : "";

    Alert.alert(
      `Revoke ${copy.title.toLowerCase()}?`,
      `This takes effect immediately. You can grant it again at any time.${treatmentNote}`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => void toggle(purpose, false),
        },
      ],
    );
  }

  return (
    <Screen
      kicker="Privacy"
      title="Health data consent"
      subtitle="Treatment consent is required to save readings. You can change any of these at any time."
      refreshControl={
        <RefreshControl
          refreshing={list.isFetching && !list.isPending}
          onRefresh={() => void list.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      {list.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load your consents"
          body="Your choices are safe. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void list.refetch()}
        />
      ) : list.isPending ? (
        <StateMessage tone="loading" title="Loading your consents" body="Checking what you've granted." />
      ) : (
        <>
          {CONSENT_PURPOSES.map((purpose) => (
            <PurposeCard
              key={purpose}
              purpose={purpose}
              record={latest.get(purpose)}
              busy={pendingPurpose === purpose}
              onToggle={(granted) => requestToggle(purpose, granted)}
            />
          ))}
          {setConsent.isError ? (
            <StateMessage
              tone="error"
              title="We couldn't save that change"
              body="Please try again. Your previous choice is unchanged."
              actionLabel="Dismiss"
              onAction={() => setConsent.reset()}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

function PurposeCard({
  purpose,
  record,
  busy,
  onToggle,
}: {
  purpose: ConsentPurpose;
  record: ConsentRecord | undefined;
  busy: boolean;
  onToggle: (granted: boolean) => void;
}) {
  const copy = PURPOSE_COPY[purpose];
  const active = isConsentActive(record);
  const isTreatment = purpose === "TREATMENT";

  return (
    <Card title={copy.title} accented={isTreatment}>
      <Text style={styles.body}>{copy.body}</Text>
      <View style={styles.statusRow}>
        <Chip label={active ? "Active" : "Not granted"} tone={active ? "positive" : "attention"} />
        {record?.policyVersion ? (
          <Text style={styles.policy}>Policy {record.policyVersion}</Text>
        ) : null}
      </View>
      {active ? (
        <SecondaryButton
          label={busy ? "Updating…" : `Revoke ${copy.title.toLowerCase()}`}
          tone="danger"
          disabled={busy}
          onPress={() => onToggle(false)}
        />
      ) : (
        <PrimaryButton
          label={busy ? "Saving…" : isTreatment ? "Grant treatment consent" : `Grant ${copy.title.toLowerCase()}`}
          disabled={busy}
          onPress={() => onToggle(true)}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  body: { ...typography.body, color: colors.textMuted },
  policy: { ...typography.caption, color: colors.textMuted },
});
