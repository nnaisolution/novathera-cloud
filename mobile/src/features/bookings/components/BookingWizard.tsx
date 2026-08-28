import { useNavigation, useRouter, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../components/Card";
import { Chip } from "../../../components/Chip";
import { NavCard } from "../../../components/NavCard";
import { OptionSelector } from "../../../components/OptionSelector";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Screen } from "../../../components/Screen";
import { SecondaryButton } from "../../../components/SecondaryButton";
import { StateMessage } from "../../../components/StateMessage";
import { formatMoneyCents } from "../../billing/money";
import { PlatformSessionNotice } from "../../platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../platform/hooks/usePlatformSession";
import { colors, radii, spacing, typography } from "../../../theme";
import {
  calendarDateFromKey,
  formatBookingWhen,
  formatDuration,
  formatLocationAddress,
  formatSlotTime,
  localDateTimeToUtc,
  type PublicCategory,
  type PublicLocation,
  type PublicService,
  type PublicSlot,
  type PublicStaffMember,
} from "../bookings";
import {
  locationFromPublic,
  serviceFromPublic,
  staffFromPublic,
  useBookingWizard,
  type WizardStep,
} from "../context/BookingWizardProvider";
import {
  isUnauthorizedError,
  useCreateMyBooking,
  usePublicAvailableSlots,
  usePublicLocations,
  usePublicServiceCategories,
  usePublicServices,
  usePublicStaff,
} from "../hooks/useBookingWizard";
import { getBookingDateOptions } from "../slotDates";

const STEP_COPY: Record<WizardStep, { kicker: string; title: string; subtitle: string }> = {
  location: {
    kicker: "Book a visit",
    title: "Choose a clinic",
    subtitle: "Times are shown in that clinic's own time zone.",
  },
  category: {
    kicker: "Book a visit",
    title: "Service type",
    subtitle: "Pick the kind of visit you want.",
  },
  service: {
    kicker: "Book a visit",
    title: "Choose a service",
    subtitle: "Duration and price are set by the clinic.",
  },
  staff: {
    kicker: "Book a visit",
    title: "Specialist",
    subtitle: "Optional — choose someone, or any available specialist.",
  },
  slot: {
    kicker: "Book a visit",
    title: "Pick a time",
    subtitle: "Days and times are in the clinic's time zone.",
  },
  confirm: {
    kicker: "Book a visit",
    title: "Confirm visit",
    subtitle: "Payment is due at the venue. The visit is held once you confirm.",
  },
  success: {
    kicker: "Book a visit",
    title: "Visit booked",
    subtitle: "Pay at the venue when you arrive, or later from Appointments.",
  },
};

function queryErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim() !== "") return error.message;
  return fallback;
}

