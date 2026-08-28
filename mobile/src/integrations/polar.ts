export type PolarMembershipView = {
  status: "INACTIVE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  planName?: string;
  renewsAt?: string;
};

export async function fetchMembershipStub(): Promise<PolarMembershipView> {
  return { status: "INACTIVE" };
}
