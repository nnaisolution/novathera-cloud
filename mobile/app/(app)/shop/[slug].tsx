import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Card } from "../../../src/components/Card";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { formatMoneyCents } from "../../../src/features/billing/money";
import { PlatformSessionNotice } from "../../../src/features/platform/components/PlatformSessionNotice";
import { usePlatformSession } from "../../../src/features/platform/hooks/usePlatformSession";
import { useCartActions } from "../../../src/features/shop/hooks/useCart";
import { useShopProduct } from "../../../src/features/shop/hooks/useShopCatalog";
import { colors, radii, spacing, typography } from "../../../src/theme";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const platform = usePlatformSession();
  const productQuery = useShopProduct(typeof slug === "string" ? slug : undefined);
  const { addItem } = useCartActions();
  const [notice, setNotice] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const product = productQuery.data;

  async function handleAdd() {
    if (!product) return;
    setNotice(null);
    setAdded(false);
    try {
      await addItem.mutateAsync({ productId: product.id, quantity: 1 });
      setAdded(true);
    } catch {
      setNotice("We couldn't add that to your cart. Check stock and try again.");
    }
  }

  if (productQuery.isError) {
    return (
      <Screen kicker="Shop" title="Product">
        <StateMessage
          tone="error"
          title="We couldn't load this product"
          body="It may have been unpublished. Browse the catalog and pick another."
          actionLabel="Back to shop"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  if (productQuery.isPending || !product) {
    return (
      <Screen kicker="Shop" title="Product">
        <StateMessage tone="loading" title="Loading product" body="Fetching details." />
      </Screen>
    );
  }

  const image = product.images[0];

  return (
    <Screen kicker={product.brand?.name ?? "Shop"} title={product.name}>
      <Card>
        {image ? (
          <Image
            source={{ uri: image.url }}
            style={styles.hero}
            accessibilityLabel={image.alt ?? product.name}
          />
        ) : (
          <View style={[styles.hero, styles.placeholder]} />
        )}
        <Text style={styles.price}>{formatMoneyCents(product.priceCents, product.currency)}</Text>
        {product.category ? <Text style={styles.meta}>{product.category.name}</Text> : null}
        {!product.stockAvailable ? <Text style={styles.stock}>Out of stock</Text> : null}
        {product.description ? <Text style={styles.body}>{product.description}</Text> : null}
        {product.howToUse ? (
          <>
            <Text style={styles.section}>How to use</Text>
            <Text style={styles.body}>{product.howToUse}</Text>
          </>
        ) : null}
        {product.ingredients ? (
          <>
            <Text style={styles.section}>Ingredients</Text>
            <Text style={styles.body}>{product.ingredients}</Text>
          </>
        ) : null}
      </Card>

      {platform === "unavailable" ? (
        <PlatformSessionNotice subject="Your cart" />
      ) : platform === "pending" ? (
        <StateMessage tone="loading" title="Checking your session" body="One moment." />
      ) : (
        <>
          {notice ? <StateMessage tone="error" title="Couldn't add to cart" body={notice} /> : null}
          {added ? (
            <StateMessage
              tone="empty"
              title="Added to cart"
              body="Review it whenever you're ready to check out."
              actionLabel="View cart"
              onAction={() => router.push("/(app)/shop/cart")}
            />
          ) : null}
          <PrimaryButton
            label={addItem.isPending ? "Adding…" : "Add to cart"}
            disabled={addItem.isPending || !product.stockAvailable || added}
            onPress={() => void handleAdd()}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: 220,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
  },
  placeholder: { backgroundColor: colors.primaryMuted },
  price: { ...typography.title, color: colors.primary },
  meta: { ...typography.caption, color: colors.secondary },
  stock: { ...typography.caption, color: colors.warning },
  section: { ...typography.label, color: colors.secondary, letterSpacing: 0.4, textTransform: "uppercase" },
  body: { ...typography.body, color: colors.text },
});
