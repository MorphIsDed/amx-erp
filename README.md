# AMX-ERP: The Spatial Enterprise OS 🚀

AMX-ERP is a next-generation Enterprise Resource Planning (ERP) platform designed as a living, spatially-aware operating system for the modern enterprise. It moves beyond static dark-mode dashboards into a fluid, reactive organism that breathes and responds to data in real-time.

---

## ✨ Design Philosophy

AMX-ERP represents a radical shift in enterprise UX:
- **Aurora Mesh Gradients:** Dynamic, time-shifting backgrounds that create a sense of life and spatial presence.
- **Spatial Depth:** A 6-level elevation system using glass-morphism, Z-index-aware shadows, and light refraction.
- **Physics-Based UI:** Smooth spring-based animations and magnetic interactions powered by Framer Motion.
- **Chromatic Refraction:** Iridescent gradient borders, glass panels, and plasma-effect focus states.
- **Dynamic Theming:** Implements full light/dark mode configuration utilizing Tailwind CSS v4 and `next-themes` for high-fidelity dark-glass and ice-glass aesthetics.

---

## 🏗️ Monorepo Structure

Built on **Turborepo** for high performance and scalability:

- `apps/web` — **Next.js 16** (App Router) powered by Tailwind CSS v4, Framer Motion, and Zustand.
- `apps/api` — **NestJS** event-driven backbone utilizing EventEmitter2 and BullMQ (if enabled).
- `packages/ui` — Shared component library and design tokens.
- `packages/typescript-config` & `eslint-config` — Shared architectural and styling standards.

---

## ⚙️ Technical Stack & Architecture

- **Frontend & App Framework:** Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Recharts.
- **State & Theme Management:** Zustand (reactive stores), `next-themes` (system-adaptive layouts).
- **Persistent Database:** Prisma ORM connected to a highly performant local SQLite engine using `@libsql/client` and `@prisma/adapter-libsql`.
- **API and Mutation Layer:** Next.js **Server Actions** providing direct DB access with automatic cache-revalidation (`revalidatePath`).
- **Client Performance:** Seamless client-side **Optimistic Updates** (`useTransition`) across all CRUD mutations (HR, Finance, Inventory, Purchase Orders) for instant 0ms-latency visual updates.
- **Enterprise-Grade Routing:** High-performance Next.js `middleware.ts` restricting access by validating cookie-based sessions (`amx_auth` and `amx_role` using `js-cookie`).

---

## 🚀 Advanced Power-User Features (Option B & C)

The platform is supercharged with high-utility enterprise-grade workflows:

1. **Global Command Palette (Cmd+K / Ctrl+K):**
   - High-speed fuzzy search dashboard launcher powered by `cmdk`.
   - Access actions, modules, toggle themes, and trigger notifications instantly from any view.
2. **Dynamic Drag-and-Drop Onboarding Board:**
   - Converts the static HR candidate list into an immersive, multi-stage interactive onboarding pipeline using `@hello-pangea/dnd`.
3. **Automated PDF Report Generation:**
   - Instantly compiles key financial charts, transaction records, and administrative analytics into polished PDF summaries utilizing `jspdf` and `jspdf-autotable`.
4. **Universal CSV Data Export:**
   - Instant spreadsheet extraction across all dynamic tabular modules (HR, Financial Ledger, and Inventory).
5. **Real-time Ambient Notification Center:**
   - Glow-tipped notifications center providing system updates, transactional logs, and operational alerts.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js 18+**
- **pnpm 9+**

### 2. Dependency Installation
```powershell
pnpm install
```

### 3. Database Hydration & Seeding
Set up the SQLite database and populate it with initial enterprise mocks:
```powershell
# Navigate into the web app
cd apps/web

# Push schema directly
npx prisma db push

# Seed default employees, transactions, inventory, and POs
npx prisma db seed
```

### 4. Running the Dev Server
Launch the workspace:
```powershell
# From the root directory
pnpm dev
```
Access the application at: `http://localhost:3000`

---

## 📜 Development Standards

- **Depth System:** Leverage the **6-level spatial depth elevation tokens** in `tokens.css`.
- **Fluid Animation:** Avoid linear transitions. Use spring-physics for natural and organic micro-interactions.
- **Optimistic State Updates:** Always wrap mutating actions in React transitions to deliver responsive feedback.
- **Strict Linting:** Run `pnpm lint` and `pnpm check-types` before opening a pull request.

