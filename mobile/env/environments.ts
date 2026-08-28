export const developmentEnv = {
  name: "development" as const,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  nestApiUrl: process.env.EXPO_PUBLIC_NEST_API_URL ?? "http://localhost:4000",
  enableOtpDebugHint: true,
  calComEmbedUrl: "https://cal.com/novathera/consult",
};

export const stagingEnv = {
  name: "staging" as const,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.staging.novathera.example",
  nestApiUrl:
    process.env.EXPO_PUBLIC_NEST_API_URL ?? "https://platform.staging.novathera.example",
  enableOtpDebugHint: false,
  calComEmbedUrl: "https://cal.com/novathera/consult",
};

export const productionEnv = {
  name: "production" as const,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.novathera.example",
  nestApiUrl: process.env.EXPO_PUBLIC_NEST_API_URL ?? "https://platform.novathera.example",
  enableOtpDebugHint: false,
  calComEmbedUrl: "https://cal.com/novathera/consult",
};
