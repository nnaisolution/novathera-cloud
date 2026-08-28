import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, elevation, radii, spacing, typography } from "../../../theme";
import { formatMoneyCents } from "../../billing/money";
import type { ShopProduct } from "../types";

type Props = {
  product: ShopProduct;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const image = product.images[0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {image ? (
        <Image source={{ uri: image.url }} style={styles.image} accessibilityLabel={image.alt ?? product.name} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.category ? <Text style={styles.category}>{product.category.name}</Text> : null}
        <Text style={styles.price}>{formatMoneyCents(product.priceCents, product.currency)}</Text>
        {!product.stockAvailable ? <Text style={styles.stock}>Out of stock</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.card,
  },
  pressed: { opacity: 0.85 },
  image: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
  },
  placeholder: { backgroundColor: colors.primaryMuted },
  copy: { flex: 1, justifyContent: "center", gap: 4 },
  name: { ...typography.heading, color: colors.text },
  category: { ...typography.caption, color: colors.secondary },
  price: { ...typography.label, color: colors.primary, fontSize: 16 },
  stock: { ...typography.caption, color: colors.warning },
});
