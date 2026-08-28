import { Suspense } from "react";

import { BookingConfirmationView } from "@/components/features/booking";

export default function BookConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <BookingConfirmationView />
    </Suspense>
  );
}
