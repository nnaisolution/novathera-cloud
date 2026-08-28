export const publicBackendEnv = {
  development: {
    name: "development" as const,
    apiBaseUrl: "http://localhost:3000",
  },
  staging: {
    name: "staging" as const,
    apiBaseUrl: "https://api.staging.novathera.example",
  },
  production: {
    name: "production" as const,
    apiBaseUrl: "https://api.novathera.example",
  },
};
