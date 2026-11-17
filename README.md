# GlowGuide

> TODO: Add a one-line description of what GlowGuide does once `blueprint/project-plan.md` is filled in.

## Monorepo structure

```
apps/
  storefront/   Next.js 16 storefront (pnpm filter: @glowguide/storefront)
packages/       Shared packages (empty for now)
```

## Commands

All commands run from the repo root.

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Build storefront | `pnpm build:storefront` |
| Production server | `pnpm start:storefront` |
| Lint | `pnpm --filter @glowguide/storefront lint` |

Requires Node.js and pnpm 12+.
