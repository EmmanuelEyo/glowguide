# API Reference

All methods below are available on a `GlowGuideInstance` returned by `GlowGuideSDK.init()` or `createGlowGuide()`.

## Static helpers

### `GlowGuideSDK.init(config)`

```ts
static async init(config: GlowGuideConfig): Promise<GlowGuideSDK>
```

Convenience static factory. Creates a new instance, initialises it, and returns the ready instance.

```ts
import GlowGuideSDK from '@glowguide/widget-sdk';
const sdk = await GlowGuideSDK.init({ storeId: 'my-store' });
```

### `createGlowGuide(config?)`

```ts
function createGlowGuide(config?: GlowGuideConfig): GlowGuideSDK
```

Creates an uninitialised instance. Call `sdk.init()` before mounting.

```ts
import { createGlowGuide } from '@glowguide/widget-sdk';
const sdk = createGlowGuide({ storeId: 'my-store' });
await sdk.init();
```

---

## Instance methods

### `init(config?)`

```ts
async init(config?: GlowGuideConfig): Promise<GlowGuideInstance>
```

Validates and applies configuration, generates a session ID, and transitions the lifecycle to `ready`. Calls `mount()` automatically unless `autoMount: false`. Calling `init()` on an already-ready or mounted instance returns `this` with a console warning.

**Throws** if called on a destroyed instance or if no config is available.

```ts
await sdk.init({ storeId: 'my-store', brandName: 'Luma Beauty' });
```

---

### `mount(target?)`

```ts
async mount(target?: HTMLElement | string): Promise<GlowGuideInstance>
```

Renders the widget into the DOM. For floating mode, creates a fixed container appended to `document.body`. For inline mode, renders inside `target` or `config.container`. Returns `this`.

| Param | Description |
|-------|-------------|
| `target` | Optional override mount element or CSS selector. Takes precedence over `config.container`. |

**Throws** if called before `init()` or on a destroyed instance.

```ts
await sdk.mount('#widget-container');
```

---

### `unmount()`

```ts
unmount(): void
```

Removes the widget from the DOM and transitions the lifecycle back to `ready`. The instance can be remounted with `mount()`.

```ts
sdk.unmount();
```

---

### `open()`

```ts
open(): void
```

Opens the widget panel. No-ops if already open.

```ts
sdk.open();
```

---

### `close()`

```ts
close(): void
```

Closes the widget panel. No-ops if already closed.

```ts
sdk.close();
```

---

### `toggle()`

```ts
toggle(): void
```

Opens the widget if closed, closes it if open.

```ts
button.addEventListener('click', () => sdk.toggle());
```

---

### `setStep(step)`

```ts
setStep(step: SessionStepId): void
```

Navigates the widget to a named step. Dispatches a `glowguide:command:set-step` CustomEvent on `window`.

| `SessionStepId` values |
|------------------------|
| `'welcome'`, `'consent'`, `'camera'`, `'processing'`, `'report'`, `'recommendations'` |

```ts
sdk.setStep('recommendations');
```

---

### `reset()`

```ts
reset(): void
```

Resets the widget session back to the welcome step. Dispatches `glowguide:command:reset` on `window`.

```ts
sdk.reset();
```

---

### `destroy()`

```ts
destroy(): void
```

Unmounts the widget, removes all DOM event listeners, emits `destroyed`, and clears the event emitter. The instance cannot be reused after `destroy()`.

```ts
window.addEventListener('beforeunload', () => sdk.destroy());
```

---

### `getState()`

```ts
getState(): SDKState
```

Returns a snapshot of the current SDK state.

```ts
interface SDKState {
  lifecycleState: 'uninitialized' | 'ready' | 'mounted' | 'destroyed';
  isOpen: boolean;
  config: Readonly<GlowGuideConfig>;
  sessionId: string | null;
  mountContainer: HTMLElement | null;
  version: string;
}
```

```ts
const { lifecycleState, isOpen } = sdk.getState();
```

---

### `getConfig()`

```ts
getConfig(): Readonly<GlowGuideConfig>
```

Returns the current resolved configuration. Throws if the SDK has not been initialised.

```ts
const { storeId } = sdk.getConfig();
```

---

### `on(event, handler)`

```ts
on<K extends keyof SDKEventMap>(
  event: K,
  handler: (data: SDKEventMap[K]) => void
): () => void
```

Registers a persistent event listener. Returns an unsubscribe function.

```ts
const off = sdk.on('add-to-cart', ({ productId, quantity }) => {
  cart.add(productId, quantity);
});
// later:
off();
```

---

### `off(event, handler)`

```ts
off<K extends keyof SDKEventMap>(
  event: K,
  handler: (data: SDKEventMap[K]) => void
): void
```

Removes a previously registered handler.

---

### `once(event, handler)`

```ts
once<K extends keyof SDKEventMap>(
  event: K,
  handler: (data: SDKEventMap[K]) => void
): () => void
```

Registers a one-shot listener that fires at most once and then removes itself. Returns an unsubscribe function.

```ts
sdk.once('ready', ({ instance }) => {
  console.log('SDK ready', instance.getState().version);
});
```

---

## Readonly properties

| Property | Type | Description |
|----------|------|-------------|
| `lifecycleState` | `SDKLifecycleState` | Current lifecycle stage. |
| `isOpen` | `boolean` | Whether the widget panel is currently open. |
| `config` | `Readonly<GlowGuideConfig>` | Resolved configuration. |
| `mountContainer` | `HTMLElement \| null` | The DOM element the widget is mounted in, or `null`. |

## `SDK_VERSION`

```ts
import { SDK_VERSION } from '@glowguide/widget-sdk';
console.log(SDK_VERSION); // '0.1.0'
```
