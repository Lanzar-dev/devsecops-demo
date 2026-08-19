# syntax=docker/dockerfile:1

# Base: Debian slim (glibc) so Prisma engines and @node-rs/argon2 prebuilts work.
FROM node:26-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
# OpenSSL is required by the Prisma query/schema engines in every stage.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# ---- Production dependencies only ----
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- Builder: full deps, generate Prisma client, compile TypeScript ----
FROM base AS builder
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ---- Runtime: minimal, non-root ----
FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
# Bring in the generated Prisma client (client + query engine) from the builder.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
# Remove the base image's bundled npm/npx: production runs `node dist/server.js`
# and never needs a package manager. This drops every fixable node-pkg CVE and
# removes a package manager from the runtime (attack-surface reduction).
RUN rm -rf /usr/local/lib/node_modules/npm \
  /usr/local/bin/npm /usr/local/bin/npx \
  /usr/local/bin/corepack /usr/local/lib/node_modules/corepack
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
