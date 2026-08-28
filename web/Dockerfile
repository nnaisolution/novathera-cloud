# syntax=docker/dockerfile:1

# Nova Thera storefront — Next.js, built for Cloud Run.
#
# Relies on `output: "standalone"` in next.config.ts, which emits a minimal
# server bundle so the runtime image does not need node_modules at all.
#
# NOTE: NEXT_PUBLIC_* values are inlined at build time, not read at runtime.
# NEXT_PUBLIC_API_URL must therefore be passed as a build arg, and a change to
# it requires a rebuild, not just a new revision.

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------- dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store     pnpm install --frozen-lockfile

# --------------------------------------------------------------------- builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# --------------------------------------------------------------------- runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
# The standalone output already contains the trimmed node_modules it needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=8080 HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
