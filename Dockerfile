# Stage 1: Install dependencies
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the app
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- NEW: Bake the production API URL into the build ---
ENV NEXT_PUBLIC_API_URL=https://core-platform-api-173690049028.europe-west4.run.app/api/v1

# This will build the Next.js app
RUN npm run build

# Stage 3: Production server
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV production
# Cloud Run expects apps to listen on port 8080 by default
ENV PORT 8080

# Create a non-root user for security
RUN addgroup --system --uid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Start the application
CMD ["node", "server.js"]