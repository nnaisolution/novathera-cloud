/**
 * Hand-written ecommerce procedure shapes.
 * The generated app-router.d.ts lags Nest until `pnpm trpc:sync` succeeds.
 */

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type PublicProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicProductBrand = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  isPlatform: boolean;
};

export type PublicProductInventory = {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  howToUse: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  priceCents: number;
  currency: string;
  categoryId: string | null;
  brandId: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  concerns: string[];
  productTypes: string[];
  ingredientsFacet: string[];
  skinTypes: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category: PublicProductCategory | null;
  brand: PublicProductBrand | null;
  images: PublicProductImage[];
  inventory: PublicProductInventory | null;
  stockAvailable: boolean;
};

export type PublicListProductsInput = {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
  search?: string;
  concerns?: string[];
  productTypes?: string[];
  ingredientsFacet?: string[];
  skinTypes?: string[];
  categoryId?: string;
  brandIds?: string[];
  sortBy?: "name" | "createdAt" | "priceCents";
};

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  deletedAt: Date | null;
  images: Pick<PublicProductImage, "id" | "url" | "alt" | "sortOrder">[];
  inventory: PublicProductInventory | null;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: CartProduct;
};

export type Cart = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "FULFILLED"
  | "SHIPPED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  slug: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  shippingName: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  fulfilledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

export type OrderWithUser = Order & {
  user: { id: string; name: string; email: string };
};

type QueryProc<TInput, TOutput> = {
  queryOptions: (
    ...args: undefined extends TInput
      ? [input?: TInput, opts?: Record<string, unknown>]
      : [input: TInput, opts?: Record<string, unknown>]
  ) => {
    queryKey: unknown[];
    queryFn: () => Promise<TOutput>;
  };
  queryKey: (input?: TInput) => unknown[];
};

type MutProc<TInput, TOutput = unknown> = {
  mutationOptions: (opts?: Record<string, unknown>) => {
    mutationFn: (input: TInput) => Promise<TOutput>;
  };
};

export type EcommerceTrpcProxy = {
  products: {
    publicList: QueryProc<PublicListProductsInput, Paginated<PublicProduct>>;
    publicGetBySlug: QueryProc<{ slug: string }, PublicProduct>;
  };
  cart: {
    get: QueryProc<undefined, Cart>;
    addItem: MutProc<{ productId: string; quantity?: number }, Cart>;
    updateQuantity: MutProc<{ productId: string; quantity: number }, Cart>;
    removeItem: MutProc<{ productId: string }, Cart>;
    clear: MutProc<void, Cart>;
  };
  checkout: {
    createSession: MutProc<Record<string, never>, { url: string }>;
  };
  orders: {
    myList: QueryProc<
      {
        page?: number;
        limit?: number;
        sortOrder?: "asc" | "desc";
        sortBy?: "createdAt" | "totalCents";
      },
      Paginated<Order>
    >;
    myGetById: QueryProc<{ id: string }, OrderWithUser>;
    myGetBySessionId: QueryProc<{ sessionId: string }, OrderWithUser>;
  };
  bookings: {
    createCheckoutSession: MutProc<{ bookingId: string }, { url: string }>;
  };
};
