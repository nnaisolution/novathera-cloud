export const bookingRoutes = {
  details: "/book",
  clinic: "/book/clinic",
  concern: "/book/concern",
  staff: "/book/staff",
  slot: "/book/slot",
  overview: "/book/overview",
  confirmation: "/book/confirmation",
} as const;

export function getNextRouteAfterConcern(clientCanChooseStaff: boolean) {
  return clientCanChooseStaff ? bookingRoutes.staff : bookingRoutes.slot;
}

export function getBackRouteFromSlot(hasStaffOptions: boolean) {
  return hasStaffOptions ? bookingRoutes.staff : bookingRoutes.concern;
}
