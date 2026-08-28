import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { OptionSelector, type SelectorOption } from "../../../src/components/OptionSelector";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";
import { StateMessage } from "../../../src/components/StateMessage";
import { BookingCard } from "../../../src/features/bookings/components/BookingCard";
import {
  useMyBookings,
  useRefreshBookings,
  type BookingScope,
} from "../../../src/features/bookings/hooks/useBookings";
import { PlatformSessionNotice } from "../../../src/features/platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../../src/features/platform/hooks/usePlatformSession";
import { colors, spacing, typography } from "../../../src/theme";

const SCOPE_OPTIONS: readonly SelectorOption<BookingScope>[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

export default function AppointmentsScreen() {
  const router = useRouter();
  const platform = usePlatformSession();
  const refreshBookings = useRefreshBookings();

  const [scope, setScope] = useState<BookingScope>("upcoming");
  const [page, setPage] = useState(1);

  const bookings = useMyBookings(scope, page);
  const now = new Date();

  const items = bookings.data?.items ?? [];
  const totalPages = bookings.data?.totalPages ?? 1;
  const total = bookings.data?.total ?? 0;

  const isEmpty = !bookings.isPending && !bookings.isError && items.length === 0;
  // A cancellation can shrink the list under the page the patient is sitting on.
  const strandedOnEmptyPage = isEmpty && page > 1;

  const changeScope = (next: BookingScope) => {
    setScope(next);
    setPage(1);
  };

  return (
    <Screen
      kicker="Clinic visits"
      title="Appointments"
      subtitle="Times are shown in each clinic's own time zone."
      refreshControl={
        platform === "ready" ? (
          <RefreshControl
            refreshing={bookings.isFetching && !bookings.isPending}
            onRefresh={refreshBookings}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {/*
        The query is skipped without a platform session, and a skipped query
        stays `isPending` forever — so the session has to be settled before any
        loading or empty state below can be believed.
      */}
      {platform === "unavailable" ? (
        <PlatformSessionNotice subject="Your appointments" />
      ) : platform === "pending" ? (
        <StateMessage tone="loading" title="Checking your session" body="One moment." />
      ) : (
        <>
          <OptionSelector
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={changeScope}
            accessibilityLabel="Show upcoming or past appointments"
          />

          {bookings.isError ? (
            <StateMessage
              tone="error"
              title="We couldn't load your appointments"
              body="Nothing has changed with your bookings. Try again in a moment."
              actionLabel="Retry"
              onAction={() => void bookings.refetch()}
            />
          ) : bookings.isPending ? (
            <StateMessage
              tone="loading"
              title={scope === "upcoming" ? "Loading your next visits" : "Loading your visit history"}
              body="Fetching bookings from the clinic system."
            />
          ) : strandedOnEmptyPage ? (
            <StateMessage
              tone="empty"
              title="Nothing left on this page"
              body="These visits have moved since you opened this page."
              actionLabel="Back to the first page"
              onAction={() => setPage(1)}
            />
          ) : isEmpty ? (
            <StateMessage
              tone="empty"
              title={scope === "upcoming" ? "No visits booked" : "No past visits"}
              body={
                scope === "upcoming"
                  ? "When you book a visit it will appear here with the clinic, practitioner, and time."
                  : "Completed and cancelled visits will be listed here once you've had your first appointment."
              }
              actionLabel={scope === "upcoming" ? "Book a visit" : undefined}
              onAction={scope === "upcoming" ? () => router.push("/(app)/care/book") : undefined}
            />
          ) : (
            <>
              {items.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  now={now}
                  onPaymentReturn={refreshBookings}
                />
              ))}

              {totalPages > 1 ? (
                <View style={styles.pager}>
                  <Text style={styles.pagerLabel}>
                    Page {page} of {totalPages} · {total} visit{total === 1 ? "" : "s"}
                  </Text>
                  <View style={styles.pagerButtons}>
                    <View style={styles.pagerButton}>
                      <SecondaryButton
                        label="Previous"
                        accessibilityLabel="Previous page of appointments"
                        disabled={page === 1 || bookings.isFetching}
                        onPress={() => setPage((current) => Math.max(1, current - 1))}
                      />
                    </View>
                    <View style={styles.pagerButton}>
                      <SecondaryButton
                        label="Next"
                        accessibilityLabel="Next page of appointments"
                        disabled={page >= totalPages || bookings.isFetching}
                        onPress={() => setPage((current) => current + 1)}
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              {scope === "upcoming" ? (
                <PrimaryButton label="Book another visit" onPress={() => router.push("/(app)/care/book")} />
              ) : null}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pager: { gap: spacing.xs },
  pagerLabel: { ...typography.caption, color: colors.textMuted, textAlign: "center" },
  pagerButtons: { flexDirection: "row", gap: spacing.sm },
  pagerButton: { flex: 1 },
});
