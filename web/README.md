This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Waitlist (tRPC + Resend)

Copy `.env.example` to `.env.local` and set:

- `RESEND_API_KEY` — from [Resend](https://resend.com/api-keys)
- `RESEND_FROM_EMAIL` — verified sender (e.g. `Nova Thera <marketing@novathera.ca>` after [verifying novathera.ca](https://resend.com/domains))
- `WAITLIST_ADMIN_EMAILS` / `CONTACT_ADMIN_EMAILS` — production inboxes (e.g. `marketing@novathera.ca`)

**Resend test mode:** With `RESEND_FROM_EMAIL=onboarding@resend.dev`, Resend only delivers to the email on your Resend account. Set `RESEND_TEST_RECIPIENT=your@gmail.com` for local dev; waitlist and contact emails will route there automatically until you use a verified `@novathera.ca` sender.

Waitlist signups call `waitlist.join` via tRPC and send an admin notification email.

Contact form submissions call `contact.submit` and email `CONTACT_ADMIN_EMAILS` (default `marketing@novathera.ca`), with `replyTo` set to the visitor's email.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
