/**
 * Aura Botanicals - Vanilla Storefront Integration
 * Demonstrates embedding the GlowGuide SDK in a zero-framework vanilla website.
 */

// Host Storefront Product Catalogue
const HOST_PRODUCTS = [
  {
    id: 'prod_rosehip_oil',
    name: 'Rosehip Bio-Regenerate Oil',
    price: 42.0,
    tag: 'Barrier Repair',
    routineStep: 'Treatment',
    image: 'https://images.unsplash.com/photo-1608248597359-009c915f0732?auto=format&fit=crop&w=500&q=80',
    description: 'High-potency organic rosehip fruit and seed extract rich in omegas 3, 6, 7 and 9.',
  },
  {
    id: 'prod_willow_elixir',
    name: 'Willow Bark Blemish Elixir',
    price: 38.0,
    tag: 'Clarifying',
    routineStep: 'Serum',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
    description: 'Natural salicylic acid derived from white willow bark to refine texture and clear congestion.',
  },
  {
    id: 'prod_centella_cream',
    name: 'Centella Barrier Cream',
    price: 46.0,
    tag: 'Soothing',
    routineStep: 'Moisturiser',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
    description: 'Biomimetic ceramides and Centella Asiatica to restore lipid integrity and calm redness.',
  },
  {
    id: 'prod_bakuchiol_serum',
    name: 'Bakuchiol Phyto-Retinol Serum',
    price: 54.0,
    tag: 'Longevity',
    routineStep: 'Night Care',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=500&q=80',
    description: 'Gentle plant-derived cellular renewer that smooths fine lines without sensitizing the skin.',
  },
];

// In-Memory Shopping Cart State
let cart = [
  {
    productId: 'prod_rosehip_oil',
    name: 'Rosehip Bio-Regenerate Oil',
    price: 42.0,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1608248597359-009c915f0732?auto=format&fit=crop&w=500&q=80',
    routineStep: 'Treatment',
    source: 'host',
  },
];

// Telemetry & Event Stream Log
const interceptedEvents = [];

// DOM References
const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-drawer-backdrop');
const btnOpenCart = document.getElementById('btn-open-cart');
const btnCloseCart = document.getElementById('btn-close-cart');
const cartCountBadge = document.getElementById('cart-count-badge');
const cartDrawerCount = document.getElementById('cart-drawer-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const btnCheckout = document.getElementById('btn-checkout');
const btnClearCart = document.getElementById('btn-clear-cart');
const shippingProgressFill = document.getElementById('shipping-progress-fill');
const shippingProgressMsg = document.getElementById('shipping-progress-msg');

const checkoutModal = document.getElementById('checkout-modal');
const checkoutModalBackdrop = document.getElementById('checkout-modal-backdrop');
const btnCloseModal = document.getElementById('btn-close-modal');
const modalItemsSummary = document.getElementById('modal-items-summary');

const inspectorPanel = document.getElementById('inspector-panel');
const btnToggleInspector = document.getElementById('btn-toggle-inspector');
const btnCloseInspector = document.getElementById('btn-close-inspector');
const inspectorEventsCount = document.getElementById('inspector-events-count');
const inspectorEventList = document.getElementById('inspector-event-list');
const btnClearEvents = document.getElementById('btn-clear-inspector-events');
const btnCopySnippet = document.getElementById('btn-copy-snippet');

const btnModeInline = document.getElementById('btn-mode-inline');
const btnModeFloating = document.getElementById('btn-mode-floating');
const inspBtnInline = document.getElementById('insp-btn-inline');
const inspBtnFloating = document.getElementById('insp-btn-floating');

// Active SDK instances
let floatingSdkInstance = null;
let inlineSdkInstance = null;
let currentMode = 'inline';

/**
 * Render host product cards in the catalogue section
 */
function renderProductCatalogue() {
  const grid = document.getElementById('host-products-grid');
  if (!grid) return;

  grid.innerHTML = HOST_PRODUCTS.map(
    (prod) => `
    <article class="product-card" data-product-id="${prod.id}">
      <div class="product-img-wrap">
        <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy" />
        <span class="product-tag">${prod.tag}</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${prod.name}</h3>
        <p class="product-desc">${prod.description}</p>
        <div class="product-bottom-row">
          <span class="product-price">£${prod.price.toFixed(2)}</span>
          <button type="button" class="btn-add-to-bag" data-action="add-host-product" data-product-id="${prod.id}">
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  `,
  ).join('');

  // Attach click listeners to host Add to Bag buttons
  grid.querySelectorAll('[data-action="add-host-product"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const prodId = (e.currentTarget).getAttribute('data-product-id');
      const product = HOST_PRODUCTS.find((p) => p.id === prodId);
      if (product) {
        addItemToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          routineStep: product.routineStep,
          source: 'host',
        });
        openCartDrawer();
      }
    });
  });
}

