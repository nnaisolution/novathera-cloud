import { useEffect, useRef, useState } from "react";
import { RefreshControl, StyleSheet, Switch, Text, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { useLocalReminders } from "../../../src/features/notifications/hooks/useLocalReminders";
import { useNotificationPreferences } from "../../../src/features/notifications/hooks/useNotificationPreferences";
import { useRegisterPushDevice } from "../../../src/features/notifications/hooks/useRegisterPushDevice";
import {
  NOTIFICATION_PREFERENCE_KEYS,
  PREFERENCE_COPY,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "../../../src/features/notifications/preferences";
import {
  scheduleTestNotification,
  type LocalScheduleResult,
} from "../../../src/notifications/local";
import { colors, spacing, typography } from "../../../src/theme";

export default function NotificationsScreen() {
  const { query, mutation, setPreference } = useNotificationPreferences();
  const register = useRegisterPushDevice();
  useLocalReminders();
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<LocalScheduleResult | null>(null);

  const attempted = useRef(false);

  useEffect(() => {
    if (!query.data || attempted.current) return;
    attempted.current = true;
    void register.mutateAsync();
  }, [query.data, register]);

  const registerMessage =
    register.data?.status === "registered"
      ? "This device is registered for visit confirmations."
      : register.data?.status === "denied"
        ? register.data.message
        : register.data?.status === "unavailable"
          ? register.data.message
          : null;

  return (
    <Screen
      kicker="Account"
      title="Notifications"
      subtitle="Reminder choices stay on this device. Visit and health banners can fire locally without an Expo push token. Clinic confirmations still need a registered device and a server push secret."
      refreshControl={
        <RefreshControl
          refreshing={query.isFetching && !query.isPending}
          onRefresh={() => void query.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      {query.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load your preferences"
          body="Nothing on the server has changed. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void query.refetch()}
        />
      ) : query.isPending || query.data === undefined ? (
        <StateMessage
          tone="loading"
          title="Loading notification preferences"
          body="Reading what this device has stored."
        />
      ) : (
        <>
          <PreferenceCard
            prefs={query.data}
            disabled={mutation.isPending}
            onChange={setPreference}
          />

          <Card title="Test a reminder" caption="On this device">
            <Text style={styles.body}>
              Schedules a local notification in five seconds. It does not use Expo remote
              push, so it works even when EXPO_ACCESS_TOKEN is unset on the clinic API.
            </Text>
            {testBusy ? (
              <StateMessage
                tone="loading"
                title="Scheduling a test reminder"
                body="Asking the OS for notification permission if it is not already granted."
              />
            ) : testResult ? (
              <StateMessage
                tone={testResult.status === "scheduled" ? "empty" : "error"}
                title={
                  testResult.status === "scheduled"
                    ? "Test reminder scheduled"
                    : testResult.status === "denied"
                      ? "Notifications are off"
                      : "Not available here"
                }
                body={testResult.message}
              />
            ) : null}
            <PrimaryButton
              label={testBusy ? "Scheduling…" : "Send test notification"}
              disabled={testBusy}
              onPress={() => {
                setTestBusy(true);
                setTestResult(null);
                void scheduleTestNotification()
                  .then((result) => setTestResult(result))
                  .finally(() => setTestBusy(false));
              }}
            />
          </Card>

          {mutation.isError ? (
            <StateMessage
              tone="error"
              title="We couldn't save that preference"
              body="The previous choice is still stored on this device."
              actionLabel="Dismiss"
              onAction={() => mutation.reset()}
            />
          ) : null}

          <Card title="This device" caption="Push token">
            <Text style={styles.body}>
              Reminder copy will never include readings, diagnoses, or results. The patient API stores
              a hash; the clinic API stores the Expo token so a booking confirmation can be sent when
              a push secret is configured.
            </Text>
            {register.isPending ? (
              <StateMessage tone="loading" title="Registering this device" body="Asking the OS for a push token." />
            ) : registerMessage ? (
              <StateMessage
                tone={register.data?.status === "registered" ? "empty" : "error"}
                title={register.data?.status === "registered" ? "Device registered" : "Not registered"}
                body={registerMessage}
              />
            ) : null}
            <PrimaryButton
              label={register.isPending ? "Registering…" : "Register this device"}
              disabled={register.isPending}
              onPress={() => {
                register.reset();
                void register.mutateAsync();
              }}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}

function PreferenceCard({
  prefs,
  disabled,
  onChange,
}: {
  prefs: NotificationPreferences;
  disabled: boolean;
  onChange: (key: NotificationPreferenceKey, value: boolean) => void;
}) {
  return (
    <Card title="Reminders on this device" caption="Not synced">
      <Text style={styles.lead}>
        These toggles stay on the phone. Visit reminders and a daily health check-in are
        scheduled on-device when permission is on. They are not sent to the clinic.
      </Text>
      {NOTIFICATION_PREFERENCE_KEYS.map((key) => (
        <PreferenceRow
          key={key}
          preferenceKey={key}
          value={prefs[key]}
          disabled={disabled}
          onChange={(next) => onChange(key, next)}
        />
      ))}
    </Card>
  );
}

function PreferenceRow({
  preferenceKey,
  value,
  disabled,
  onChange,
}: {
  preferenceKey: NotificationPreferenceKey;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const copy = PREFERENCE_COPY[preferenceKey];

  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{copy.title}</Text>
        <Text style={styles.rowBody}>{copy.body}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.borderStrong}
        accessibilityLabel={copy.title}
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.textMuted },
  body: { ...typography.body, color: colors.textMuted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { ...typography.label, color: colors.text },
  rowBody: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
});
