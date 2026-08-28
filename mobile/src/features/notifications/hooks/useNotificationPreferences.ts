import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationPreferences,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "../preferences";
import { readPreferenceStore, writePreferenceStore } from "../preferenceStore";

const PREFS_KEY = "nt.notificationPreferences";
const QUERY_KEY = ["notification-preferences"] as const;

async function loadPreferences(): Promise<NotificationPreferences> {
  const raw = await readPreferenceStore(PREFS_KEY);
  if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;

  const parsed: unknown = JSON.parse(raw);
  return isNotificationPreferences(parsed) ? parsed : DEFAULT_NOTIFICATION_PREFERENCES;
}

async function persistPreferences(next: NotificationPreferences): Promise<NotificationPreferences> {
  await writePreferenceStore(PREFS_KEY, JSON.stringify(next));
  return next;
}

/**
 * Device-side reminder toggles. There is no patient notification-preference
 * procedure. Device registration is a separate mutation on the patient API
 * and Nest `notifications.registerDevice`.
 */
export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadPreferences,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: persistPreferences,
    onSuccess: (next) => {
      queryClient.setQueryData(QUERY_KEY, next);
    },
  });

  const setPreference = (key: NotificationPreferenceKey, value: boolean) => {
    const current = query.data ?? DEFAULT_NOTIFICATION_PREFERENCES;
    mutation.mutate({ ...current, [key]: value });
  };

  return { query, mutation, setPreference };
}
