import { useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { Chip } from "../../../src/components/Chip";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { formatMoneyCents } from "../../../src/features/billing/money";
import { openPaymentUrl } from "../../../src/features/billing/paymentBrowser";
import { PlanCard } from "../../../src/features/membership/components/PlanCard";
import {
  useManageMembership,
  useMembership,
  useRefreshMembership,
  useUpgradeMembership,
} from "../../../src/features/membership/hooks/useMembership";
import {
  MEMBERSHIP_BENEFITS,
  formatPeriodEnd,
  membershipStatusChip,
  type ActiveMembership,
  type MembershipPlanId,
} from "../../../src/features/membership/membership";
import { PlatformSessionNotice } from "../../../src/features/platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../../src/features/platform/hooks/usePlatformSession";
import { colors, radii, spacing, typography } from "../../../src/theme";

export default function MembershipScreen() {
  const platform = usePlatformSession();
  const membership = useMembership();
  const refreshMembership = useRefreshMembership();
  const upgrade = useUpgradeMembership();
  const manage = useManageMembership();

  const [notice, setNotice] = useState<string | null>(null);

  const busy = upgrade.isPending || manage.isPending;

  async function handleStripeUrl(url: string | null, fallbackMessage: string) {
    const result = await openPaymentUrl(url);

    if (result === "missingUrl") {
      setNotice(fallbackMessage);
      return;
    }
    if (result === "failed") {
      setNotice("We couldn't open a browser on this device.");
      return;
    }
    // Stripe confirms by webhook, so this refetch is a best guess at "the
    // change has landed". Pull to refresh if the plan still looks stale.
    refreshMembership();
  }

  async function handleSubscribe(planId: MembershipPlanId) {
    setNotice(null);
    try {
      const session = await upgrade.mutateAsync({ planId });
      await handleStripeUrl(
        session.url,
        "Checkout isn't available right now. Please contact the clinic to set up your plan.",
      );
    } catch {
      setNotice("We couldn't start checkout. Please try again in a moment.");
    }
  }

  async function handleManage() {
    setNotice(null);
    try {
      const session = await manage.mutateAsync();
      await handleStripeUrl(
        session.url,
        "The billing portal isn't available right now. Please contact the clinic.",
      );
    } catch {
      setNotice("We couldn't open the billing portal. Please try again in a moment.");
    }
  }

  return (
    <Screen
      kicker="Membership"
      title="Your plan"
      subtitle="Member pricing, priority booking, and rewards at Nova Thera."
      refreshControl={
        platform === "ready" ? (
          <RefreshControl
            refreshing={membership.isFetching && !membership.isPending}
            onRefresh={refreshMembership}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {platform === "unavailable" ? (
        <PlatformSessionNotice subject="Your membership" />
      ) : platform === "pending" ? (
        <StateMessage tone="loading" title="Checking your session" body="One moment." />
      ) : membership.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load your membership"
          body="Your plan and billing are unchanged. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void membership.refetch()}
        />
      ) : membership.isPending ? (
        <StateMessage tone="loading" title="Loading your membership" body="Checking your plan and benefits." />
      ) : membership.data.hasActiveSubscription ? (
        <>
          <ActiveMembershipCard
            membership={membership.data}
            busy={busy}
            pending={manage.isPending}
            onManage={() => void handleManage()}
          />
          {notice ? (
            <StateMessage tone="error" title="Billing couldn't continue" body={notice} />
          ) : null}
          <BenefitsCard />
        </>
      ) : (
        <>
          <Card>
            <Text style={styles.leadTitle}>You don&apos;t have a membership yet</Text>
            <Text style={styles.leadBody}>
              Membership adds priority booking, automatic member pricing, and reward points on every
              visit. You can cancel from the billing portal at any time.
            </Text>
          </Card>

          {notice ? (
            <StateMessage tone="error" title="Billing couldn't continue" body={notice} />
          ) : null}

          {membership.data.plans.length === 0 ? (
            <StateMessage
              tone="empty"
              title="No plans on offer"
              body="Nova Thera isn't taking new memberships through the app right now. The clinic can tell you what's available."
            />
          ) : (
            membership.data.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                busy={busy}
                pending={upgrade.isPending}
                onSubscribe={() => void handleSubscribe(plan.id)}
              />
            ))
          )}

          <BenefitsCard />
        </>
      )}
    </Screen>
  );
}

type ActiveProps = {
  membership: ActiveMembership;
  busy: boolean;
  pending: boolean;
  onManage: () => void;
};

function ActiveMembershipCard({ membership, busy, pending, onManage }: ActiveProps) {
  const status = membershipStatusChip(membership.status);
  const periodEnd = formatPeriodEnd(membership.periodEnd);

  const renewalLine = periodEnd
    ? membership.cancelAtPeriodEnd
      ? `Your benefits end on ${periodEnd}.`
      : `Renews on ${periodEnd}.`
    : "Your renewal date isn't available yet.";

  const stats = [
    { key: "visits", label: "Visits this year", value: String(membership.stats.visitsThisYear) },
    { key: "savings", label: "Saved", value: formatMoneyCents(membership.stats.savingsCents) },
    { key: "points", label: "Reward points", value: membership.stats.rewardPoints.toLocaleString() },
  ];

  return (
    <Card accented>
      <View style={styles.planHeader}>
        <Text style={styles.tier}>{membership.plan.name}</Text>
        <Chip label={status.label} tone={status.tone} />
      </View>

      <Text style={styles.planDescription}>{membership.plan.description}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoneyCents(membership.plan.priceCents)}</Text>
        <Text style={styles.period}>/ month</Text>
      </View>

      <Text style={membership.cancelAtPeriodEnd ? styles.renewalWarning : styles.renewal}>
        {renewalLine}
      </Text>

      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.statCell}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label={pending ? "Opening billing…" : "Manage plan and billing"}
        disabled={busy}
        onPress={onManage}
      />
      <Text style={styles.hint}>
        Opens Stripe in a browser to change your plan, update your card, or cancel. Nova Thera never
        stores your card details.
      </Text>
    </Card>
  );
}

function BenefitsCard() {
  return (
    <Card title="What membership includes">
      <View style={styles.benefitList}>
        {MEMBERSHIP_BENEFITS.map((benefit) => (
          <View key={benefit.title} style={styles.benefitRow}>
            <View style={styles.benefitMark} />
            <View style={styles.benefitCopy}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitBody}>{benefit.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  leadTitle: { ...typography.heading, color: colors.text },
  leadBody: { ...typography.body, color: colors.textMuted },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  tier: { ...typography.title, color: colors.text, flexShrink: 1 },
  planDescription: { ...typography.body, color: colors.textMuted },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  // Gold has to be readable here, so it is the darkened ink, not the accent.
  price: { ...typography.metric, color: colors.warning },
  period: { ...typography.caption, color: colors.textMuted },
  renewal: { ...typography.label, color: colors.text },
  renewalWarning: { ...typography.label, color: colors.warning },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCell: {
    flexGrow: 1,
    flexBasis: "28%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2,
  },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: { ...typography.heading, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
  benefitList: { gap: spacing.sm },
  benefitRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  benefitMark: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  benefitCopy: { flex: 1, gap: 2 },
  benefitTitle: { ...typography.label, color: colors.text },
  benefitBody: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
});
