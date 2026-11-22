# React / Next.js Integration Guide

This guide covers embedding GlowGuide into a React application and specifically a Next.js App Router project. The reference implementation lives in [`apps/storefront/components/widget/StorefrontWidget.tsx`](../../apps/storefront/components/widget/StorefrontWidget.tsx).

## Installation

```bash
pnpm add @glowguide/widget-sdk @glowguide/widget-ui
```

## Option A: `GlowGuideWidget` component

The simplest integration. Import the pre-built React component from `@glowguide/widget-ui` and render it inside a `'use client'` component:

```tsx
'use client';

import { GlowGuideWidget } from '@glowguide/widget-ui';
import type { AddToCartEvent, CheckoutRequestEvent } from '@glowguide/widget-ui';

export default function MyWidget() {
  const handleAddToCart = (event: AddToCartEvent) => {
    // Update your cart state here
    console.log('Add to cart:', event.productId, event.quantity);
  };

  const handleCheckoutRequest = (event: CheckoutRequestEvent) => {
    console.log('Checkout requested for:', event.productIds);
  };

  return (
    <GlowGuideWidget
      config={{
        storeId: 'my-store',
        brandName: 'My Brand',
        primaryColor: '#a7685e',
      }}
      onAddToCart={handleAddToCart}
      onCheckoutRequest={handleCheckoutRequest}
    />
  );
}
```

Render `<MyWidget />` once at the root layout level (e.g. in `app/layout.tsx`):

```tsx
// app/layout.tsx
import MyWidget from '@/components/MyWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <MyWidget />
      </body>
    </html>
  );
}
```

## Option B: `useGlowGuideSDK` hook

Use the hook when you need direct access to the SDK instance for programmatic control, event log inspection, or custom UI:

```tsx
'use client';

import { useGlowGuideSDK } from '@glowguide/widget-sdk';

export default function MyWidget() {
  const { sdk, isReady, eventLog } = useGlowGuideSDK({
    storeId: 'my-store',
    brandName: 'My Brand',
  });

  const handleOpen = () => sdk?.open();
  const handleReset = () => sdk?.reset();

  return (
    <div>
      <button onClick={handleOpen} disabled={!isReady}>
        Open GlowGuide
      </button>
      <button onClick={handleReset} disabled={!isReady}>
        Reset session
      </button>
      <ul>
        {eventLog.map((entry) => (
          <li key={entry.id}>{entry.event}: {JSON.stringify(entry.data)}</li>
        ))}
      </ul>
    </div>
  );
}
```

## SSR safety

GlowGuide uses browser APIs (`window`, `MediaDevices`, Shadow DOM) that are unavailable during server-side rendering. Always mark widget components with `'use client'` and never import them inside server components.

If you need to defer initialisation further (e.g. the SDK is imported at module level), set `autoMount: false` and mount inside `useEffect`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { createGlowGuide } from '@glowguide/widget-sdk';

export default function DeferredWidget() {
  const sdkRef = useRef<Awaited<ReturnType<typeof createGlowGuide>> | null>(null);

  useEffect(() => {
    const sdk = createGlowGuide({ storeId: 'my-store', autoMount: false });
    sdkRef.current = sdk;
    sdk.init().then(() => sdk.mount());

    return () => {
      sdk.destroy();
    };
  }, []);

  return null;
}
```

## Cart integration with React context

The Luma Beauty storefront wires cart events to a React context provider. The pattern:

```tsx
'use client';

import { GlowGuideWidget } from '@glowguide/widget-ui';
import { useCart } from '@/contexts/CartContext'; // your cart context

export default function StorefrontWidget() {
  const { addItem, openCart } = useCart();

  return (
    <GlowGuideWidget
      config={{ storeId: 'luma-beauty', brandName: 'Luma Beauty' }}
      onAddToCart={(event) => {
        addItem(event.productId, event.quantity || 1);
        openCart();
      }}
      onCheckoutRequest={(event) => {
        event.productIds?.forEach((id) => addItem(id, 1));
        openCart();
      }}
    />
  );
}
```

See the full implementation at [`apps/storefront/components/widget/StorefrontWidget.tsx`](../../apps/storefront/components/widget/StorefrontWidget.tsx).

## DOM CustomEvent bridge

The SDK also dispatches DOM `CustomEvent`s on `window` for every cart event. This lets non-React code (or multiple independent components) react to widget events without holding an SDK instance reference:

```ts
useEffect(() => {
  const handler = (e: Event) => {
    const event = (e as CustomEvent).detail;
    addItem(event.productId, event.quantity || 1);
  };
  window.addEventListener('glowguide:add-to-cart', handler);
  return () => window.removeEventListener('glowguide:add-to-cart', handler);
}, [addItem]);
```