export function BookingWizard() {
  const navigation = useNavigation();
  const router = useRouter();
  const platform = usePlatformSession();
  const wizard = useBookingWizard();
  const create = useCreateMyBooking();
  const [createNotice, setCreateNotice] = useState<string | null>(null);

  const locations = usePublicLocations();
  const categories = usePublicServiceCategories();
  const services = usePublicServices(wizard.location?.id ?? null, wizard.category?.id ?? null);
  const staff = usePublicStaff(
    wizard.service?.id ?? null,
    wizard.location?.id ?? null,
    Boolean(wizard.service?.clientCanChooseStaff),
  );
  const slots = usePublicAvailableSlots({
    locationId: wizard.location?.id ?? null,
    serviceId: wizard.service?.id ?? null,
    dateKey: wizard.slotDate,
    employeeId: wizard.staff?.id ?? null,
  });

  const dateOptions = useMemo(
    () => (wizard.location ? getBookingDateOptions(wizard.location.timezone) : []),
    [wizard.location],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (wizard.canLeaveRoute) return;
      event.preventDefault();
      wizard.goBack();
    });
    return unsubscribe;
  }, [navigation, wizard]);

  useEffect(() => {
    if (wizard.step !== "staff") return;
    if (staff.isPending || staff.isError) return;
    if ((staff.data?.length ?? 0) === 0) wizard.skipStaffStep();
  }, [wizard, staff.isPending, staff.isError, staff.data]);

  useEffect(() => {
    if (wizard.step !== "slot") return;
    if (wizard.slotDate) return;
    const first = dateOptions[0];
    if (first) wizard.setSlotDate(first.value);
  }, [wizard, dateOptions]);

  const catalogUnauthorized =
    isUnauthorizedError(locations.error) ||
    isUnauthorizedError(categories.error) ||
    isUnauthorizedError(services.error) ||
    isUnauthorizedError(staff.error) ||
    isUnauthorizedError(slots.error);

  const copy = STEP_COPY[wizard.step];
  const showBack = !wizard.canLeaveRoute;

  async function handleCreate() {
    if (!wizard.location || !wizard.service || !wizard.slotDate || !wizard.slot) return;
    setCreateNotice(null);
    try {
      const booking = await create.mutateAsync({
        locationId: wizard.location.id,
        serviceId: wizard.service.id,
        employeeId: wizard.slot.employeeId,
        startTime: localDateTimeToUtc(
          calendarDateFromKey(wizard.slotDate),
          wizard.slot.time,
          wizard.location.timezone,
        ),
      });
      wizard.markCreated(booking);
    } catch (error) {
      setCreateNotice(
        queryErrorMessage(
          error,
          "We couldn't book this visit. The slot may have been taken — try another time.",
        ),
      );
    }
  }

  if (catalogUnauthorized) {
    return (
      <Screen kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
        <PlatformSessionNotice subject="Booking a visit" />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: copy.title }} />
      <Screen kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
        {showBack ? <SecondaryButton label="Back" onPress={wizard.goBack} /> : null}

        {wizard.step === "location" ? (
          <LocationStep query={locations} onSelect={wizard.selectLocation} />
        ) : null}

        {wizard.step === "category" ? (
          <CategoryStep query={categories} onSelect={wizard.selectCategory} />
        ) : null}

        {wizard.step === "service" ? (
          <ServiceStep query={services} onSelect={wizard.selectService} />
        ) : null}

        {wizard.step === "staff" ? (
          <StaffStep
            query={staff}
            selectedId={wizard.staff?.id ?? null}
            onAny={wizard.selectAnyStaff}
            onSelect={wizard.selectStaff}
          />
        ) : null}

        {wizard.step === "slot" ? (
          <SlotStep
            dateOptions={dateOptions}
            selectedDate={wizard.slotDate}
            timezone={wizard.location?.timezone ?? ""}
            query={slots}
            selectedTime={wizard.slot?.time ?? null}
            onSelectDate={wizard.setSlotDate}
            onSelectSlot={wizard.selectSlot}
          />
        ) : null}

        {wizard.step === "confirm" ? (
          <ConfirmStep
            platform={platform}
            creating={create.isPending}
            notice={createNotice}
            onCreate={() => void handleCreate()}
          />
        ) : null}

        {wizard.step === "success" ? (
          <SuccessStep
            onAppointments={() => router.replace("/(app)/care/appointments")}
            onDetail={(id) => router.replace(`/(app)/care/appointments/${id}`)}
          />
        ) : null}
      </Screen>
    </>
  );
}

type QueryLike<T> = {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
};

