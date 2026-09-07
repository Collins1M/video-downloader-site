FROM node:20-slim AS deps
WORKDIR /app
COPY package.json ./
COPY packages/types ./packages/types
# We don't have a lockfile yet in the new directory, so we run install
RUN npm install --audit=false

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --gid 1001 --system nodejs \
    && adduser --system --uid 1001 nodejs

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]
