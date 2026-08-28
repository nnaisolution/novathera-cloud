import Constants from "expo-constants";
import {
  developmentEnv,
  productionEnv,
  stagingEnv,
} from "../../env/environments";

const extra = Constants.expoConfig?.extra as { appEnv?: string } | undefined;

const envMap = {
  development: developmentEnv,
  staging: stagingEnv,
  production: productionEnv,
} as const;

export type AppEnvName = keyof typeof envMap;

export const env = envMap[(extra?.appEnv as AppEnvName) ?? "development"];
