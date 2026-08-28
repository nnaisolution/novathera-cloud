export type LocalPermissionStatus = "granted" | "denied" | "unavailable";

export type LocalScheduleResult =
  | { status: "scheduled"; message: string }
  | { status: "denied"; message: string }
  | { status: "unavailable"; message: string };

export type LocalVisitReminder = {
  id: string;
  title: string;
  startTime: Date;
};

export type LocalReminderPlan = {
  appointmentReminders: boolean;
  aftercareReminders: boolean;
  visits: readonly LocalVisitReminder[];
};

const WEB: LocalScheduleResult = {
  status: "unavailable",
  message: "Local reminders are not available in a browser. Use the iOS or Android app.",
};

export async function getLocalNotificationPermission(): Promise<LocalPermissionStatus> {
  return "unavailable";
}

export async function requestLocalNotificationPermission(): Promise<LocalPermissionStatus> {
  return "unavailable";
}

export async function syncLocalReminders(_plan: LocalReminderPlan): Promise<void> {
  return;
}

export async function scheduleTestNotification(): Promise<LocalScheduleResult> {
  return WEB;
}
