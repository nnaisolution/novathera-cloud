import * as SecureStore from "expo-secure-store";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

export async function readPreferenceStore(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key, secureOptions);
  } catch {
    return null;
  }
}

export async function writePreferenceStore(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, secureOptions);
}
