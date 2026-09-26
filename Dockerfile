# Multi-stage Production Dockerfile for NestJS
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production

# -------------------------------------------------------------
# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache curl

# Run as non-root user for security
RUN addgroup -S egmsgroup && adduser -S egmsuser -G egmsgroup

COPY --from=builder --chown=egmsuser:egmsgroup /app/dist ./dist
COPY --from=builder --chown=egmsuser:egmsgroup /app/node_modules ./node_modules
COPY --from=builder --chown=egmsuser:egmsgroup /app/package.json ./package.json
COPY --from=builder --chown=egmsuser:egmsgroup /app/views ./views
COPY --from=builder --chown=egmsuser:egmsgroup /app/public ./public

# Ensure upload directory exists with proper permissions
RUN mkdir -p /app/storage/uploads && chown -R egmsuser:egmsgroup /app/storage

USER egmsuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
