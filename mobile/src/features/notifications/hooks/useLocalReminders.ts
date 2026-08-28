import { useEffect } from "react";

import { useMyBookings } from "../../bookings/hooks/useBookings";
import { syncLocalReminders } from "../../../notifications/local";
import { useNotificationPreferences } from "./useNotificationPreferences";

/**
 * Keeps on-device visit and daily health reminders in sync with SecureStore
 * prefs and upcoming Nest bookings. Does not require an Expo push token.
 */
export function useLocalReminders() {
  const { query } = useNotificationPreferences();
  const bookings = useMyBookings("upcoming", 1);

  useEffect(() => {
    const prefs = query.data;
    if (!prefs) return;

    void syncLocalReminders({
      appointmentReminders: prefs.appointmentReminders,
      aftercareReminders: prefs.aftercareReminders,
      visits: (bookings.data?.items ?? []).map((item) => ({
        id: item.id,
        title: item.service.name,
        startTime: item.startTime,
      })),
    });
  }, [bookings.data, query.data]);
}
