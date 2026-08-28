# Nova Thera Mobile Health Companion

Patient-facing iOS/Android companion (Expo), a Next.js patient API, a NestJS platform API (bookings, shop, membership, Better Auth), a staff admin dashboard, and a public customer site.

Health data is treated as PHI: access tokens live in the OS keychain, phones are stored encrypted with HMAC lookup only, OTP codes are hashed, and application logs must not include identifiers or clinical values.

## Architecture

| Path | Role | Default port |
| --- | --- | --- |
| `mobile/` | Expo 57 app (OTP auth, health, bookings, shop, membership) | Metro `:8081` |
| `web/` | Customer site (marketing, shop, booking, account) | Next.js `:3000` * |
| `admin/` | Staff dashboard | `:3001` |
| `backend/` | Next.js **patient API** (tRPC, Prisma, OTP, observations, consent) | `:3000` |
| `backend/nova_thera_backend_nest_app-main/` | NestJS **platform API** (Better Auth, bookings, shop, membership, documents) | `:4000` |
| `packages/shared/` | Shared TypeScript types (observations, consent, auth) | — |

\* `web` and the patient API both default to **:3000**. Do not run them on the same port. For a dual local run, start the storefront on another port (for example `pnpm dev -- --port 3002`) and set `NEXT_PUBLIC_APP_URL` / Nest `BETTER_AUTH_TRUSTED_ORIGINS` / Stripe success URLs to match.

### Two PostgreSQL databases (required)

The Next.js patient API and the NestJS platform API each have their own Prisma schema. **They must not share the same database `public` schema.** Recommended local names:

| App | Database | Env file |
| --- | --- | --- |
| Patient API (Next) | `nova_thera_next` | `backend/.env` |
| Platform API (Nest) | `nova_thera_nest` | `backend/nova_thera_backend_nest_app-main/.env` |

Pointing both `DATABASE_URL`s at one database will collide on table names (`user`, migrations, etc.) and corrupt both apps.

Identity is **dual**: a `Patient` row lives in the Next database; a Better Auth `User` lives in the Nest database. After OTP, the patient API mints a short-lived `linkToken`; the mobile app exchanges it at Nest `POST /api/mobile/session-exchange` so the same person is linked (`User.patientId`).

## Prerequisites

- **Node.js** (current LTS) and **npm** (root / `mobile` / `backend` use npm workspaces)
- **pnpm** via [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) for `admin`, `web`, and Nest
- **Docker** (recommended) or a local **PostgreSQL 16** server
- **Expo CLI** (`npx expo`) for the mobile app
- **EAS CLI** (optional) for preview APK / iOS device builds: `npm i -g eas-cli`
- iOS HealthKit / production iOS builds: **Xcode** + Apple Developer account
- Android Health Connect / preview APK: Android SDK or EAS

## Environment variables

**Never commit real `.env` files.** Copy each example and fill secrets locally (`openssl rand -hex 32` for 32-byte keys; `ENCRYPTION_KEY` on the patient API is 64 hex chars).

| Example file | Copy to | Summary |
| --- | --- | --- |
| `backend/.env.example` | `backend/.env` | `DATABASE_URL` (`nova_thera_next`), `APP_ENV`, crypto peppers/keys (`ENCRYPTION_KEY`, `PHONE_HASH_PEPPER`, `OTP_PEPPER`, `JWT_ACCESS_SECRET`, `REFRESH_TOKEN_PEPPER`), `MOBILE_LINK_SECRET` (must match Nest), `OTP_DEV_BYPASS`, `HEALTH_STAFF_API_KEY` (must match admin `PATIENT_API_STAFF_TOKEN`), `ALLOWED_ORIGINS`, optional Cal.com/Polar/SMS |
| `backend/nova_thera_backend_nest_app-main/.env.example` | `backend/nova_thera_backend_nest_app-main/.env` | `PORT`, `DATABASE_URL` (`nova_thera_nest`), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `BETTER_AUTH_ADMIN_APP_URL`, `MOBILE_LINK_SECRET`, Resend, Stripe (optional), GCS, `EXPO_ACCESS_TOKEN` / `FCM_SERVER_KEY` for push |
| `mobile/.env.example` | `mobile/.env` | **Origins only:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_NEST_API_URL`. Clients append tRPC paths. On a physical device, use the LAN IP, not `localhost`. |
| `admin/.env.example` | `admin/.env.local` | `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` (Nest `:4000`), `NEXT_PUBLIC_APP_URL` (`:3001`), `NEXT_PUBLIC_PATIENT_API_URL`, `PATIENT_API_STAFF_TOKEN`, optional Blob + seed overrides |
| `web/.env.example` | `web/.env.local` | `NEXT_PUBLIC_API_URL` (Nest), `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, Resend / waitlist / contact inboxes |
| `.env.example` (repo root) | — | Pointer only (`APP_ENV`). Per-app files above are the source of truth. |

