# syntax=docker/dockerfile:1

# Nova Thera API — NestJS + Prisma, built for Cloud Run.
#
# Multi-stage so the runtime image carries only production dependencies and the
# compiled output. The Prisma client is generated during build because it emits
# TypeScript into src/generated and must exist before `nest build`.

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------- dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Prisma's postinstall needs the schema present.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# --------------------------------------------------------------------- builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate && pnpm build

# --------------------------------------------------------------------- runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat \
 && addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nestjs

# Keep prisma CLI so `migrate deploy` can run at boot. Image is larger than a
# pruned prod tree, which is acceptable for Render.
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

# Render/Cloud Run inject PORT; main.ts reads process.env.PORT.
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
