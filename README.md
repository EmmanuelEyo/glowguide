# GlowGuide

Embeddable skin-discovery and product-recommendation widget SDK for beauty ecommerce retailers, demonstrated through the Luma Beauty demo storefront.

GlowGuide lets shoppers follow a guided camera-capture flow, receive illustrative skin-analysis results, and get matched product recommendations -- all inside a floating or inline widget that any retailer can embed with a single script tag or npm package.

> **Portfolio project.** Analysis results are deterministic mock data, clearly labelled as illustrative. No real medical claims, no real payments, no real camera data transmitted.

## Documentation

Full developer documentation lives in [`docs/`](./docs/README.md):

| Page | Contents |
|------|----------|
| [docs/README.md](./docs/README.md) | Overview, quick start, feature highlights |
| [docs/installation.md](./docs/installation.md) | CDN, npm install, browser requirements |
| [docs/configuration.md](./docs/configuration.md) | Full `GlowGuideConfig` reference |
| [docs/api.md](./docs/api.md) | All public SDK methods |
| [docs/events.md](./docs/events.md) | All 13 SDK events with payload types |
| [docs/guides/vanilla-js.md](./docs/guides/vanilla-js.md) | Plain HTML/JS integration walkthrough |
| [docs/guides/react-nextjs.md](./docs/guides/react-nextjs.md) | React / Next.js integration |
| [docs/troubleshooting.md](./docs/troubleshooting.md) | Common problems and fixes |

## Monorepo structure

```
apps/
  storefront/               Next.js 15 Luma Beauty demo store
packages/
  widget-ui/                React widget components and hooks
  widget-sdk/               Embeddable browser SDK (Vite library build)
examples/
  vanilla-storefront/       Plain HTML/JS integration example
docs/                       Developer documentation (Markdown)
```

## Commands

All commands run from the repo root (`d:\glowguide`). Requires Node.js 18+ and pnpm.

| Task | Command |
|------|---------|
| Dev server (storefront) | `pnpm dev` |
| Build storefront | `pnpm build:storefront` |
| Build SDK bundle | `pnpm --filter @glowguide/widget-sdk build` |
| Production server | `pnpm start:storefront` |
| Lint | `pnpm --filter @glowguide/storefront lint` |
| Unit tests | `pnpm test` |
| Tests (watch) | `pnpm vitest` |
| Browser (E2E) tests | `pnpm test:e2e` |

## Quick start

```html
<!-- After building the SDK: pnpm --filter @glowguide/widget-sdk build -->
<script src="packages/widget-sdk/dist/glowguide-sdk.js"></script>
<script>
  GlowGuide.init({
    storeId: 'my-store',
    brandName: 'My Brand',
    onAddToCart: function (event) {
      console.log('Add to cart:', event.productId);
    },
  });
</script>
```

See [docs/guides/vanilla-js.md](./docs/guides/vanilla-js.md) for the full walkthrough.

## Tech stack

- **Next.js 15 (App Router)** -- Luma Beauty storefront
- **React 19 + TypeScript** -- widget UI components
- **Vite (library mode)** -- SDK bundle
- **Tailwind CSS v4** -- styling
- **Shadow DOM** -- CSS isolation
- **Vitest + React Testing Library** -- unit and component tests
- **Playwright** -- end-to-end browser tests
- **pnpm workspaces** -- monorepo
