# AMX-ERP Project Requirements

This document outlines the technical environment, toolchains, system resources, and database setup required for development and production deployments of the AMX-ERP platform.

---

## 🛠️ Required Toolchain

- **Node.js:** version 18.0.0 or newer (LTS recommended, verified with 20+)
- **pnpm:** version 9.0.0 or newer (Strict monorepo lock manager)
- **Git:** for distributed source control
- **Terminal:** PowerShell (Windows), zsh/bash (macOS/Linux)

---

## 💻 System Resources

- **RAM:** Minimum 8 GB (16 GB highly recommended for heavy monorepo Turborepo development)
- **CPU:** Quad-core modern processor or better (handles concurrent build execution)
- **Storage:** ~1.5 GB for package trees, SQLite databases, and dynamic build artifacts
- **Network:** Continuous access to the `npm`/`pnpm` registry and CDNs (Google Fonts, etc.)

---

## 🌐 Environment & Ports

### 🔌 Available Ports
- `3000`: Web Frontend (Next.js 16 Client & Server App Router)
- `3001`: Backend Core API (NestJS event-driven, if active)
- `dev.db`: SQLite local database file residing inside `apps/web`

### 🔧 Git Configuration
To prevent line-ending mutations on cross-platform Windows environments:
```powershell
git config --global core.autocrlf true
```

---

## 🏗️ Repository Architecture & Workspace Rules

- **Root Execution:** Run all cross-project tasks (e.g. `pnpm dev`, `pnpm build`) from `D:\amx-erp`.
- **Dependency Isolation:** Strictly use `pnpm` workspace filters rather than generic package managers.
- **Turborepo Turbocharging:** Utilizes `.turbo` build caching. Ensure your build terminal has absolute write permissions to root and application sub-directories.

---

## 🗄️ Database & Prisma ORM Config

AMX-ERP has migrated from an ephemeral client-side Zustand store to a highly-resilient, production-ready **Prisma + SQLite** architecture utilizing Next.js **Server Actions** for real-time transactional updates.

### 💾 Driver Adapter Constraints
For performance and stability in specific development containers:
- **Client Adaptability:** Utilizes `@libsql/client` coupled with `@prisma/adapter-libsql`.
- **Local SQLite DB File:** Generates `apps/web/dev.db` upon initial schema execution.

---

## 🔒 Security, Routing & Sessions

- **Protected Routing:** Governed strictly by Next.js `middleware.ts` intercepting network requests.
- **Session Tokens:** Secured with the `amx_auth` and `amx_role` cookie pairs (handled via `js-cookie`).
- **Authorization Contexts:** Implements strict Role-Based Access Control (RBAC) across modular workspaces: HR, Finance, Supply Chain, and Admin.

