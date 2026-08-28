import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

const CHANNEL_ID = "default";
const TEST_ID = "nt.local.test";
const HEALTH_DAILY_ID = "nt.local.health.daily";
const VISIT_PREFIX = "nt.local.visit.";

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

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Nova Thera",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getLocalNotificationPermission(): Promise<LocalPermissionStatus> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return "unavailable";
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return "granted";
    if (existing.status === "denied") return "denied";
    return "denied";
  } catch {
    return "unavailable";
  }
}

/**
 * OS permission for local banners only. Does not mint an Expo push token.
 */
export async function requestLocalNotificationPermission(): Promise<LocalPermissionStatus> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return "unavailable";
  }

  try {
    await ensureAndroidChannel();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return "granted";
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted" ? "granted" : "denied";
  } catch {
    return "unavailable";
  }
}

async function cancelByPrefix(prefix: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(prefix))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

function visitTriggerDate(startTime: Date, now: Date): Date | null {
  if (Number.isNaN(startTime.getTime()) || startTime.getTime() <= now.getTime()) return null;

  const hourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
  if (hourBefore.getTime() > now.getTime() + 15_000) return hourBefore;

  const fiveBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
  if (fiveBefore.getTime() > now.getTime() + 15_000) return fiveBefore;

  return null;
}

/**
 * Rebuild visit and daily health reminders from device prefs. Skips silently
 * when permission is off so opening Care does not prompt.
 */
export async function syncLocalReminders(plan: LocalReminderPlan): Promise<void> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;

  const permission = await getLocalNotificationPermission();
  if (permission !== "granted") {
    try {
      await cancelByPrefix("nt.local.visit.");
      await Notifications.cancelScheduledNotificationAsync(HEALTH_DAILY_ID);
    } catch {
      // Nothing scheduled yet.
    }
    return;
  }

  await ensureAndroidChannel();

  await cancelByPrefix(VISIT_PREFIX);
  if (plan.appointmentReminders) {
    const now = new Date();
    for (const visit of plan.visits) {
      const fireAt = visitTriggerDate(visit.startTime, now);
      if (!fireAt) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `${VISIT_PREFIX}${visit.id}`,
        content: {
          title: "Upcoming visit",
          body: `${visit.title} is coming up. Open Nova Thera for the time and location.`,
          data: { url: `novathera://care/appointments/${visit.id}` },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId: CHANNEL_ID,
        },
      });
    }
  }

  await Notifications.cancelScheduledNotificationAsync(HEALTH_DAILY_ID);
  if (plan.aftercareReminders) {
    await Notifications.scheduleNotificationAsync({
      identifier: HEALTH_DAILY_ID,
      content: {
        title: "Health check-in",
        body: "A reminder to log a reading or review aftercare. Nothing clinical is included in this banner.",
        data: { url: "novathera://care/aftercare" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function scheduleTestNotification(): Promise<LocalScheduleResult> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return {
      status: "unavailable",
      message: "Local reminders are not available in a browser. Use the iOS or Android app.",
    };
  }

  if (!Device.isDevice && Platform.OS === "ios") {
    return {
      status: "unavailable",
      message: "iOS Simulator does not deliver local notifications reliably. Use a physical iPhone.",
    };
  }

  const permission = await requestLocalNotificationPermission();
  if (permission === "unavailable") {
    return {
      status: "unavailable",
      message: "This build cannot schedule local notifications. A development or preview client is required.",
    };
  }
  if (permission !== "granted") {
    return {
      status: "denied",
      message: "Notifications are off for this app. You can enable them in system settings, then try again.",
    };
  }

  await ensureAndroidChannel();
  await Notifications.cancelScheduledNotificationAsync(TEST_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: TEST_ID,
    content: {
      title: "Nova Thera test reminder",
      body: "This is a local notification on this device. It does not use Expo's remote push service.",
      data: { url: "novathera://care/appointments" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });

  return {
    status: "scheduled",
    message: "A test reminder will appear in about five seconds. Keep the app in the background to see the banner.",
  };
}
