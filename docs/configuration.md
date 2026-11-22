# Configuration

Pass a `GlowGuideConfig` object to `GlowGuide.init()` or `createGlowGuide()`.

## `GlowGuideConfig` reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storeId` | `string` | **required** | Unique retailer identifier. Used to scope sessions and events. |
| `mode` | `"floating" \| "inline"` | `"floating"` | Display mode. `floating` renders a fixed launcher button in a corner. `inline` mounts the widget inside a container element. |
| `brandName` | `string` | `undefined` | Merchant display name shown in the widget header. |
| `primaryColor` | `string` | `"#A7685E"` | CSS color value used for buttons, accents, and highlights. Accepts any valid CSS color string (hex, rgb, hsl). |
| `theme` | `"light" \| "dark"` | `"light"` | Widget color scheme. |
| `launcherPosition` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Corner position of the floating launcher button. Only applies when `mode` is `"floating"`. |
| `container` | `HTMLElement \| string \| null` | `undefined` | Mount target for inline mode. Pass a CSS selector string or a direct `HTMLElement` reference. Only applies when `mode` is `"inline"`. |
| `autoOpen` | `boolean` | `false` | Automatically open the widget after mounting. |
| `autoMount` | `boolean` | `true` | Automatically call `mount()` after `init()`. Set to `false` for server-side rendering environments where `window` is not available at init time. |
| `shadowDom` | `boolean` | `true` | Isolate widget CSS inside a Shadow DOM. Disable only if your environment does not support Shadow DOM v1. |
| `products` | `Product[]` | `undefined` | Override the default product catalogue for recommendations. |
| `onReady` | `(event: ReadyEvent) => void` | `undefined` | Fires when the SDK is initialized and ready. |
| `onMounted` | `(event: MountedEvent) => void` | `undefined` | Fires when the widget is mounted into the DOM. |
| `onUnmounted` | `(event: UnmountedEvent) => void` | `undefined` | Fires when the widget is removed from the DOM. |
| `onDestroyed` | `(event: DestroyedEvent) => void` | `undefined` | Fires when the SDK instance is destroyed. |
| `onStateChange` | `(event: StateChangeEvent) => void` | `undefined` | Fires on every lifecycle state transition. |
| `onOpened` | `(event: WidgetOpenedEvent) => void` | `undefined` | Fires when the widget panel opens. |
| `onClosed` | `(event: WidgetClosedEvent) => void` | `undefined` | Fires when the widget panel closes. |
| `onStepChange` | `(event: StepChangeEvent) => void` | `undefined` | Fires when the user navigates to a new step inside the widget. |
| `onConsentGiven` | `(event: ConsentGivenEvent) => void` | `undefined` | Fires when the user accepts the consent screen. |
| `onScanStarted` | `(event: ScanStartedEvent) => void` | `undefined` | Fires when the analysis begins. |
| `onScanComplete` | `(event: ScanCompleteEvent) => void` | `undefined` | Fires when the analysis result is ready. |
| `onCameraError` | `(event: CameraErrorEvent) => void` | `undefined` | Fires when camera access fails. |
| `onAddToCart` | `(event: AddToCartEvent) => void` | `undefined` | Fires when the user adds a recommended product to the cart. |
| `onCheckoutRequest` | `(event: CheckoutRequestEvent) => void` | `undefined` | Fires when the user requests checkout with recommended products. |

## Enums

### `WidgetMode`

```ts
type WidgetMode = 'floating' | 'inline';
```

### `WidgetTheme`

```ts
type WidgetTheme = 'light' | 'dark';
```

### `LauncherPosition`

```ts
type LauncherPosition = 'bottom-right' | 'bottom-left';
```

## `autoMount` and server-side rendering

By default the SDK calls `mount()` immediately after `init()`. In a server-side rendering environment (Next.js App Router, for example) the DOM is not available at module evaluation time. Set `autoMount: false` and call `mount()` manually inside a client-side effect:

```ts
const sdk = createGlowGuide({ storeId: 'my-store', autoMount: false });
await sdk.init();
// later, inside useEffect or a DOMContentLoaded handler:
await sdk.mount();
```

## `shadowDom` and host CSS

Shadow DOM isolation is enabled by default (`shadowDom: true`). The widget renders inside a shadow root so host-page CSS cannot reach its internals and widget CSS cannot bleed outward.

If your host page needs to override widget styles or your environment does not support Shadow DOM, set `shadowDom: false`. Without isolation, the widget inherits host-page font and box-model defaults, which may cause layout differences.
