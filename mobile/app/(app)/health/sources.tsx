import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, Text } from "react-native";

import { Card } from "../../../src/components/Card";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { isConsentActive, latestByPurpose } from "../../../src/features/consent/consent";
import { useConsentList } from "../../../src/features/consent/hooks/useConsent";
import { useIngestObservations } from "../../../src/features/health/hooks/useIngestObservations";
import type { HealthObservationInput } from "../../../src/shared";
import {
  requestHealthConnectAuthorization,
  syncHealthConnectRecords,
} from "../../../src/integrations/healthConnect";
import {
  requestHealthKitAuthorization,
  syncHealthKitSamples,
} from "../../../src/integrations/healthkit";
import type { HealthSyncResult } from "../../../src/integrations/health/types";
import { colors, typography } from "../../../src/theme";

export default function HealthSourcesScreen() {
  const router = useRouter();
  const consent = useConsentList();
  const ingest = useIngestObservations();
  const [busy, setBusy] = useState<"kit" | "connect" | null>(null);
  const [result, setResult] = useState<HealthSyncResult | null>(null);

  const treatmentConsent = isConsentActive(latestByPurpose(consent.data ?? []).get("TREATMENT"));
  const ingestFn = ingest.mutateAsync;

  const syncContext = useMemo(
    () => ({
      treatmentConsent,
      ingest: (observations: HealthObservationInput[]) => ingestFn({ observations }),
    }),
    [ingestFn, treatmentConsent],
  );

  const connectHealthKit = useCallback(async () => {
    setBusy("kit");
    setResult(null);
    try {
      const auth = await requestHealthKitAuthorization();
      if (!auth.available || !auth.granted) {
        setResult({
          available: auth.available,
          granted: auth.granted,
          pulled: 0,
          ingested: 0,
          skippedConsent: false,
          partial: false,
          message: auth.message,
        });
        return;
      }
      setResult(await syncHealthKitSamples(syncContext));
    } catch {
      setResult({
        available: false,
        granted: false,
        pulled: 0,
        ingested: 0,
        skippedConsent: false,
        partial: false,
        message: "Apple Health could not be opened on this device.",
      });
    } finally {
      setBusy(null);
    }
  }, [syncContext]);

  const connectHealthConnect = useCallback(async () => {
    setBusy("connect");
    setResult(null);
    try {
      const auth = await requestHealthConnectAuthorization();
      if (!auth.available) {
        setResult({
          available: false,
          granted: false,
          pulled: 0,
          ingested: 0,
          skippedConsent: false,
          partial: false,
          message: auth.message,
        });
        return;
      }
      setResult(await syncHealthConnectRecords(syncContext));
    } catch {
      setResult({
        available: false,
        granted: false,
        pulled: 0,
        ingested: 0,
        skippedConsent: false,
        partial: false,
        message: "Health Connect could not be opened on this device.",
      });
    } finally {
      setBusy(null);
    }
  }, [syncContext]);

  const onWeb = Platform.OS === "web";
  const kitSupported = Platform.OS === "ios";
  const connectSupported = Platform.OS === "android";

  return (
    <Screen
      kicker="Connected sources"
      title="Data sources"
      subtitle="Apple Health and Health Connect need a native Nova Thera build. Expo Go and the browser cannot load those modules."
    >
      {onWeb ? (
        <StateMessage
          tone="empty"
          title="Not available in a browser"
          body="Connect Apple Health on iPhone or Health Connect on Android from the installed app. Web is for layout only."
        />
      ) : null}

      {!treatmentConsent ? (
        <StateMessage
          tone="error"
          title="Treatment consent is off"
          body="You can still grant OS permission, but readings are not saved to your care record until treatment consent is active."
          actionLabel="Review consent"
          onAction={() => router.push("/(app)/account/consent")}
        />
      ) : null}

      <Card title="Apple Health" caption="iPhone · HealthKit">
        <Text style={styles.body}>
          Reads weight, blood pressure, glucose, heart rate, oxygen, temperature, steps, sleep, and
          active energy. The first sync covers the last 30 days; later opens only pull what is new.
        </Text>
        <PrimaryButton
          label={busy === "kit" ? "Connecting…" : "Connect Health"}
          disabled={busy !== null || !kitSupported}
          onPress={() => void connectHealthKit()}
        />
        {!kitSupported && !onWeb ? (
          <Text style={styles.hint}>Apple Health is only offered on iPhone.</Text>
        ) : null}
      </Card>

      <Card title="Health Connect" caption="Android">
        <Text style={styles.body}>
          Same types, including partial permissions — only the categories you allow are imported.
          Missing Play services or Health Connect is treated as unavailable, not a crash.
        </Text>
        <PrimaryButton
          label={busy === "connect" ? "Connecting…" : "Connect Health Connect"}
          disabled={busy !== null || !connectSupported}
          onPress={() => void connectHealthConnect()}
        />
        {!connectSupported && !onWeb ? (
          <Text style={styles.hint}>Health Connect is only offered on Android.</Text>
        ) : null}
      </Card>

      {result ? (
        <StateMessage
          tone={result.granted || result.available ? "empty" : "error"}
          title={result.granted ? "Sync finished" : "Could not sync"}
          body={result.message}
          note={
            result.partial
              ? "Some Health Connect types were not allowed. You can grant more later."
              : result.skippedConsent
                ? "Nothing was uploaded because treatment consent is off."
                : undefined
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textMuted },
});