`MOBILE_LINK_SECRET` must be **byte-identical** on the patient API and Nest or session exchange fails.

`HEALTH_STAFF_API_KEY` (patient API) must match `PATIENT_API_STAFF_TOKEN` (admin) or the Health Data page cannot list observations.

## Database setup

### Docker PostgreSQL 16

```bash
docker run --name nova-thera-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

docker exec -it nova-thera-pg psql -U postgres -c "CREATE DATABASE nova_thera_next;"
docker exec -it nova-thera-pg psql -U postgres -c "CREATE DATABASE nova_thera_nest;"
```

Use a dedicated role if you prefer (`CREATE ROLE … LOGIN PASSWORD …` then `GRANT ALL ON DATABASE …`).

### Migrate each Prisma app

```bash
# Patient API (Next)
cd backend
cp .env.example .env   # then set DATABASE_URL to nova_thera_next and fill keys
npx prisma generate
npx prisma migrate deploy

# Platform API (Nest)
cd nova_thera_backend_nest_app-main
cp .env.example .env   # then set DATABASE_URL to nova_thera_nest and fill keys
corepack enable
pnpm install
pnpm prisma generate
npx prisma migrate deploy
```

Optional Nest demo catalog (locations, services, shop products with placeholder images): `pnpm db:seed:demo` from the Nest app directory (`npx tsx prisma/seed-demo.ts`). Does not touch `admin@novathera.ca`.

Optional Next patient programs (weight management, sleep recovery, metabolic reset, IV/acupuncture aftercare) plus enrollments: `npm run db:seed:programs` from `backend/`. Enrolls every existing patient and upserts a demo patient at `+16045550100`. Admin seed (`pnpm seed` in `admin/`) expects Nest to already be running.

## How to run

Install **root workspaces** once (mobile + patient API + shared types):

```bash
cd /path/to/NovaThera
npm install
```

Admin, web, and Nest each have their own lockfile — install with pnpm in those directories.

### Patient API (Next.js) — `:3000`

```bash
cd backend
npm run dev          # next dev --port 3000
```

### Platform API (NestJS) — `:4000`

```bash
cd backend/nova_thera_backend_nest_app-main
pnpm start:dev       # nest start --watch, PORT=4000
```

### Admin dashboard — `:3001`

```bash
cd admin
pnpm install
pnpm dev             # next dev --port 3001
```

### Customer site (`web`)

```bash
cd web
pnpm install
pnpm dev             # Next default :3000 — conflict with patient API
# Dual-run example:
pnpm dev -- --port 3002
```

### Mobile (Expo)

```bash
cd mobile
cp .env.example .env
npx expo start
```

From the repo root you can also use `npm run mobile` and `npm run backend`.

## Device testing

Three Android/iOS runtimes, in increasing native fidelity:

| Runtime | How | HealthKit / Health Connect | Local reminders | Remote Expo push |
| --- | --- | --- | --- | --- |
| **Expo Go** | `npx expo start` then scan | No (modules will not load) | Unreliable / not the supported path | No |
| **Development client** | EAS `development` profile (`developmentClient: true`), then `npx expo start --dev-client` | Yes, on a real device | Yes — **Send test notification** under Account → Notifications | Token minting yes; Nest send still needs `EXPO_ACCESS_TOKEN` |
| **Preview APK** | EAS `preview` profile (`android.buildType: apk`) | Yes | Yes | Same as the dev client |

Install the **development Android client** from the latest EAS `development` artifact (Expo dashboard for project `nova-thera-mobile-health-companion`). After install, start Metro with `npx expo start --dev-client` in `mobile/` and open the app — it loads the JS bundle from your machine.

