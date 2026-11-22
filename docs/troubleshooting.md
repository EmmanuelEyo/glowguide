# Troubleshooting

## Camera permission denied

**Symptom:** The widget's camera step shows an error or falls back to file upload immediately.

**Causes and fixes:**

1. **User denied the browser permission prompt.** The browser remembers the denial. The user must reset it manually: in Chrome, click the camera icon in the address bar and choose "Allow". In Firefox, click the shield icon.

2. **Page served over HTTP (not HTTPS).** `getUserMedia` is blocked on non-secure origins (except `localhost`). Serve your page over HTTPS.

3. **No camera device attached.** The widget falls back to file upload when no camera is detected. This is expected behaviour.

4. **Listening for the error:**

```ts
sdk.on('camera-error', ({ code, message }) => {
  console.error('Camera error', code, message);
});
```

---

## Widget not mounting / blank launcher

**Symptom:** The floating launcher button does not appear, or `mount()` resolves but nothing is visible.

**Fixes:**

1. **Check the lifecycle state.** Call `sdk.getState()` and confirm `lifecycleState` is `'mounted'`.

2. **`document.body` not ready.** If you call `init()` before `DOMContentLoaded`, the mount target may not exist yet. Wrap your init call:

```js
document.addEventListener('DOMContentLoaded', () => {
  GlowGuide.init({ storeId: 'my-store' });
});
```

3. **Inline mode: container not found.** If `container` is a CSS selector, make sure the element exists in the DOM before `init()` is called.

4. **z-index conflict.** The floating widget uses a high `z-index`. If a host element has `position: fixed` with an even higher `z-index`, the launcher may render behind it. Inspect with browser DevTools.

---

## TypeScript import errors

**Symptom:** `Module '"@glowguide/widget-sdk"' has no exported member 'X'`.

**Fix:** Check the package's `exports` field in `packages/widget-sdk/package.json`. All public types are re-exported from `packages/widget-sdk/src/index.ts`. If you need a type that is missing, import it directly from `@glowguide/widget-ui`:

```ts
import type { AddToCartEvent } from '@glowguide/widget-ui';
```

---

## Shadow DOM style conflicts

**Symptom:** Widget styles look broken, or host-page styles are leaking into the widget (or vice versa).

**Shadow DOM enabled (default):** Host styles cannot reach the widget interior. If you need to style the widget launcher button from outside, target the host element (the wrapper `div` appended to `body`) rather than its shadow contents.

**Shadow DOM disabled (`shadowDom: false`):** Widget CSS is injected into the global document. Host-page resets (`*, box-sizing: border-box`, font rules) will apply to the widget. This may require adjusting your host-page CSS or re-enabling Shadow DOM.

```ts
// Re-enable isolation
GlowGuide.init({ storeId: 'my-store', shadowDom: true });
```

---

## `autoMount: false` for server-side rendering

**Symptom:** Next.js or another SSR framework throws `ReferenceError: window is not defined` on import or during `init()`.

**Fix:** Mark your widget component `'use client'`. If that is not enough (e.g. the module is imported server-side), set `autoMount: false` and defer the actual DOM mount to a client-side `useEffect`:

```tsx
'use client';
import { useEffect } from 'react';
import { createGlowGuide } from '@glowguide/widget-sdk';

export default function Widget() {
  useEffect(() => {
    const sdk = createGlowGuide({ storeId: 'my-store', autoMount: false });
    sdk.init().then(() => sdk.mount());
    return () => sdk.destroy();
  }, []);
  return null;
}
```

---

## "Cannot invoke methods on a destroyed instance"

**Symptom:** `GlowGuide SDK Error: Cannot invoke methods on a destroyed instance.`

**Cause:** `destroy()` was called (or the component unmounted), and code is still holding a reference to the old instance.

**Fix:** Create a new instance. Do not reuse a destroyed SDK instance:

```ts
// Wrong: reusing destroyed instance
sdk.destroy();
sdk.open(); // throws

// Correct: create a new instance
sdk.destroy();
const newSdk = await GlowGuideSDK.init({ storeId: 'my-store' });
newSdk.open();
```

In React, return a cleanup function from `useEffect` and store the SDK in a `ref` that is reset on unmount.

---

## Events not firing

**Symptom:** `onAddToCart` or `sdk.on('add-to-cart', ...)` never runs.

**Checks:**

1. Confirm `lifecycleState` is `'mounted'` before the user interacts.
2. Make sure you are not calling `sdk.destroy()` before the event fires.
3. If you registered the callback in `GlowGuideConfig`, confirm you passed it to the same `init()` call that was actually used (a second `init()` call on the same instance is a no-op and returns `this` without re-applying config).
4. Use the DOM event bridge as a fallback diagnostic:

```js
window.addEventListener('glowguide:add-to-cart', (e) => {
  console.log('DOM event received', e.detail);
});
```
