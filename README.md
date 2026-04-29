# AMX ERP Monorepo

This repository is a Turborepo-based monorepo containing a NestJS API and a Next.js web app.

## Project structure

- `apps/api` — NestJS backend API
- `apps/web` — Next.js frontend app
- `packages/eslint-config` — shared ESLint configs
- `packages/typescript-config` — shared TypeScript configs
- `packages/ui` — shared UI components

## Requirements

See `requirements.md` for the required tools, environment, and repository setup guidance.

## Getting started

1. Install dependencies from the repository root:

```powershell
pnpm install
```

2. Start both apps in development mode from the root:

```powershell
pnpm dev
```

3. Open the application in your browser:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3000` if the API is started separately, but note the API does not expose a frontend homepage by default.

## Run a single app

### Start the API only

```powershell
cd apps/api
pnpm run start:dev
```

### Start the web app only

```powershell
cd apps/web
pnpm run dev
```

## Build

From the root:

```powershell
pnpm build
```

## Commit and Git guidance

- Open the repo at the root folder: `D:\amx-erp`
- Do not keep nested `.git` folders inside subprojects such as `apps/api`
- If you see line-ending warnings, configure Git with `core.autocrlf` or add `.gitattributes`

## Notes

- `apps/api` is a backend service and does not necessarily render a homepage at `/`
- `apps/web` is the frontend app and is the main browser entrypoint
- If you want the repo to be clean, make sure there are no nested Git repositories in subfolders

pnpm dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
