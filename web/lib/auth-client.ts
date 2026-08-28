import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    stripeClient(),
    inferAdditionalFields({
      user: {
        phoneNumber: { type: "string", required: false },
        marketingOptIn: { type: "boolean", required: false },
        firstName: { type: "string", required: false },
        lastName: { type: "string", required: false },
        dateOfBirth: { type: "date", required: false },
        addressLine1: { type: "string", required: false },
        addressLine2: { type: "string", required: false },
        city: { type: "string", required: false },
        province: { type: "string", required: false },
        postalCode: { type: "string", required: false },
        country: { type: "string", required: false },
      },
    }),
  ],
});
