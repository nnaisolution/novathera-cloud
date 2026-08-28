const APP_ENV = process.env.APP_ENV ?? "development";

const config = {
  name: "Nova Thera",
  slug: "nova-thera-mobile-health-companion",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "novathera",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.novathera.companion",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      NSHealthShareUsageDescription:
        "Nova Thera reads selected Health data only after you grant consent, to support your care plan.",
      NSHealthUpdateUsageDescription:
        "Nova Thera may write readings you enter in the app to Apple Health when you allow it.",
      NSCameraUsageDescription:
        "Camera access is unused unless a future care feature explicitly requests it.",
    },
    entitlements: {
      "com.apple.developer.healthkit": true,
    },
  },
  android: {
    package: "com.novathera.companion",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      // Warm Ivory — brand palette (see src/theme/colors.ts)
      backgroundColor: "#F7F4EE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.health.READ_HEART_RATE",
      "android.permission.health.WRITE_HEART_RATE",
      "android.permission.health.READ_BLOOD_PRESSURE",
      "android.permission.health.WRITE_BLOOD_PRESSURE",
      "android.permission.health.READ_BLOOD_GLUCOSE",
      "android.permission.health.WRITE_BLOOD_GLUCOSE",
      "android.permission.health.READ_WEIGHT",
      "android.permission.health.WRITE_WEIGHT",
      "android.permission.health.READ_OXYGEN_SATURATION",
      "android.permission.health.WRITE_OXYGEN_SATURATION",
      "android.permission.health.READ_BODY_TEMPERATURE",
      "android.permission.health.WRITE_BODY_TEMPERATURE",
      "android.permission.health.READ_STEPS",
      "android.permission.health.WRITE_STEPS",
      "android.permission.health.READ_SLEEP",
      "android.permission.health.WRITE_SLEEP",
      "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
      "android.permission.health.WRITE_ACTIVE_CALORIES_BURNED",
      "android.permission.health.READ_HEALTH_DATA_HISTORY",
      "android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND",
      "android.permission.ACTIVITY_RECOGNITION",
      "android.permission.POST_NOTIFICATIONS",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: false,
        data: [{ scheme: "novathera" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "react-native-health",
      {
        healthSharePermission:
          "Nova Thera reads selected Health data only after you grant consent, to support your care plan.",
        healthUpdatePermission:
          "Nova Thera may write readings you enter in the app to Apple Health when you allow it.",
      },
    ],
    "react-native-health-connect",
    [
      "expo-notifications",
      {
        color: "#183C35",
        defaultChannel: "default",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 26,
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        // Wordmark is wide; ~280px keeps it readable on phone splash.
        imageWidth: 280,
        // Primary Forest — brand palette (see src/theme/colors.ts).
        // Kept dark so the light wordmark stays legible.
        backgroundColor: "#183C35",
      },
    ],
  ],
  extra: {
    appEnv: APP_ENV,
    eas: {
      projectId:  "8369e690-dee2-4bb4-8d6b-59ae8f8c0908",
    },
  },
  experiments: {
    // Disabled: npm workspaces hoists `expo` to the repo root but keeps
    // `expo-router` under mobile/node_modules, so @expo/router-server cannot
    // resolve `expo-router/_ctx-shared` and the CLI crashes on boot. Metro
    // resolves from mobile/ and is unaffected. Re-enable once the Expo app no
    // longer shares a hoisted node_modules with the backend workspaces.
    typedRoutes: false,
  },
};

module.exports = config;
