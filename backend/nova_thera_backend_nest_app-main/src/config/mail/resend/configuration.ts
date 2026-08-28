export default () => ({
  mail: {
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail:
        process.env.RESEND_FROM_EMAIL ?? 'Nova Thera <onboarding@resend.dev>',
      testRecipient: process.env.RESEND_TEST_RECIPIENT?.trim() || undefined,
    },
  },
});
