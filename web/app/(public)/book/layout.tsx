import { BookingProvider } from "@/components/features/booking/context/booking-provider";
import { BookingShell } from "@/components/features/booking";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <BookingShell>{children}</BookingShell>
    </BookingProvider>
  );
}
