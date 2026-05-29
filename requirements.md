# AMX-ERP Project Requirements

This document outlines the technical environment, toolchains, system resources, database setup, and architectural guidelines required for developing and deploying the unified AMX-ERP platform.

---

## 🛠️ Required Toolchain

- **Node.js:** version `20.19.0` or newer (LTS highly recommended; verified with 20.19.0+)
- **pnpm:** version `9.0.0` or newer (Strict monorepo lock manager)
- **Git:** for distributed source control
- **Terminal:** PowerShell (Windows), zsh/bash (macOS/Linux)
- **Docker:** for hosting production dependencies (PostgreSQL, Redis)

---

## 💻 System Resources

- **RAM:** Minimum 8 GB (16 GB highly recommended for heavy monorepo Turborepo concurrent builds)
- **CPU:** Quad-core modern processor or better (handles concurrent build execution)
- **Storage:** ~1.5 GB for package trees, SQLite databases, and dynamic build assets
- **Services:**
  - **PostgreSQL 16:** Production-ready relational storage for NestJS API core.
  - **Redis 7:** Messaging backing and jobs queue for BullMQ notifications delivery.

---

## 🌐 Environment & Ports

### 🔌 Port Mappings
- `3000`: Web Frontend (Next.js 16 Client & Server App Router; PWA enabled)
- `3001`: Core Backend API (NestJS event-driven backbone)
  - `/api/*`: REST endpoints and SSE streams
  - `/graphql`: Apollo Server playground and Gateway
- `5432`: PostgreSQL Database (for `apps/api`)
- `6379`: Redis Server (for BullMQ notifications processing)
- `5050`: pgAdmin 4 Administration panel

### 🔧 Git Configuration
To prevent line-ending mutations on cross-platform Windows environments:
```powershell
git config --global core.autocrlf true
```

---

## 🏗️ Repository Architecture & Workspace Rules

The workspace is a Turborepo-managed monorepo containing:
- **`apps/web`:** Next.js 16 frontend app, talking directly to local SQLite via Prisma, and to the API Core for real-time streams (Activity, Notifications, Inventory).
- **`apps/api`:** NestJS backend core, communicating with PostgreSQL, exposing REST + GraphQL interfaces.
- **`packages/db`:** Shared module exposing Prisma models, PostgreSQL Client, and schemas to the NestJS API.
- **`packages/typescript-config` & `eslint-config`:** Shared developer standards.

---

## 🗄️ Database & Prisma ORM Config

AMX-ERP employs a hybrid database strategy:
1. **Next.js Web Frontend:** Direct, lightweight relational access to a local SQLite database (`apps/web/dev.db`) using the `@prisma/adapter-libsql` driver, allowing high-performance optimistic CRUD UI actions.
2. **NestJS API Backend:** Multi-tenant PostgreSQL database (`amx_erp`) managed via `@repo/db` with tenant partitioning.

---

## 🔒 Security, Routing & Sessions

- **Protected Routing:** Governed strictly by Next.js `middleware.ts` intercepting network requests.
- **Session Tokens:** Secured with the `amx_auth` and `amx_role` cookie pairs (handled via `js-cookie`).
- **Authorization Contexts:** Implements strict Role-Based Access Control (RBAC) across modular workspaces: HR, Finance, Supply Chain, and Admin.
- **SSE Stream Security:** Supports combined JWT token extraction from both request headers (standard Bearer auth) and query string parameters (`?token=jwt`) to securely enable standard browser `EventSource` connections.