function LocationStep({
  query,
  onSelect,
}: {
  query: QueryLike<PublicLocation[]>;
  onSelect: (location: ReturnType<typeof locationFromPublic>) => void;
}) {
  if (query.isPending) {
    return <StateMessage tone="loading" title="Loading clinics" body="Fetching locations from the clinic system." />;
  }
  if (query.isError) {
    return (
      <StateMessage
        tone="error"
        title="We couldn't load clinics"
        body={queryErrorMessage(query.error, "Try again in a moment.")}
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return (
      <StateMessage
        tone="empty"
        title="No clinics listed"
        body="There aren't any bookable locations right now. Please call the clinic."
      />
    );
  }
  return (
    <>
      {items.map((location) => {
        const address = formatLocationAddress(location);
        return (
          <NavCard
            key={location.id}
            mark="⌂"
            title={location.name}
            caption={address}
            onPress={() => onSelect(locationFromPublic(location, address))}
          />
        );
      })}
    </>
  );
}

function CategoryStep({
  query,
  onSelect,
}: {
  query: QueryLike<PublicCategory[]>;
  onSelect: (category: { id: string; name: string }) => void;
}) {
  if (query.isPending) {
    return <StateMessage tone="loading" title="Loading service types" body="Fetching categories from the clinic system." />;
  }
  if (query.isError) {
    return (
      <StateMessage
        tone="error"
        title="We couldn't load service types"
        body={queryErrorMessage(query.error, "Try again in a moment.")}
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return (
      <StateMessage
        tone="empty"
        title="No service types"
        body="Nothing is listed for this clinic yet. Try another location or call the clinic."
      />
    );
  }
  return (
    <>
      {items.map((category) => (
        <NavCard
          key={category.id}
          mark="☰"
          title={category.name}
          onPress={() => onSelect({ id: category.id, name: category.name })}
        />
      ))}
    </>
  );
}

function ServiceStep({
  query,
  onSelect,
}: {
  query: QueryLike<PublicService[]>;
  onSelect: (service: ReturnType<typeof serviceFromPublic>) => void;
}) {
  if (query.isPending) {
    return <StateMessage tone="loading" title="Loading services" body="Fetching what's offered at this clinic." />;
  }
  if (query.isError) {
    return (
      <StateMessage
        tone="error"
        title="We couldn't load services"
        body={queryErrorMessage(query.error, "Try again in a moment.")}
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return (
      <StateMessage
        tone="empty"
        title="No services in this type"
        body="Try another service type, or pick a different clinic."
      />
    );
  }
  return (
    <>
      {items.map((service) => {
        const duration = formatDuration(service.durationMinutes);
        const price = formatMoneyCents(service.standardPriceCents, service.currency);
        const caption = [duration, price].filter(Boolean).join(" · ");
        return (
          <NavCard
            key={service.id}
            mark="+"
            title={service.name}
            caption={caption}
            onPress={() => onSelect(serviceFromPublic(service))}
          />
        );
      })}
    </>
  );
}

function StaffStep({
  query,
  selectedId,
  onAny,
  onSelect,
}: {
  query: QueryLike<PublicStaffMember[]>;
  selectedId: string | null;
  onAny: () => void;
  onSelect: (staff: ReturnType<typeof staffFromPublic>) => void;
}) {
  if (query.isPending) {
    return <StateMessage tone="loading" title="Loading specialists" body="Checking who can take this visit." />;
  }
  if (query.isError) {
    return (
      <StateMessage
        tone="error"
        title="We couldn't load specialists"
        body={queryErrorMessage(query.error, "Try again in a moment.")}
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    );
  }
  const items = query.data ?? [];
  if (items.length === 0) {
    return <StateMessage tone="loading" title="Finding a time" body="No specialist list for this service — showing every open slot." />;
  }
  return (
    <>
      <NavCard
        mark="*"
        title="Any specialist"
        caption={selectedId === null ? "We'll assign the next available team member" : "Let the clinic assign someone"}
        onPress={onAny}
      />
      {items.map((member) => (
        <NavCard
          key={member.id}
          mark="☺"
          title={staffFromPublic(member).name}
          caption={member.jobTitle}
          onPress={() => onSelect(staffFromPublic(member))}
        />
      ))}
    </>
  );
}

function SlotStep({
  dateOptions,
  selectedDate,
  timezone,
  query,
  selectedTime,
  onSelectDate,
  onSelectSlot,
}: {
  dateOptions: ReturnType<typeof getBookingDateOptions>;
  selectedDate: string | null;
  timezone: string;
  query: QueryLike<PublicSlot[]>;
  selectedTime: string | null;
  onSelectDate: (dateKey: string) => void;
  onSelectSlot: (slot: PublicSlot) => void;
}) {
  const slotsReady = selectedDate !== null;
  const dateSelectorValue = selectedDate ?? dateOptions[0]?.value;

  return (
    <>
      <Text style={styles.sectionLabel}>Day</Text>
      {dateSelectorValue && dateOptions.length > 0 ? (
        <OptionSelector
          layout="scroll"
          options={dateOptions.map((option) => ({
            value: option.value,
            label: `${option.dayLabel} ${option.dayNumber}`,
          }))}
          value={dateSelectorValue}
          onChange={onSelectDate}
          accessibilityLabel="Choose a day"
        />
      ) : null}
      {timezone ? <Text style={styles.meta}>Clinic time zone: {timezone}</Text> : null}

      <Text style={styles.sectionLabel}>Time</Text>
      {!slotsReady || query.isPending ? (
        <StateMessage tone="loading" title="Loading times" body="Checking open slots for this day." />
      ) : query.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load times"
          body={queryErrorMessage(query.error, "Try another day, or retry in a moment.")}
          actionLabel="Retry"
          onAction={() => void query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <StateMessage
          tone="empty"
          title="No times this day"
          body="Try another day, or go back and pick a different specialist."
        />
      ) : (
        <View style={styles.slotGrid}>
          {(query.data ?? []).map((slot) => {
            const selected = slot.time === selectedTime;
            return (
              <Pressable
                key={`${slot.time}-${slot.employeeId}`}
                accessibilityRole="button"
                accessibilityLabel={`${formatSlotTime(slot.time)}${selected ? ", selected" : ""}`}
                accessibilityState={{ selected }}
                onPress={() => onSelectSlot(slot)}
                style={[styles.slot, selected && styles.slotSelected]}
              >
                <Text style={[styles.slotLabel, selected && styles.slotLabelSelected]}>{formatSlotTime(slot.time)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}

function ConfirmStep({
  platform,
  creating,
  notice,
  onCreate,
}: {
  platform: ReturnType<typeof usePlatformSession>;
  creating: boolean;
  notice: string | null;
  onCreate: () => void;
}) {
  const wizard = useBookingWizard();
  if (!wizard.location || !wizard.service || !wizard.slotDate || !wizard.slot) {
    return (
      <StateMessage
        tone="empty"
        title="Missing details"
        body="Go back and choose a clinic, service, and time before confirming."
      />
    );
  }

  const startTime = localDateTimeToUtc(
    calendarDateFromKey(wizard.slotDate),
    wizard.slot.time,
    wizard.location.timezone,
  );
  const when = formatBookingWhen(startTime, wizard.location.timezone);
  const timeLine = [when.timeLabel, when.zoneLabel].filter(Boolean).join(" ");
  const staffLabel = wizard.staff?.name ?? "Any specialist";
  const duration = formatDuration(wizard.service.durationMinutes);

  return (
    <>
      <Card>
        <RecapRow label="Clinic" value={wizard.location.name} detail={wizard.location.address} />
        <RecapRow
          label="Service"
          value={wizard.service.name}
          detail={duration ? `${duration} · ${formatMoneyCents(wizard.service.priceCents, wizard.service.currency)}` : formatMoneyCents(wizard.service.priceCents, wizard.service.currency)}
        />
        <RecapRow label="Specialist" value={staffLabel} />
        <RecapRow label="When" value={timeLine} detail={when.dateLabel} />
        <Text style={styles.price}>{formatMoneyCents(wizard.service.priceCents, wizard.service.currency)}</Text>
        {when.usedDeviceZone ? (
          <Text style={styles.caveat}>
            Shown in your device&apos;s time zone — this clinic runs on {wizard.location.timezone}.
          </Text>
        ) : null}
      </Card>

      {notice ? (
        <StateMessage
          tone="error"
          title="We couldn't book this visit"
          body={notice}
        />
      ) : null}

      {platform === "unavailable" ? (
        <PlatformSessionNotice subject="Confirming this visit" />
      ) : platform === "pending" ? (
        <StateMessage tone="loading" title="Checking your session" body="A clinic session is required to hold the slot." />
      ) : (
        <PrimaryButton
          label={creating ? "Booking…" : "Confirm visit"}
          disabled={creating}
          onPress={onCreate}
        />
      )}
    </>
  );
}

function SuccessStep({
  onAppointments,
  onDetail,
}: {
  onAppointments: () => void;
  onDetail: (id: string) => void;
}) {
  const wizard = useBookingWizard();
  const booking = wizard.created;
  if (!booking) {
    return (
      <StateMessage
        tone="empty"
        title="Nothing to show"
        body="This booking is no longer on this screen. Open Appointments to see your visits."
        actionLabel="Go to appointments"
        onAction={onAppointments}
      />
    );
  }

  const when = formatBookingWhen(booking.startTime, booking.location.timezone);
  const timeLine = [when.timeLabel, when.zoneLabel].filter(Boolean).join(" ");

  return (
    <>
      <Card>
        <View style={styles.chips}>
          <Chip label="Confirmed" tone="positive" />
          <Chip label="Payment due" tone="attention" />
        </View>
        <Text style={styles.successService}>{booking.service.name}</Text>
        <Text style={styles.time}>{timeLine}</Text>
        <Text style={styles.meta}>{when.dateLabel}</Text>
        <Text style={styles.meta}>{booking.location.name}</Text>
        <Text style={styles.meta}>
          {booking.employee.firstName} {booking.employee.lastName}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoneyCents(booking.priceCents, booking.currency)}</Text>
          <Text style={styles.meta}>{booking.bookingCode}</Text>
        </View>
        <Text style={styles.body}>
          Payment is pending — pay at the venue when you arrive. You can also pay from Appointments later.
        </Text>
      </Card>
      <PrimaryButton label="View this visit" onPress={() => onDetail(booking.id)} />
      <PrimaryButton label="All appointments" onPress={onAppointments} />
    </>
  );
}

function RecapRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <View style={styles.recap}>
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={styles.recapValue}>{value}</Text>
      {detail ? <Text style={styles.meta}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  slot: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  slotSelected: { backgroundColor: colors.primary },
  slotLabel: { ...typography.label, color: colors.text },
  slotLabelSelected: { color: colors.onPrimary },
  recap: { gap: 2 },
  recapLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  recapValue: { ...typography.heading, color: colors.text },
  price: { ...typography.heading, color: colors.text },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  successService: { ...typography.heading, color: colors.text },
  time: { ...typography.body, color: colors.text, fontWeight: "600" },
  meta: { ...typography.caption, color: colors.textMuted },
  body: { ...typography.body, color: colors.textMuted },
  caveat: { ...typography.caption, color: colors.warning, lineHeight: 17 },
});
