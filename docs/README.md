# GlowGuide SDK Documentation

GlowGuide is an embeddable skin-discovery and product-recommendation widget SDK for beauty ecommerce retailers. Drop it into any storefront with a single script tag or npm package, and your shoppers get a guided camera-capture and personalised product-recommendation experience -- no backend changes required.

## Feature highlights

- **Floating or inline embedding** -- launcher button in a bottom corner or mounted inside any container element
- **Camera capture and upload fallback** -- guided photo flow with graceful degradation
- **Deterministic mock analysis** -- clearly labelled illustrative results, safe for demos and portfolios
- **Product recommendations** -- matches analysis results to your catalogue
- **Cart integration** -- emits typed events your storefront listens to
- **Shadow DOM isolation** -- widget CSS never bleeds into your host page
- **Full TypeScript types** -- zero guesswork on configs, events, and return values

## Quick start

```html
<!-- 1. Load the SDK -->
<script src="dist/glowguide-sdk.js"></script>

<!-- 2. Initialise -->
<script>
  GlowGuide.init({
    storeId: 'my-store',
    brandName: 'My Brand',
  });
</script>
```

That is all you need to get the floating launcher. See [Installation](./installation.md) for the full setup and browser requirements.

## Documentation

| Page | Contents |
|------|----------|
| [Installation](./installation.md) | CDN, npm install, build output, browser requirements |
| [Configuration](./configuration.md) | Full `GlowGuideConfig` reference with defaults |
| [API reference](./api.md) | Every public method on `GlowGuideInstance` |
| [Events](./events.md) | All 13 SDK events with payload types and usage |
| [Vanilla JS guide](./guides/vanilla-js.md) | Step-by-step plain HTML/JS integration |
| [React / Next.js guide](./guides/react-nextjs.md) | React hook and component integration |
| [Troubleshooting](./troubleshooting.md) | Common problems and fixes |

## Monorepo packages

| Package | Description |
|---------|-------------|
| `packages/widget-sdk` | Browser SDK bundle (Vite library mode) |
| `packages/widget-ui` | React widget components and hooks |
| `apps/storefront` | Luma Beauty demo storefront (Next.js) |
| `examples/vanilla-storefront` | Plain HTML/JS integration example |
