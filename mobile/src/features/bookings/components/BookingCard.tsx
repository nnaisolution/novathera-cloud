import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "../../../components/Card";
import { Chip } from "../../../components/Chip";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { SecondaryButton } from "../../../components/SecondaryButton";
import { colors, radii, spacing, typography } from "../../../theme";
import { formatMoneyCents } from "../../billing/money";
import { openPaymentUrl } from "../../billing/paymentBrowser";
import {
  formatBookingWhen,
  formatDuration,
  isCancellable,
  isPaymentDue,
  paymentChip,
  practitionerName,
  statusChip,
  type Booking,
} from "../bookings";
import { useBookingCheckout, useCancelBooking } from "../hooks/useBookings";

type Props = {
  booking: Booking;
  /** Passed in so every card in a list agrees on "now". */
  now: Date;
  onPaymentReturn: () => void;
};

/** `myCancel` accepts an optional reason; this is the schema's own ceiling. */
const REASON_MAX_LENGTH = 500;

export function BookingCard({ booking, now, onPaymentReturn }: Props) {
  const cancel = useCancelBooking();
  const checkout = useBookingCheckout();

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const when = formatBookingWhen(booking.startTime, booking.location.timezone);
  const status = statusChip(booking);
  const payment = paymentChip(booking);
  const duration = formatDuration(booking.durationMinutes);
  const canCancel = isCancellable(booking, now);
  const canPay = isPaymentDue(booking);

  const timeLine = [when.timeLabel, when.zoneLabel].filter(Boolean).join(" ");
  const busy = cancel.isPending || checkout.isPending;

  async function handlePayNow() {
    setNotice(null);
    try {
      const session = await checkout.mutateAsync({ bookingId: booking.id });
      const result = await openPaymentUrl(session.url);

      if (result === "missingUrl") {
        setNotice("Checkout isn't available for this visit right now. Please call the clinic to pay.");
        return;
      }
      if (result === "failed") {
        setNotice("We couldn't open a browser on this device.");
        return;
      }
      onPaymentReturn();
    } catch {
      setNotice("We couldn't start checkout. Please try again in a moment.");
    }
  }

  async function handleConfirmCancel() {
    setNotice(null);
    const trimmed = reason.trim();

    try {
      await cancel.mutateAsync({ id: booking.id, reason: trimmed === "" ? undefined : trimmed });
      // The list invalidates on success, so this card is on its way out; the
      // state reset just keeps it correct if the refetch returns it unchanged.
      setConfirmingCancel(false);
      setReason("");
    } catch {
      setNotice("We couldn't cancel this visit. It's still booked — please try again or call the clinic.");
    }
  }

  return (
    <Card>
      <View style={styles.top}>
        <View style={styles.dateBadge}>
          {when.weekdayShort ? <Text style={styles.badgeWeekday}>{when.weekdayShort}</Text> : null}
          <Text style={styles.badgeDay}>{when.dayNumber}</Text>
          {when.monthShort ? <Text style={styles.badgeMonth}>{when.monthShort}</Text> : null}
        </View>

        <View style={styles.details}>
          <Text style={styles.service}>{booking.service.name}</Text>
          <Text style={styles.time}>{timeLine}</Text>
          <Text style={styles.meta}>
            {duration ? `${duration} · ` : ""}
            {practitionerName(booking)}
          </Text>
          <Text style={styles.meta}>{booking.location.name}</Text>
        </View>
      </View>

      <View style={styles.chips}>
        <Chip label={status.label} tone={status.tone} />
        {payment ? <Chip label={payment.label} tone={payment.tone} /> : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoneyCents(booking.priceCents, booking.currency)}</Text>
        <Text style={styles.code}>{booking.bookingCode}</Text>
      </View>

      {when.usedDeviceZone ? (
        <Text style={styles.caveat}>
          Shown in your device&apos;s time zone — this clinic runs on {booking.location.timezone}.
        </Text>
      ) : null}

      {booking.status === "CANCELLED" && booking.cancellationReason ? (
        <Text style={styles.caveat}>Reason given: {booking.cancellationReason}</Text>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {confirmingCancel ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmTitle}>Cancel this visit?</Text>
          <Text style={styles.confirmBody}>
            Your slot is released straight away and can&apos;t be reclaimed from here.
          </Text>
          <Text style={styles.fieldLabel}>Reason (optional)</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Helps the clinic follow up"
            placeholderTextColor={colors.textMuted}
            maxLength={REASON_MAX_LENGTH}
            multiline
            style={styles.input}
            accessibilityLabel="Reason for cancelling"
          />
          <SecondaryButton
            tone="danger"
            label={cancel.isPending ? "Cancelling…" : "Yes, cancel this visit"}
            disabled={cancel.isPending}
            onPress={() => void handleConfirmCancel()}
          />
          <SecondaryButton
            label="Keep my visit"
            disabled={cancel.isPending}
            onPress={() => {
              setConfirmingCancel(false);
              setReason("");
              setNotice(null);
            }}
          />
        </View>
      ) : (
        <>
          {canPay ? (
            <PrimaryButton
              label={checkout.isPending ? "Opening checkout…" : "Pay now"}
              disabled={busy}
              onPress={() => void handlePayNow()}
            />
          ) : null}
          {canCancel ? (
            <SecondaryButton
              tone="danger"
              label="Cancel visit"
              disabled={busy}
              onPress={() => setConfirmingCancel(true)}
            />
          ) : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  dateBadge: {
    width: 62,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    gap: 1,
  },
  badgeWeekday: { ...typography.caption, color: colors.textMuted, textTransform: "uppercase" },
  badgeDay: { ...typography.title, color: colors.primary },
  badgeMonth: { ...typography.caption, color: colors.secondary, letterSpacing: 0.8 },
  details: { flex: 1, gap: 2 },
  service: { ...typography.heading, color: colors.text },
  time: { ...typography.body, color: colors.text, fontWeight: "600" },
  meta: { ...typography.caption, color: colors.textMuted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  price: { ...typography.heading, color: colors.text },
  code: { ...typography.caption, color: colors.textMuted },
  caveat: { ...typography.caption, color: colors.warning, lineHeight: 17 },
  notice: { ...typography.caption, color: colors.danger, lineHeight: 17 },
  confirm: {
    backgroundColor: colors.dangerMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  confirmTitle: { ...typography.label, color: colors.text },
  confirmBody: { ...typography.caption, color: colors.text, lineHeight: 17 },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.sm,
    minHeight: 64,
    textAlignVertical: "top",
    ...typography.body,
    color: colors.text,
  },
});
