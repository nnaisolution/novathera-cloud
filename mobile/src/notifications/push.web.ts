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

export async function registerForPush(): Promise<PushRegisterResult> {
  return {
    status: "unavailable",
    message: "Push notifications are not available in a browser. Use the iOS or Android app.",
  };
}

export function observeNotificationUrls(_onUrl: (url: string) => void): () => void {
  return () => {
    return;
  };
}