Sideload the **preview APK** when you want a store-like binary that does not talk to Metro: https://expo.dev/artifacts/eas/ssWjk2bz9gnAXWkly6e1iUayxxA8mvdVa_NL5rsyUdE.apk (`5c1f690e`).

iOS development/preview EAS builds need Apple internal-distribution credentials in interactive `eas-cli`. That was not available non-interactively (account `nnaisolutions`). HealthKit still requires a physical iPhone.

On a physical device, `localhost` in `EXPO_PUBLIC_*` URLs is the phone, not your laptop. Point both origins at the machine’s LAN address (and allow that origin in `ALLOWED_ORIGINS` / `BETTER_AUTH_TRUSTED_ORIGINS`).

### OTP (development)

When **not** production (`OTP_DEV_BYPASS=true` **or** `NODE_ENV !== 'production'`), the patient API **skips SMS**, logs code `000000`, and **accepts `000000` on verify**. Production refuses `OTP_DEV_BYPASS`. Do not enable bypass in staging/prod.

Demo programs were seeded for every patient in `nova_thera_next`, including `+16045550100` (display name “Demo Patient”). Sign in with that number and code `000000` to see enrollments immediately.

### Local test notification

Account → Notifications → **Send test notification** schedules an on-device banner in about five seconds. It does **not** use an Expo push token or `EXPO_ACCESS_TOKEN`. Visit reminders (1 hour before a Nest booking) and a daily 09:00 health check-in follow the SecureStore toggles once OS permission is granted.

## tRPC

| API | HTTP path | Mobile env (origin only) |
| --- | --- | --- |
| Patient (Next) | `{EXPO_PUBLIC_API_URL}/api/trpc` | `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3000`) |
| Platform (Nest) | `{EXPO_PUBLIC_NEST_API_URL}/trpc` | `EXPO_PUBLIC_NEST_API_URL` (e.g. `http://localhost:4000`) |

Clients **append** `/api/trpc` or `/trpc`. Do not put those suffixes in the env vars.

Admin and web talk to Nest at `{NEXT_PUBLIC_API_URL}/trpc`. Admin health observations go through a same-origin BFF (`admin/app/api/patient-health`) to the patient API.

## Known limits and roadmap

- **Dual identity:** `Patient` (Next DB) vs Better Auth `User` (Nest DB). Linking depends on `linkToken` (120s, signed with `MOBILE_LINK_SECRET`) and `POST /api/mobile/session-exchange`. Refresh does not mint a new link token — a dead Nest session requires a fresh OTP.
- **Stripe:** Better Auth Stripe plugin is **off** unless both `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set. Checkout/membership need Dashboard Price IDs and webhook forwarding (`stripe listen --forward-to localhost:4000/api/auth/stripe/webhook`).
- **Webhooks:** Cal.com / Polar secrets on the patient API and Stripe / Resend on Nest are optional locally; unsigned production webhooks will fail.
- **HealthKit / Health Connect:** plugins and permissions are in `app.config.js` (including partial Android grants, history/background health reads, and `ACTIVITY_RECOGNITION`). Sync still needs a **physical device** and a **dev client or preview APK**. Android emulators without Health Connect / Play services are treated as unavailable, not a crash. Web is a no-op. TREATMENT consent is required before ingest; OS permission can still be granted first.
- **No location on observations:** `health.staffList` is patient-scoped in the Next database; there is no `locationId` on observations.
- **Program tasks:** enrollments and a read-only `instructions` checklist JSON live on Next `programs.list`. There is still **no tasks API** to mark steps done.
- **Push:** Nest sends Expo remote push only when `EXPO_ACCESS_TOKEN` (or `FCM_SERVER_KEY`) is set **and** the device registered a live token from a native build — not Expo Go. Local reminders do not wait on that secret.
- **iOS EAS:** non-interactive internal-distribution credentials were missing; iOS native builds were skipped. `ITSAppUsesNonExemptEncryption` is unset and will need a decision before TestFlight.

## Privacy defaults (patient API)

- Access tokens: 15 minutes; refresh tokens hashed at rest
- Consent is required before observation ingest
- Duplicate protection uses a patient-scoped content hash
- Units normalize to UCUM-style canonical values for a FHIR-ready model
