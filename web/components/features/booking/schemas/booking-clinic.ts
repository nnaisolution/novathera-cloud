import { z } from "zod";

export const listBookingLocationsInput = z.object({
  city: z.string().trim().min(1).optional(),
  search: z.string().trim().max(200).optional(),
});

export const selectBookingClinicInput = z.object({
  city: z.string().trim().min(1, "City is required"),
  locationId: z.string().min(1, "Please select a clinic"),
});

export type ListBookingLocationsInput = z.infer<typeof listBookingLocationsInput>;
export type SelectBookingClinicInput = z.infer<typeof selectBookingClinicInput>;
