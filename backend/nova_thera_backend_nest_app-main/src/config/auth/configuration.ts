export default () => ({
  auth: {
    appName: process.env.APP_NAME ?? 'Nova Thera',
    secret: process.env.BETTER_AUTH_SECRET,
    baseUrl: process.env.BETTER_AUTH_URL,
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    requireEmailVerification:
      process.env.BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false',
    trustedProxyHeaders:
      process.env.BETTER_AUTH_TRUSTED_PROXY_HEADERS === 'true',
    ipAddressHeaders: (process.env.BETTER_AUTH_IP_ADDRESS_HEADERS ?? '')
      .split(',')
      .map((header) => header.trim())
      .filter(Boolean),
    adminAppUrl:
      process.env.BETTER_AUTH_ADMIN_APP_URL ?? 'http://localhost:3001',
    // Open self-service admin registration on the admin app.
    //
    // WARNING: while this is on, anyone who can reach /register on the admin
    // app can create a full admin account and read every customer's health
    // documents. Set ADMIN_SELF_SIGNUP_ENABLED=false to switch it off without
    // a code change — the endpoint then refuses and the page redirects to login.
    adminSelfSignupEnabled: process.env.ADMIN_SELF_SIGNUP_ENABLED !== 'false',
    // Parent domain for sharing the session cookie across subdomains, e.g.
    // ".novathera.ca" so api./admin./www. all see the same session. Leave unset
    // for local development, where everything is on localhost.
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN ?? '',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    appleClientId: process.env.APPLE_CLIENT_ID ?? '',
    appleClientSecret: process.env.APPLE_CLIENT_SECRET ?? '',
    facebookClientId: process.env.FACEBOOK_CLIENT_ID ?? '',
    facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    // Shared with the patient API (Next.js), which signs the short-lived link
    // token the mobile app trades for a session. Both sides must hold the same
    // value or every exchange fails signature validation.
    mobileLinkSecret: process.env.MOBILE_LINK_SECRET ?? '',
  },
});
