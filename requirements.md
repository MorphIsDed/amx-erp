# AMX-ERP Project Requirements

This document outlines the technical environment and operational requirements for the AMX-ERP platform.

## 🛠️ Required Toolchain

- **Node.js:** version 18.0.0 or newer (LTS recommended)
- **pnpm:** version 9.0.0 or newer
- **Git:** for version control
- **Terminal:** PowerShell (Windows), zsh/bash (macOS/Linux)

## 💻 System Resources

- **RAM:** Minimum 8 GB (16 GB recommended for smooth monorepo development)
- **CPU:** Quad-core processor or better
- **Storage:** ~1 GB for dependencies and build artifacts
- **Network:** Access to `npm` registry and Google Fonts CDN

## 🌐 Environment Setup

### Ports
The following ports must be available:
- `3000`: Web Frontend (Next.js)
- `3001`: Backend API (NestJS)
- `5173`: Local Dev Sandbox (if applicable)

### Git Configuration
To prevent line-ending issues on Windows:
```powershell
git config --global core.autocrlf true
```

## 🏗️ Repository Architecture

- **Root Access:** Always run `pnpm` commands from `D:\amx-erp`.
- **Dependency Management:** Never use `npm` or `yarn`. Strictly use `pnpm` to maintain workspace integrity.
- **Turbo Caching:** The project uses `turbo` for caching builds. Ensure you have write access to the `.turbo` directory.

## 🎨 Design & Performance Requirements

- **Browser Support:** Modern evergreen browsers (Chrome, Edge, Safari, Firefox).
- **GPU Acceleration:** Required for smooth 60fps animations (Framer Motion).
- **Display:** Recommended 1440p or 1080p for the best spatial UI experience.

## 🔒 Security & Data

- **Auth:** Uses JWT-based authentication.
- **Real-time:** Requires support for Server-Sent Events (SSE).
- **Storage:** Local storage used for session management and theme persistence.
