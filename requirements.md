# Project Requirements

This project is a JavaScript/TypeScript monorepo built with Turborepo, NestJS, and Next.js.

## Required tools

- Node.js 18 or newer
- pnpm 9 or newer
- Git
- A code editor such as Visual Studio Code

## Recommended tools

- npm or Yarn (optional)
- `turbo` CLI (installed automatically by pnpm if needed)

## System requirements

- Windows, macOS, or Linux
- At least 4 GB of RAM for local development
- Ports 3000 and 5173 free for local servers

## Repository expectations

- The repository should be initialized once at the root (`D:\amx-erp`)
- There must not be nested `.git` directories inside subfolders such as `apps/api`
- Use root-level dependencies and workspace package management via `pnpm install`

## Line endings

On Windows, Git may show warnings about LF/CRLF conversion. The safe settings are:

```powershell
git config --global core.autocrlf true
```

Or add a `.gitattributes` file with:

```text
* text=auto
```

Then normalize with:

```powershell
git add --renormalize .
git commit -m "Normalize line endings"
```
