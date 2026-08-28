import { StyleSheet, Text, View } from "react-native";

import { Card } from "../../../components/Card";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { colors, typography } from "../../../theme";
import { formatMoneyCents } from "../../billing/money";
import type { MembershipPlan } from "../membership";

type Props = {
  plan: MembershipPlan;
  onSubscribe: () => void;
  busy: boolean;
  pending: boolean;
};

export function PlanCard({ plan, onSubscribe, busy, pending }: Props) {
  return (
    <Card accented>
      <View style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoneyCents(plan.priceCents)}</Text>
          <Text style={styles.period}>/ month</Text>
        </View>
      </View>
      <Text style={styles.description}>{plan.description}</Text>
      <PrimaryButton
        label={pending ? "Opening checkout…" : `Choose ${plan.name}`}
        disabled={busy}
        onPress={onSubscribe}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  name: { ...typography.heading, color: colors.text },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  // Gold ink rather than the raw accent: this has to be read, not just seen.
  price: { ...typography.title, color: colors.warning },
  period: { ...typography.caption, color: colors.textMuted },
  description: { ...typography.body, color: colors.textMuted },
});
