
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/excali-plus/package.json apps/excali-plus/
COPY apps/http-backend/package.json apps/http-backend/
COPY apps/ws-backend/package.json apps/ws-backend/
COPY packages/common/package.json packages/common/
COPY packages/ui/package.json packages/ui/
COPY packages/db/package.json packages/db/
COPY packages/backend-common/package.json packages/backend-common/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=excali-plus build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/excali-plus/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/excali-plus/.next/static ./apps/excali-plus/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/excali-plus/public ./apps/excali-plus/public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
