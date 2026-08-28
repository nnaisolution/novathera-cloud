export default () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    // Defaults on; set STRIPE_AUTOMATIC_TAX=false for local until Tax head office is configured
    automaticTaxEnabled: process.env.STRIPE_AUTOMATIC_TAX !== 'false',
    successUrlBooking:
      process.env.STRIPE_SUCCESS_URL_BOOKING ??
      'http://localhost:3000/book/confirmation?session_id={CHECKOUT_SESSION_ID}',
    successUrlShop:
      process.env.STRIPE_SUCCESS_URL_SHOP ??
      'http://localhost:3000/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrlShop:
      process.env.STRIPE_CANCEL_URL_SHOP ?? 'http://localhost:3000/shop/cart',
    membershipPriceIds: {
      essential: process.env.STRIPE_PRICE_ID_ESSENTIAL ?? '',
      enhanced: process.env.STRIPE_PRICE_ID_ENHANCED ?? '',
      elite: process.env.STRIPE_PRICE_ID_ELITE ?? '',
    },
    membershipSuccessUrl:
      process.env.STRIPE_SUCCESS_URL_MEMBERSHIP ??
      'http://localhost:3000/account/membership?subscribed=true',
    membershipCancelUrl:
      process.env.STRIPE_CANCEL_URL_MEMBERSHIP ??
      'http://localhost:3000/account/membership',
    membershipPortalReturnUrl:
      process.env.STRIPE_PORTAL_RETURN_URL_MEMBERSHIP ??
      'http://localhost:3000/account/membership',
    // Connect — the non-platform brands are onboarded as connected accounts
    // that receive transfers. Both businesses are Canadian.
    connectCountry: process.env.STRIPE_CONNECT_COUNTRY ?? 'CA',
    connectRefreshUrl:
      process.env.STRIPE_CONNECT_REFRESH_URL ??
      'http://localhost:3001/brands?onboarding=refresh',
    connectReturnUrl:
      process.env.STRIPE_CONNECT_RETURN_URL ??
      'http://localhost:3001/brands?onboarding=complete',
  },
});
