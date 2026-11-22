# Events

The SDK emits typed events through two channels simultaneously:

1. **`sdk.on(eventName, handler)`** -- subscribe via the instance event emitter
2. **Config callbacks** -- pass `onAddToCart`, `onOpened`, etc. directly in `GlowGuideConfig`

Both channels receive the same payload. Use whichever fits your integration.

```ts
// Channel 1: event emitter
sdk.on('add-to-cart', (event) => { /* ... */ });

// Channel 2: config callback (equivalent)
GlowGuide.init({
  storeId: 'my-store',
  onAddToCart: (event) => { /* ... */ },
});
```

---

## Lifecycle events

### `ready`

Fires when `init()` completes and the SDK is ready to mount.

```ts
interface ReadyEvent {
  instance: GlowGuideInstance;
  timestamp: string; // ISO 8601
}
```

```ts
sdk.on('ready', ({ instance }) => console.log('SDK ready, v' + instance.getState().version));
```

---

### `mounted`

Fires when the widget is inserted into the DOM.

```ts
interface MountedEvent {
  container: HTMLElement;
  mode: 'floating' | 'inline';
  timestamp: string;
}
```

```ts
sdk.on('mounted', ({ mode }) => console.log('Mounted in', mode, 'mode'));
```

---

### `unmounted`

Fires when the widget is removed from the DOM (via `unmount()`).

```ts
interface UnmountedEvent {
  timestamp: string;
}
```

---

### `destroyed`

Fires when `destroy()` is called. This is the final event emitted by the instance.

```ts
interface DestroyedEvent {
  timestamp: string;
}
```

```ts
sdk.on('destroyed', () => console.log('SDK instance cleaned up'));
```

---

### `state-change`

Fires on every lifecycle transition: `uninitialized` -> `ready` -> `mounted`, or any reverse transition.

```ts
interface StateChangeEvent {
  previous: 'uninitialized' | 'ready' | 'mounted' | 'destroyed';
  current: 'uninitialized' | 'ready' | 'mounted' | 'destroyed';
  timestamp?: string;
}
```

```ts
sdk.on('state-change', ({ previous, current }) =>
  console.log(`${previous} -> ${current}`)
);
```

---

## Widget interaction events

### `opened`

Fires when the widget panel opens (either programmatically or by user click).

```ts
interface WidgetOpenedEvent {
  timestamp: string;
}
```

```ts
sdk.on('opened', () => console.log('Widget opened'));
```

---

### `closed`

Fires when the widget panel closes.

```ts
interface WidgetClosedEvent {
  timestamp: string;
}
```

---

### `step-change`

Fires when the user advances to a new step inside the widget.

```ts
interface StepChangeEvent {
  step: SessionStepId; // 'welcome' | 'consent' | 'camera' | 'processing' | 'report' | 'recommendations'
  timestamp: string;
}
```

```ts
sdk.on('step-change', ({ step }) => analytics.track('widget_step', { step }));
```

---

## Session events

### `consent-given`

Fires when the user accepts the data consent screen.

```ts
interface ConsentGivenEvent {
  timestamp: string;
}
```

---

### `scan-started`

Fires when the skin analysis begins processing.

```ts
interface ScanStartedEvent {
  sessionId: string;
}
```

---

### `scan-complete`

Fires when the analysis result is available. The `result` field is mock/illustrative data.

```ts
interface ScanCompleteEvent {
  sessionId: string;
  result: AnalysisResult;
}

interface AnalysisResult {
  scenarioId: string;
  observations: Array<{
    label: string;  // e.g. 'Hydration'
    value: string;  // e.g. 'Moderate'
    note: string;   // illustrative sample text
  }>;
  generatedAt: string; // ISO 8601 (mocked)
}
```

```ts
sdk.on('scan-complete', ({ result }) => {
  console.log('Analysis scenario:', result.scenarioId);
});
```

---

### `camera-error`

Fires when the browser denies camera access or the device is unavailable.

```ts
interface CameraErrorEvent {
  code: string;    // e.g. 'NotAllowedError'
  message: string; // human-readable description
}
```

```ts
sdk.on('camera-error', ({ code }) => {
  if (code === 'NotAllowedError') analytics.track('camera_denied');
});
```

---

## Cart integration events

### `add-to-cart`

Fires when the user taps "Add to cart" on a recommended product inside the widget. Your storefront should handle this event to update its own cart state.

```ts
interface AddToCartEvent {
  productId: string;
  quantity: number;
}
```

```ts
sdk.on('add-to-cart', ({ productId, quantity }) => {
  myCart.add(productId, quantity);
});
```

---

### `checkout-request`

Fires when the user taps "Checkout" from within the widget recommendations screen.

```ts
interface CheckoutRequestEvent {
  productIds: string[];
}
```

```ts
sdk.on('checkout-request', ({ productIds }) => {
  productIds.forEach((id) => myCart.add(id, 1));
  myCart.openCheckout();
});
```
