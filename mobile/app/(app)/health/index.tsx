import { useRouter } from "expo-router";

import { NavCard } from "../../../src/components/NavCard";
import { Screen } from "../../../src/components/Screen";

export default function HealthHomeScreen() {
  const router = useRouter();

  return (
    <Screen
      withTopInset
      kicker="Your record"
      title="Health"
      subtitle="Log readings manually or connect Apple Health and Health Connect. Values are normalized before they reach your care team."
    >
      <NavCard
        mark="+"
        title="Add a reading"
        caption="Weight, pulse, glucose, and more"
        onPress={() => router.push("/(app)/health/add-reading")}
      />
      <NavCard
        mark="◎"
        title="Data sources"
        caption="Apple HealthKit and Google Health Connect"
        onPress={() => router.push("/(app)/health/sources")}
      />
    </Screen>
  );
}
