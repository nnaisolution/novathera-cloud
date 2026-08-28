# Nova Thera API

Next.js App Router service: tRPC, Prisma/PostgreSQL, OTP auth, and health ingest.

```bash
cp .env.example .env
# fill ENCRYPTION_KEY and peppers: openssl rand -hex 32
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Do not log request bodies from `/api/health` or `/api/auth`. Audit logs store action names only.