/**
 * Add an item to the shopping cart
 */
function addItemToCart(item) {
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.unshift({
      ...item,
      quantity: item.quantity || 1,
    });
  }
  updateCartUI();
}

/**
 * Remove an item from the cart
 */
function removeItemFromCart(productId) {
  cart = cart.filter((i) => i.productId !== productId);
  updateCartUI();
}

/**
 * Update cart drawer, subtotal, and badge counts
 */
function updateCartUI() {
  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Update counters
  if (cartCountBadge) cartCountBadge.textContent = String(totalCount);
  if (cartDrawerCount) cartDrawerCount.textContent = String(totalCount);
  if (cartSubtotalEl) cartSubtotalEl.textContent = `£${subtotal.toFixed(2)}`;

  // Shipping progress (free shipping at £60)
  const freeShippingThreshold = 60;
  if (shippingProgressFill && shippingProgressMsg) {
    if (subtotal >= freeShippingThreshold) {
      shippingProgressFill.style.width = '100%';
      shippingProgressMsg.textContent = '🎉 You have unlocked complimentary botanical delivery!';
    } else {
      const remaining = freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      shippingProgressFill.style.width = `${pct}%`;
      shippingProgressMsg.textContent = `Add £${remaining.toFixed(2)} for complimentary botanical delivery`;
    }
  }

  // Checkout button state
  if (btnCheckout) {
    btnCheckout.disabled = cart.length === 0;
  }

  // Render items
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <p class="cart-empty-message">Your shopping bag is empty. Start a skin analysis to get a curated botanical routine.</p>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart.map(
    (item) => `
    <div class="cart-line-item" data-product-id="${item.productId}">
      <img src="${item.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80'}" alt="${item.name}" class="cart-item-thumb" />
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        ${
          item.source === 'glowguide'
            ? `<span class="cart-item-source-badge">✦ GlowGuide Recommendation (${item.routineStep || 'Routine'})</span>`
            : ''
        }
        <div class="cart-item-price">£${item.price.toFixed(2)}</div>
        <div class="cart-item-actions">
          <span class="cart-item-qty">Qty: ${item.quantity}</span>
          <button type="button" class="btn-remove-item" data-action="remove-item" data-product-id="${item.productId}">Remove</button>
        </div>
      </div>
    </div>
  `,
  ).join('');

  // Attach remove listeners
  cartItemsContainer.querySelectorAll('[data-action="remove-item"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const prodId = (e.currentTarget).getAttribute('data-product-id');
      if (prodId) removeItemFromCart(prodId);
    });
  });
}

