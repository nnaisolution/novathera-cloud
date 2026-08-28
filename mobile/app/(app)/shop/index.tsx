import { useRouter } from "expo-router";
import { RefreshControl } from "react-native";

import { NavCard } from "../../../src/components/NavCard";
import { OptionSelector, type SelectorOption } from "../../../src/components/OptionSelector";
import { Screen } from "../../../src/components/Screen";
import { StateMessage } from "../../../src/components/StateMessage";
import { ProductCard } from "../../../src/features/shop/components/ProductCard";
import { useShopCatalog } from "../../../src/features/shop/hooks/useShopCatalog";
import { colors } from "../../../src/theme";

export default function ShopHomeScreen() {
  const router = useRouter();
  const catalog = useShopCatalog();

  const categoryOptions: SelectorOption<string>[] = [
    { value: "all", label: "All" },
    ...catalog.categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  return (
    <Screen
      withTopInset
      kicker="Clinic shop"
      title="Shop"
      subtitle="Skincare and wellness products from Nova Thera. Checkout opens a secure Stripe page."
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={catalog.refetch}
          tintColor={colors.primary}
        />
      }
    >
      <NavCard
        mark="☰"
        title="Your cart"
        caption="Review items and check out"
        onPress={() => router.push("/(app)/shop/cart")}
      />

      {categoryOptions.length > 1 ? (
        <OptionSelector
          options={categoryOptions}
          value={catalog.categoryId ?? "all"}
          onChange={(next) => catalog.setCategoryId(next === "all" ? undefined : next)}
          accessibilityLabel="Filter by category"
          layout="scroll"
        />
      ) : null}

      {catalog.isError ? (
        <StateMessage
          tone="error"
          title="We couldn't load the shop"
          body="The clinic catalog lives on Nova Thera's platform. Check your connection and try again."
          actionLabel="Retry"
          onAction={catalog.refetch}
        />
      ) : catalog.isPending ? (
        <StateMessage tone="loading" title="Loading products" body="Fetching the catalog." />
      ) : catalog.products.length === 0 ? (
        <StateMessage
          tone="empty"
          title="Nothing in this category yet"
          body="Try another category, or check back when new products are published."
        />
      ) : (
        catalog.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => router.push(`/(app)/shop/${product.slug}`)}
          />
        ))
      )}
    </Screen>
  );
}
