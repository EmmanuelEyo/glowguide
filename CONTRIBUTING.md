# Contributing

Thank you for your interest in GlowGuide. This is a portfolio engineering project; contributions are welcome for bug fixes and improvements.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| pnpm | 12 or later (`npm install -g pnpm`) |
| Git | Any recent version |

## Local setup

```bash
# 1. Clone the repository
git clone https://github.com/EmmanuelEyo/glowguide.git
cd glowguide

# 2. Install all workspace dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

The storefront is now available at http://localhost:3000.

> **HTTPS note.** Camera capture requires a secure origin. During local development, `localhost` is treated as secure by all major browsers, so camera features work without a certificate.

## Available commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Build storefront | `pnpm build:storefront` |
| Build SDK bundle | `pnpm --filter @glowguide/widget-sdk build` |
| Production server | `pnpm start:storefront` |
| Unit tests | `pnpm test` |
| Unit tests (watch) | `pnpm vitest` |
| Browser (E2E) tests | `pnpm test:e2e` |
| Lint | `pnpm --filter @glowguide/storefront lint` |
| TypeScript check | `pnpm --filter @glowguide/storefront exec tsc --noEmit` |

## Monorepo layout

```
apps/storefront/          Next.js 15 Luma Beauty demo store
packages/widget-ui/       React widget components and hooks
packages/widget-sdk/      Embeddable browser SDK (Vite library build)
examples/vanilla-storefront/  Plain HTML/JS integration example
docs/                     Developer documentation
```

## Branch and commit conventions

- Branch names: `feature/<slug>` or `fix/<slug>`
- Commit messages: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- One logical change per commit
- Run `pnpm test` and `pnpm --filter @glowguide/storefront lint` before pushing

## Blueprint workflow files

The `blueprint/` directory is managed by the Blueprint AI workflow agent and should not be edited manually. Files in `blueprint/` are listed in `.gitignore` and are not tracked in version control.

## Documentation

Developer documentation lives in [`docs/`](./docs/README.md). See [`docs/demo.md`](./docs/demo.md) for a full project walkthrough.
