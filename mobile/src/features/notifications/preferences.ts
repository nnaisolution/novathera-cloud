export const NOTIFICATION_PREFERENCE_KEYS = [
  "appointmentReminders",
  "aftercareReminders",
  "programUpdates",
] as const;

export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  appointmentReminders: true,
  aftercareReminders: true,
  programUpdates: true,
};

export type PreferenceCopy = {
  title: string;
  body: string;
};

export const PREFERENCE_COPY: Record<NotificationPreferenceKey, PreferenceCopy> = {
  appointmentReminders: {
    title: "Visit reminders",
    body: "Upcoming clinic appointments.",
  },
  aftercareReminders: {
    title: "Aftercare",
    body: "Follow-up checklists after a procedure.",
  },
  programUpdates: {
    title: "Program updates",
    body: "Changes your care team makes to a treatment program.",
  },
};

export function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return NOTIFICATION_PREFERENCE_KEYS.every((key) => typeof record[key] === "boolean");
}
