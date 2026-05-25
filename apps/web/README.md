# AMX-ERP Frontend App 🌐

This is the Next.js 16 Web Application powering the **AMX-ERP Enterprise Spatial OS**. It integrates beautiful glassmorphism designs with a complete **Prisma + SQLite** relational database layer, using Next.js **Server Actions** for sub-millisecond, client-side **Optimistic State Updates**.

---

## 🚀 Key Modules & Capabilities

- **Executive Core Analytics:** High-fidelity dynamic data charts powered by `recharts`.
- **Financial Ledger:** Invoicing, transaction categorization, PDF statement exports (`jspdf`), and CSV data extractions.
- **Human Resources:** Interactive drag-and-drop onboarding board (`@hello-pangea/dnd`), real-time employee directories, and role filters.
- **Supply Chain Management:** Inventory stock control and real-time Purchase Order tracking.
- **Global Command Palette:** High-speed action shortcuts, theme selectors, and system actions (`cmdk`).
- **Notification Engine:** System-wide live alerts and operational audit logs.

---

## 🛠️ Setup & Local Development

### 1. Database Configuration
Initialize the local SQLite database file (`dev.db`) and push the Prisma schema:
```powershell
npx prisma db push
```

### 2. Hydrate Mock Data
Populate the database with enterprise-grade mock seeds (contains pre-configured employees, financial records, inventory items, and purchase orders):
```powershell
npx prisma db seed
```

### 3. Start Development Server
```powershell
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to access the ERP interface.

---

## 📂 Project Architecture

- `/app` — Next.js 16 App Router pages, Server Actions (`/actions`), and Middleware rules.
- `/components` — Reusable glassmorphic UI layout elements, dashboard widgets, charts, and modules.
- `/lib` — Prisma Client configuration (`prisma.ts`), state stores (Zustand), and utility functions.
- `/prisma` — Relational schema modeling and TypeScript seeding logic.
- `/styles` — Global stylesheet configurations (`globals.css`) integrating Tailwind v4.

