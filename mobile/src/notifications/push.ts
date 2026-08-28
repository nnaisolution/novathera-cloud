import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushPlatform = "APNS" | "FCM";

export type PushRegistration = {
  platform: PushPlatform;
  tokenHash: string;
  expoPushToken: string;
};

export type PushRegisterResult =
  | { status: "registered"; registration: PushRegistration }
  | { status: "unavailable"; message: string }
  | { status: "denied"; message: string };

function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra;
  if (extra && typeof extra === "object" && "eas" in extra) {
    const eas = extra.eas;
    if (eas && typeof eas === "object" && "projectId" in eas) {
      const id = eas.projectId;
      if (typeof id === "string" && id.length > 0) return id;
    }
  }
  return Constants.easConfig?.projectId;
}

async function hashToken(token: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
}

/**
 * Requests OS permission, reads an Expo push token, and returns a SHA-256 hash
 * for the patient API plus the live Expo token for Nest `notifications.registerDevice`.
 */
export async function registerForPush(): Promise<PushRegisterResult> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return { status: "unavailable", message: "Push notifications are not available in a browser." };
  }

  if (!Device.isDevice) {
    return {
      status: "unavailable",
      message: "Push tokens are issued to physical devices and emulators with Google Play, not simulators without that stack.",
    };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Nova Thera",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") {
    return {
      status: "denied",
      message: "Notifications are off for this app. You can enable them in system settings.",
    };
  }

  const easProjectId = projectId();
  if (!easProjectId) {
    return { status: "unavailable", message: "This build is missing an EAS project id, so a push token cannot be minted." };
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: easProjectId })).data;
    if (!token || token.length < 8) {
      return { status: "unavailable", message: "The device did not return a push token." };
    }
    const tokenHash = await hashToken(token);
    return {
      status: "registered",
      registration: {
        platform: Platform.OS === "ios" ? "APNS" : "FCM",
        tokenHash,
        expoPushToken: token,
      },
    };
  } catch {
    return {
      status: "unavailable",
      message:
        "A push token could not be created. A development or preview build is required — Expo Go on Android no longer issues remote push tokens.",
    };
  }
}

export function observeNotificationUrls(onUrl: (url: string) => void): () => void {
  const redirect = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    const url = data && typeof data === "object" && "url" in data ? data.url : undefined;
    if (typeof url === "string" && url.length > 0) onUrl(url);
  };

  const last = Notifications.getLastNotificationResponse();
  if (last?.notification) redirect(last.notification);

  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    redirect(response.notification);
  });
  return () => sub.remove();
}
