# Vanilla JS / HTML Integration Guide

This guide walks through embedding GlowGuide into a plain HTML storefront without React or any bundler. The completed example lives in [`examples/vanilla-storefront/`](../../examples/vanilla-storefront/).

## 1. Build the SDK

From the monorepo root:

```bash
pnpm --filter @glowguide/widget-sdk build
```

This writes `packages/widget-sdk/dist/glowguide-sdk.js` (UMD bundle, sets `window.GlowGuide`).

Copy the file to your project's static assets directory, for example `public/glowguide-sdk.js`.

## 2. Load the script

Add a `<script>` tag near the closing `</body>` of your HTML page:

```html
<script src="/glowguide-sdk.js"></script>
```

The UMD bundle attaches the SDK to `window.GlowGuide` automatically.

## 3. Initialise the widget

```html
<script>
  GlowGuide.init({
    storeId: 'my-store',
    brandName: 'My Brand',
    primaryColor: '#c0392b',
    launcherPosition: 'bottom-right',
  });
</script>
```

This creates a floating launcher button in the bottom-right corner. Click it to open the widget.

## 4. Listen for cart events

Wire the SDK's cart events to your own cart logic:

```html
<script>
  GlowGuide.init({
    storeId: 'my-store',
    brandName: 'My Brand',
    onAddToCart: function (event) {
      // event.productId, event.quantity
      myCart.add(event.productId, event.quantity);
      myCart.open();
    },
    onCheckoutRequest: function (event) {
      // event.productIds -- array of product IDs
      event.productIds.forEach(function (id) { myCart.add(id, 1); });
      window.location.href = '/checkout';
    },
  });
</script>
```

Alternatively, listen to the decoupled DOM events instead (useful when you cannot pass callbacks at init time):

```js
window.addEventListener('glowguide:add-to-cart', function (e) {
  myCart.add(e.detail.productId, e.detail.quantity);
});

window.addEventListener('glowguide:checkout-request', function (e) {
  e.detail.productIds.forEach(function (id) { myCart.add(id, 1); });
});
```

## 5. Control the widget programmatically

`GlowGuide.init()` returns a Promise that resolves to the SDK instance:

```js
GlowGuide.init({ storeId: 'my-store' }).then(function (sdk) {
  // Open the widget when a custom button is clicked
  document.getElementById('open-widget-btn').addEventListener('click', function () {
    sdk.open();
  });

  // Clean up when the page unloads
  window.addEventListener('beforeunload', function () {
    sdk.destroy();
  });
});
```

## 6. Inline mode

To embed the widget inside a specific element rather than as a floating overlay:

```html
<div id="glowguide-container" style="width: 400px; height: 600px;"></div>

<script>
  GlowGuide.init({
    storeId: 'my-store',
    mode: 'inline',
    container: '#glowguide-container',
    autoOpen: true,
  });
</script>
```

## Full example

See [`examples/vanilla-storefront/index.html`](../../examples/vanilla-storefront/index.html) for a complete working integration including product cards, a cart drawer, and a "Shop with AI" launcher button.
