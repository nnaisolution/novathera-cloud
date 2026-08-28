import { skipToken, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RefreshControl } from "react-native";

import { Screen } from "../../../../src/components/Screen";
import { StateMessage } from "../../../../src/components/StateMessage";
import { BookingCard } from "../../../../src/features/bookings/components/BookingCard";
import { useRefreshBookings } from "../../../../src/features/bookings/hooks/useBookings";
import { PlatformSessionNotice } from "../../../../src/features/platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../../../src/features/platform/hooks/usePlatformSession";
import { useNestTrpc } from "../../../../src/api/trpc";
import { colors } from "../../../../src/theme";

function bookingIdParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) return value[0];
  return undefined;
}

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = bookingIdParam(params.id);
  const platform = usePlatformSession();
  const trpc = useNestTrpc();
  const refreshList = useRefreshBookings();

  const booking = useQuery(
    trpc.bookings.myGetById.queryOptions(
      platform === "ready" && id ? { id } : skipToken,
      { staleTime: 30_000 },
    ),
  );

  return (
    <Screen
      kicker="Clinic visit"
      title="Appointment"
      subtitle="Times are shown in this clinic's own time zone."
      refreshControl={
        platform === "ready" ? (
          <RefreshControl
            refreshing={booking.isFetching && !booking.isPending}
            onRefresh={() => void booking.refetch()}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {platform === "unavailable" ? (
        <PlatformSessionNotice subject="This appointment" />
      ) : platform === "pending" ? (
        <StateMessage tone="loading" title="Checking your session" body="One moment." />
      ) : !id ? (
        <StateMessage
          tone="empty"
          title="Missing appointment"
          body="This link does not include a visit id."
          actionLabel="All appointments"
          onAction={() => router.replace("/(app)/care/appointments")}
        />
      ) : booking.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load this visit"
          body="It may have been cancelled, or the link is no longer valid."
          actionLabel="All appointments"
          onAction={() => router.replace("/(app)/care/appointments")}
        />
      ) : booking.isPending ? (
        <StateMessage tone="loading" title="Loading this visit" body="Fetching the booking from the clinic system." />
      ) : booking.data ? (
        <BookingCard
          booking={booking.data}
          now={new Date()}
          onPaymentReturn={() => {
            void booking.refetch();
            refreshList();
          }}
        />
      ) : (
        <StateMessage
          tone="empty"
          title="Visit not found"
          body="Open Appointments to see your visits."
          actionLabel="All appointments"
          onAction={() => router.replace("/(app)/care/appointments")}
        />
      )}
    </Screen>
  );
}
