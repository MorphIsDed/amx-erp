# 🐳 AMX-ERP Docker Infrastructure Guide

Welcome! This guide will help you set up the essential infrastructure (PostgreSQL, Redis, pgAdmin) for the AMX-ERP ecosystem using Docker.

## 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Ensure ports `5432` (Postgres) and `6379` (Redis) are not being used by other local services.

## 2. Quick Start

### Step 1: Initialize Environment
Copy the example environment file:
```powershell
cp .env.example .env
```

### Step 2: Spin Up Infrastructure
Run the following command from the repository root:
```powershell
docker-compose up -d
```
*The `-d` flag runs the containers in the background.*

### Step 3: Verify Containers
```powershell
docker-compose ps
```
You should see `amx-postgres`, `amx-redis`, and `amx-pgadmin` in the "Up" state.

## 3. Database Management

### Initializing the Schema
Once Postgres is running, sync your database schema:
```powershell
pnpm --filter @repo/db db:push
```

### Seeding Data
Populate the database with sample products, warehouses, and an admin user:
```powershell
pnpm --filter @repo/db db:seed
```

### Accessing pgAdmin (GUI)
- **URL:** [http://localhost:5050](http://localhost:5050)
- **Email:** `admin@amx-erp.com`
- **Password:** `admin`

**To connect to Postgres within pgAdmin:**
1. Right-click "Servers" -> "Register" -> "Server..."
2. **Name:** `AMX-Local`
3. **Connection Tab:**
   - **Hostname:** `postgres` (or `localhost` if connecting from outside Docker)
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `postgres`

## 4. Stopping the Infrastructure
To stop and remove containers:
```powershell
docker-compose down
```
*Note: Your data is persisted in Docker volumes and will be available when you restart.*

---

## Troubleshooting
- **Port Conflict:** If you get a "Bind for 0.0.0.0:5432 failed" error, stop any local PostgreSQL server running on your machine.
- **Connection Refused:** Ensure the containers are fully started before running `pnpm` commands.
