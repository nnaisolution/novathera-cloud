import * as SecureStore from "expo-secure-store";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

export const HEALTHKIT_CURSOR_KEY = "nt.healthkit.syncCursor";
export const HEALTH_CONNECT_CURSOR_KEY = "nt.healthconnect.syncCursor";

export async function readSyncCursor(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key, secureOptions);
  } catch {
    return null;
  }
}

export async function writeSyncCursor(key: string, iso: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, iso, secureOptions);
  } catch {
    // Cursor persistence is best-effort; the next launch re-reads 30 days.
  }
}
