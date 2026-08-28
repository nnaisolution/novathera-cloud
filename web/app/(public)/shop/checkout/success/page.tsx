import { Suspense } from "react";

import { CheckoutSuccessView } from "@/components/features/orders";

export default function ShopCheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf7ee]">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[#edffe3]" />
        </div>
      }
    >
      <CheckoutSuccessView />
    </Suspense>
  );
}
