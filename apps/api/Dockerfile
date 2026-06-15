# Stage 1: Build NestJS API
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma/
COPY apps/api/package.json apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy shared db client and api source
COPY packages/db packages/db
COPY apps/api apps/api



# Build NestJS API
RUN pnpm --filter api build

# Stage 2: Production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma/
COPY apps/api/package.json apps/api/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy generated Prisma and compiled NestJS assets
COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/packages/db /app/packages/db

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "apps/api/dist/main"]
