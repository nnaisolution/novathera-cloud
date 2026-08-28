const memoryStore = new Map<string, string>();

export async function readPreferenceStore(key: string): Promise<string | null> {
  return memoryStore.get(key) ?? null;
}

export async function writePreferenceStore(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);
}
