import { useRouter } from "expo-router";

import { NavCard } from "../../../src/components/NavCard";
import { Screen } from "../../../src/components/Screen";

export default function CareHomeScreen() {
  const router = useRouter();

  return (
    <Screen
      withTopInset
      kicker="Care plan"
      title="Care"
      subtitle="Treatment programs, aftercare, and clinic visits — shown only to the authenticated patient."
    >
      <NavCard
        mark="▣"
        title="Treatment programs"
        caption="Active enrollments from your care team"
        onPress={() => router.push("/(app)/care/programs")}
      />
      <NavCard
        mark="✓"
        title="Aftercare"
        caption="Post-procedure checklists and follow-up"
        onPress={() => router.push("/(app)/care/aftercare")}
      />
      <NavCard
        mark="◷"
        title="Appointments"
        caption="Upcoming and past clinic visits"
        onPress={() => router.push("/(app)/care/appointments")}
      />
      <NavCard
        mark="+"
        title="Book a visit"
        caption="Choose a clinic, service, and time"
        onPress={() => router.push("/(app)/care/book")}
      />
    </Screen>
  );
}
