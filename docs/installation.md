# Installation

## CDN (script tag)

Build the SDK bundle first:

```bash
pnpm --filter @glowguide/widget-sdk build
```

This outputs `packages/widget-sdk/dist/glowguide-sdk.js` (UMD, global `window.GlowGuide`) and `packages/widget-sdk/dist/glowguide-sdk.es.js` (ES module).

Copy the built file to your project's public directory and load it with a script tag:

```html
<script src="/path/to/glowguide-sdk.js"></script>
<script>
  GlowGuide.init({ storeId: 'my-store' });
</script>
```

## npm / pnpm (local package)

The SDK is not yet published to the npm registry. Install it from the local path:

```bash
# pnpm workspace
pnpm add @glowguide/widget-sdk

# or from a local path outside the monorepo
pnpm add /path/to/glowguide/packages/widget-sdk
```

Then import in your JavaScript or TypeScript:

```ts
import GlowGuideSDK, { createGlowGuide } from '@glowguide/widget-sdk';

const sdk = await GlowGuideSDK.init({ storeId: 'my-store' });
```

## React / Next.js

Install both the SDK and the UI package (the UI package provides the React hook and component):

```bash
pnpm add @glowguide/widget-sdk @glowguide/widget-ui
```

See the [React / Next.js guide](../guides/react-nextjs.md) for full setup.

## Build output

| File | Format | Use |
|------|--------|-----|
| `dist/glowguide-sdk.js` | UMD | Script tag, sets `window.GlowGuide` |
| `dist/glowguide-sdk.es.js` | ES module | Bundler / `<script type="module">` |
| `dist/glowguide-sdk.d.ts` | TypeScript types | Auto-resolved by bundlers |

## Browser requirements

| Feature | Minimum |
|---------|---------|
| ES2020 (`?.`, `??`, `async/await`) | Chrome 80, Firefox 74, Safari 13.1, Edge 80 |
| `MediaDevices.getUserMedia` | Required for camera capture |
| Shadow DOM v1 | Required for CSS isolation (`shadowDom: true`) |
| `CustomEvent` | Required for decoupled DOM event bridge |

Camera capture degrades gracefully: if `getUserMedia` is unavailable or denied, the widget falls back to a file-upload prompt. Shadow DOM isolation can be disabled via `shadowDom: false` if the host environment does not support it, though CSS bleed may occur.

> **HTTPS required.** The browser `getUserMedia` API is only available on secure origins. Deploy your storefront over HTTPS or use `localhost` for local development.