function openCartDrawer() {
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openInspector() {
  if (inspectorPanel) {
    inspectorPanel.classList.add('open');
  }
}

function closeInspector() {
  if (inspectorPanel) {
    inspectorPanel.classList.remove('open');
  }
}

function openCheckoutModal(title, itemsSummary) {
  if (checkoutModal && checkoutModalBackdrop) {
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle && title) modalTitle.textContent = title;
    if (modalItemsSummary && itemsSummary) modalItemsSummary.innerHTML = itemsSummary;

    checkoutModal.classList.add('open');
    checkoutModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  if (checkoutModal && checkoutModalBackdrop) {
    checkoutModal.classList.remove('open');
    checkoutModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Telemetry log item recorder
 */
function logInterceptedEvent(type, summary, payload) {
  const timestamp = new Date().toISOString();
  const timeFormatted = timestamp.split('T')[1]?.slice(0, 8) || timestamp;

  const eventEntry = {
    id: 'evt_' + Math.random().toString(36).substring(2, 8),
    type,
    summary,
    timestamp: timeFormatted,
    payload,
  };

  interceptedEvents.unshift(eventEntry);

  if (inspectorEventsCount) {
    inspectorEventsCount.textContent = String(interceptedEvents.length);
  }

  renderEventLog();
}

function renderEventLog() {
  if (!inspectorEventList) return;

  if (interceptedEvents.length === 0) {
    inspectorEventList.innerHTML = `
      <p class="empty-feed-text">No events dispatched yet. Interact with the widget to stream typed events.</p>
    `;
    return;
  }

  inspectorEventList.innerHTML = interceptedEvents.slice(0, 30).map(
    (evt) => `
    <div class="feed-event-item" id="${evt.id}">
      <div class="feed-event-header">
        <span class="feed-event-badge">${evt.type}</span>
        <span class="feed-event-time">${evt.timestamp}</span>
      </div>
      <div class="feed-event-summary">${evt.summary}</div>
      <pre class="feed-event-payload">${JSON.stringify(evt.payload, null, 2)}</pre>
    </div>
  `,
  ).join('');
}

/**
 * Handle Add to Cart dispatched from the GlowGuide SDK
 */
function handleSdkAddToCart(event) {
  const product = event.product;
  const itemToAdd = {
    productId: event.productId,
    name: product?.name || event.productId,
    price: product?.price || 45.0,
    quantity: event.quantity || 1,
    image: product?.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
    routineStep: product?.routineStep || 'Recommendation',
    source: 'glowguide',
  };

  addItemToCart(itemToAdd);
  openCartDrawer();
}

/**
 * Handle Checkout Request dispatched from the GlowGuide SDK
 */
function handleSdkCheckoutRequest(event) {
  const ids = event.productIds || [];
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const summaryHtml = `
    <p style="margin-bottom: 0.5rem; font-weight: 600;">Routine Products (${ids.length}):</p>
    <ul style="padding-left: 1.25rem; margin-bottom: 0.75rem;">
      ${cart.map((item) => `<li>${item.name} &times; ${item.quantity} (£${(item.price * item.quantity).toFixed(2)})</li>`).join('')}
    </ul>
    <p style="font-weight: 600; color: #1B382B; border-top: 1px solid #E2E8E4; padding-top: 0.5rem;">
      Simulated Order Total: £${subtotal.toFixed(2)}
    </p>
  `;

  openCheckoutModal('Simulated Checkout Requested', summaryHtml);
}

/**
 * Initialize GlowGuide Browser SDK
 */
function initGlowGuideSDK() {
  if (typeof window.GlowGuide === 'undefined') {
    console.warn('[Aura Botanicals] GlowGuide SDK script is not yet loaded on window.');
    return;
  }

  // 1. Initialize Floating Mode Widget
  floatingSdkInstance = window.GlowGuide.init({
    storeId: 'aura-botanicals',
    brandName: 'Aura Botanicals',
    primaryColor: '#2D6A4F',
    theme: 'light',
    mode: 'floating',
  });

  // 2. Initialize and Mount Inline Mode Widget into #glowguide-inline-container
  inlineSdkInstance = window.GlowGuide.create({
    storeId: 'aura-botanicals',
    brandName: 'Aura Botanicals',
    primaryColor: '#2D6A4F',
    theme: 'light',
    mode: 'inline',
  });
  inlineSdkInstance.mount('#glowguide-inline-container');

  // 3. Register SDK Event Listeners on both instances
  [floatingSdkInstance, inlineSdkInstance].forEach((sdk) => {
    sdk.on('step-change', (evt) => {
      logInterceptedEvent('step-change', `Step: "${evt.previousStep}" -> "${evt.currentStep}"`, evt);
    });

    sdk.on('consent-given', (evt) => {
      logInterceptedEvent('consent-given', 'Biometric consent agreed', evt);
    });

    sdk.on('scan-started', (evt) => {
      logInterceptedEvent('scan-started', 'Diagnostic analysis started', evt);
    });

    sdk.on('scan-complete', (evt) => {
      const scenarioName = evt.result?.scenarioName || 'Diagnostic Report';
      logInterceptedEvent('scan-complete', `Analysis complete: ${scenarioName}`, evt);
    });

    sdk.on('camera-error', (evt) => {
      logInterceptedEvent('camera-error', `Camera error [${evt.code}]: ${evt.message}`, evt);
    });

    sdk.on('add-to-cart', (evt) => {
      handleSdkAddToCart(evt);
      logInterceptedEvent('add-to-cart', `Added "${evt.product?.name || evt.productId}" (qty: ${evt.quantity})`, evt);
    });

    sdk.on('checkout-request', (evt) => {
      handleSdkCheckoutRequest(evt);
      logInterceptedEvent('checkout-request', `Checkout requested for ${evt.productIds?.length || 0} product(s)`, evt);
    });

    sdk.on('opened', (evt) => {
      logInterceptedEvent('opened', 'Floating widget opened', evt);
    });

    sdk.on('closed', (evt) => {
      logInterceptedEvent('closed', 'Floating widget closed', evt);
    });
  });

  // 4. Also register native DOM CustomEvent listeners on window for decoupled demonstration
  window.addEventListener('glowguide:add-to-cart', (e) => {
    console.log('[DOM CustomEvent] glowguide:add-to-cart received by host page:', e.detail);
  });

  window.addEventListener('glowguide:step-change', (e) => {
    console.log('[DOM CustomEvent] glowguide:step-change received by host page:', e.detail);
  });
}

/**
 * Setup UI Event Listeners
 */
function setupUIListeners() {
  // Cart Drawer
  btnOpenCart?.addEventListener('click', openCartDrawer);
  btnCloseCart?.addEventListener('click', closeCartDrawer);
  cartBackdrop?.addEventListener('click', closeCartDrawer);

  btnClearCart?.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  btnCheckout?.addEventListener('click', () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const summaryHtml = `
      <p style="margin-bottom: 0.5rem; font-weight: 600;">Bag Contents (${cart.length} unique items):</p>
      <ul style="padding-left: 1.25rem; margin-bottom: 0.75rem;">
        ${cart.map((item) => `<li>${item.name} &times; ${item.quantity} (£${(item.price * item.quantity).toFixed(2)})</li>`).join('')}
      </ul>
      <p style="font-weight: 600; color: #1B382B; border-top: 1px solid #E2E8E4; padding-top: 0.5rem;">
        Total: £${subtotal.toFixed(2)}
      </p>
    `;
    closeCartDrawer();
    openCheckoutModal('Host Storefront Checkout', summaryHtml);
  });

  // Checkout Modal
  btnCloseModal?.addEventListener('click', closeCheckoutModal);
  checkoutModalBackdrop?.addEventListener('click', closeCheckoutModal);

  // Inspector
  btnToggleInspector?.addEventListener('click', openInspector);
  btnCloseInspector?.addEventListener('click', closeInspector);

  btnClearEvents?.addEventListener('click', () => {
    interceptedEvents.length = 0;
    if (inspectorEventsCount) inspectorEventsCount.textContent = '0';
    renderEventLog();
  });

  btnCopySnippet?.addEventListener('click', async () => {
    const snippet = `<!-- 1. Load GlowGuide SDK -->
<script src="https://cdn.glowguide.io/sdk/v1/glowguide.umd.js"><\/script>

<!-- 2. Initialize with Merchant Branding -->
<script>
  const glowGuide = window.GlowGuide.init({
    storeId: 'aura-botanicals',
    brandName: 'Aura Botanicals',
    primaryColor: '#2D6A4F',
    theme: 'light',
    mode: 'floating'
  });

  // 3. Sync recommendations to host cart
  glowGuide.on('add-to-cart', (evt) => {
    console.log('Added to bag:', evt.productId);
  });
<\/script>`;

    try {
      await navigator.clipboard.writeText(snippet);
      btnCopySnippet.textContent = 'Copied!';
      setTimeout(() => {
        btnCopySnippet.textContent = 'Copy Snippet';
      }, 2000);
    } catch {
      btnCopySnippet.textContent = 'Copied!';
      setTimeout(() => {
        btnCopySnippet.textContent = 'Copy Snippet';
      }, 2000);
    }
  });

  // Mode Switchers
  btnModeInline?.addEventListener('click', () => {
    currentMode = 'inline';
    btnModeInline.classList.add('active');
    btnModeFloating?.classList.remove('active');
    document.getElementById('inspector-mode-status').textContent = 'Inline';
    document.getElementById('discovery-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  btnModeFloating?.addEventListener('click', () => {
    currentMode = 'floating';
    btnModeFloating.classList.add('active');
    btnModeInline?.classList.remove('active');
    document.getElementById('inspector-mode-status').textContent = 'Floating';
    floatingSdkInstance?.open();
  });

  inspBtnInline?.addEventListener('click', () => {
    closeInspector();
    document.getElementById('discovery-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  inspBtnFloating?.addEventListener('click', () => {
    closeInspector();
    floatingSdkInstance?.open();
  });
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  renderProductCatalogue();
  updateCartUI();
  initGlowGuideSDK();
  setupUIListeners();
});
