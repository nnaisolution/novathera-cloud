import { BookingWizard } from "../../../src/features/bookings/components/BookingWizard";
import { BookingWizardProvider } from "../../../src/features/bookings/context/BookingWizardProvider";

export default function BookScreen() {
  return (
    <BookingWizardProvider>
      <BookingWizard />
    </BookingWizardProvider>
  );
}
