# Stage 1: Build Next.js Web App
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ui/package.json packages/ui/
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma/
COPY apps/web/package.json apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy shared ui, db client, and web app source
COPY packages/ui packages/ui
COPY packages/db packages/db
COPY apps/web apps/web

# Build Next.js Web app
RUN pnpm --filter web build

# Stage 2: Production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ui/package.json packages/ui/
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma/
COPY apps/web/package.json apps/web/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built Next.js artifacts
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=builder /app/packages/db /app/packages/db
COPY --from=builder /app/packages/ui /app/packages/ui

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "--filter", "web", "start"]
