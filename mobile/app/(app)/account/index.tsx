import { useRouter } from "expo-router";

import { useAuth } from "../../../src/auth/AuthProvider";
import { NavCard } from "../../../src/components/NavCard";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";

export default function AccountHomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <Screen
      withTopInset
      kicker="Account"
      title="You"
      subtitle="Profile, consent, membership, and how Nova Thera handles your data."
    >
      <NavCard
        mark="P"
        title="Patient profile"
        caption="Name, locale, and timezone"
        onPress={() => router.push("/(app)/account/profile")}
      />
      <NavCard
        mark="C"
        title="Health data consent"
        caption="Grant or revoke treatment and sharing"
        onPress={() => router.push("/(app)/account/consent")}
      />
      <NavCard
        mark="M"
        title="Membership"
        caption="Plan, renewal, and clinic benefits"
        accented
        onPress={() => router.push("/(app)/account/membership")}
      />
      <NavCard
        mark="N"
        title="Notifications"
        caption="Reminders on this device"
        onPress={() => router.push("/(app)/account/notifications")}
      />
      <NavCard
        mark="i"
        title="Privacy"
        caption="Encryption, hashing, and audit scope"
        onPress={() => router.push("/(app)/account/privacy")}
      />
      <SecondaryButton tone="danger" label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}
