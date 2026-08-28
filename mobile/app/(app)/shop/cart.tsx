import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";
import { StateMessage } from "../../../src/components/StateMessage";
import { formatMoneyCents } from "../../../src/features/billing/money";
import { openPaymentUrl } from "../../../src/features/billing/paymentBrowser";
import { PlatformSessionNotice } from "../../../src/features/platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../../src/features/platform/hooks/usePlatformSession";
import { useCart, useCartActions } from "../../../src/features/shop/hooks/useCart";
import { colors, radii, spacing, typography } from "../../../src/theme";

export default function CartScreen() {
  const router = useRouter();
  const platform = usePlatformSession();
  const cart = useCart();
  const { updateQuantity, removeItem, checkout } = useCartActions();
  const [notice, setNotice] = useState<string | null>(null);

  const items = cart.data?.items ?? [];
  const subtotalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  const currency = items[0]?.product.currency ?? "CAD";
  const busy = updateQuantity.isPending || removeItem.isPending || checkout.isPending;

  async function handleCheckout() {
    setNotice(null);
    try {
      const session = await checkout.mutateAsync({});
      const result = await openPaymentUrl(session.url);
      if (result === "missingUrl") {
        setNotice("Checkout isn't available right now. Please try again or contact the clinic.");
        return;
      }
      if (result === "failed") {
        setNotice("We couldn't open a browser on this device.");
      }
    } catch {
      setNotice("We couldn't start checkout. Check that your cart still has stock, then try again.");
    }
  }

  if (platform === "unavailable") {
    return (
      <Screen kicker="Shop" title="Cart" subtitle="Your bag is stored on the clinic system.">
        <PlatformSessionNotice subject="Your cart" />
      </Screen>
    );
  }

  if (platform === "pending" || cart.isPending) {
    return (
      <Screen kicker="Shop" title="Cart">
        <StateMessage tone="loading" title="Loading your cart" body="Fetching reserved items." />
      </Screen>
    );
  }

  if (cart.isError) {
    return (
      <Screen kicker="Shop" title="Cart">
        <StateMessage
          tone="error"
          title="We couldn't load your cart"
          body="Your items are still saved. Try again in a moment."
          actionLabel="Retry"
          onAction={() => void cart.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen kicker="Shop" title="Cart" subtitle="Checkout opens Stripe in your browser. Shipping is calculated there.">
      {items.length === 0 ? (
        <StateMessage
          tone="empty"
          title="Your cart is empty"
          body="Browse the shop and add a product when you're ready."
          actionLabel="Continue shopping"
          onAction={() => router.replace("/(app)/shop")}
        />
      ) : (
        <>
          {items.map((item) => {
            const image = item.product.images[0];
            return (
              <Card key={item.id}>
                <View style={styles.row}>
                  {image ? (
                    <Image source={{ uri: image.url }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.placeholder]} />
                  )}
                  <View style={styles.copy}>
                    <Text style={styles.name}>{item.product.name}</Text>
                    <Text style={styles.price}>
                      {formatMoneyCents(item.product.priceCents * item.quantity, item.product.currency)}
                    </Text>
                    <View style={styles.qty}>
                      <SecondaryButton
                        label="−"
                        disabled={busy}
                        accessibilityLabel="Decrease quantity"
                        onPress={() =>
                          void updateQuantity.mutateAsync({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          })
                        }
                      />
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <SecondaryButton
                        label="+"
                        disabled={busy}
                        accessibilityLabel="Increase quantity"
                        onPress={() =>
                          void updateQuantity.mutateAsync({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        }
                      />
                    </View>
                    <SecondaryButton
                      label="Remove"
                      tone="danger"
                      disabled={busy}
                      onPress={() => void removeItem.mutateAsync({ productId: item.productId })}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
          <Card title="Order summary">
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoneyCents(subtotalCents, currency)}</Text>
            </View>
            <Text style={styles.shipping}>Shipping calculated at checkout</Text>
          </Card>
          {notice ? <StateMessage tone="error" title="Checkout couldn't continue" body={notice} /> : null}
          <PrimaryButton
            label={checkout.isPending ? "Opening checkout…" : "Proceed to checkout"}
            disabled={busy}
            onPress={() => void handleCheckout()}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
  },
  placeholder: { backgroundColor: colors.primaryMuted },
  copy: { flex: 1, gap: spacing.sm },
  name: { ...typography.heading, color: colors.text },
  price: { ...typography.label, color: colors.primary, fontSize: 16 },
  qty: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  qtyValue: { ...typography.heading, color: colors.text, minWidth: 24, textAlign: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.heading, color: colors.text },
  shipping: { ...typography.caption, color: colors.textMuted },
});
