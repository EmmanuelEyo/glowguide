/**
 * GlowGuide Widget SDK — glowguide-widget.js
 * Prototype demonstration of the embeddable skin-discovery widget.
 *
 * Usage:
 *   GlowGuide.init({ storeId: 'luma-beauty', brandName: 'Luma Beauty', primaryColor: '#A7685E' });
 *   GlowGuide.open();
 *   GlowGuide.on('addToCart', (e) => { console.log(e); });
 */

(function (root) {
  'use strict';

  /* ── Mock data ────────────────────────────────────────────────────────────── */

  const ANALYSIS = {
    scenarioId: 'demo-hydration',
    observations: [
      { label: 'Hydration Level', value: 'Moderate', icon: '💧',
        note: 'Your skin shows signs that could benefit from additional moisture support.' },
      { label: 'Texture', value: 'Smooth', icon: '✨',
        note: 'Surface texture appears even and refined in this illustrative example.' },
      { label: 'Sensitivity', value: 'Low–Moderate', icon: '🌿',
        note: 'Some areas in this sample show mild sensitivity indicators.' },
      { label: 'Brightness', value: 'Moderate', icon: '☀️',
        note: 'This sample result suggests certain areas may respond to brightening support.' },
    ],
  };

  const PRODUCTS = [
    {
      id: 'lumiere-serum',
      name: 'Lumière Hydrating Serum',
      price: 68,
      reason: 'Addresses Hydration',
      gradient: 'linear-gradient(145deg,#F5E6D8,#E0C5A8,#C9A880)',
      emoji: '🫙',
    },
    {
      id: 'velvet-moisturiser',
      name: 'Velvet Repair Moisturiser',
      price: 85,
      reason: 'Supports Skin Barrier',
      gradient: 'linear-gradient(145deg,#EDE8E3,#D4C9BF,#BEB0A5)',
      emoji: '🧴',
    },
    {
      id: 'midnight-oil',
      name: 'Midnight Renewal Face Oil',
      price: 95,
      reason: 'Overnight Recovery',
      gradient: 'linear-gradient(145deg,#2A2420,#4A3832,#6A5448)',
      emoji: '🌙',
    },
  ];

  /* ── Default config ────────────────────────────────────────────────────────── */

  const DEFAULTS = {
    storeId:         'luma-beauty',
    brandName:       'Luma Beauty',
    primaryColor:    '#A7685E',
    theme:           'light',
    mode:            'floating',
    launcherPosition:'bottom-right',
    autoOpen:        false,
  };

  /* ── State ─────────────────────────────────────────────────────────────────── */

  const state = {
    config:    null,
    isOpen:    false,
    step:      null,
    listeners: {},
    els:       {},
  };

  /* ── Helpers ────────────────────────────────────────────────────────────────── */

  function emit(event, payload) {
    const handlers = state.listeners[event] || [];
    handlers.forEach(fn => fn({ type: event, payload, timestamp: new Date().toISOString() }));
    root.dispatchEvent(new CustomEvent('glowguide:' + event, { detail: payload }));
  }

  function on(event, fn) {
    if (!state.listeners[event]) state.listeners[event] = [];
    state.listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!state.listeners[event]) return;
    state.listeners[event] = state.listeners[event].filter(h => h !== fn);
  }

  function setCSSVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function darken(hex, pct) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, (n >> 16) - Math.round(2.55 * pct));
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(2.55 * pct));
    const b = Math.max(0, (n & 0xff) - Math.round(2.55 * pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function showToast(msg) {
    const existing = document.querySelector('.gg-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'gg-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2800);
  }

  /* ── Open / Close ───────────────────────────────────────────────────────────── */

  function open() {
    if (!state.els.panel) return;
    state.isOpen = true;
    state.els.panel.classList.add('open');
    state.els.panel.setAttribute('aria-hidden', 'false');
    if (state.els.backdrop) state.els.backdrop.classList.add('visible');
    if (state.els.launchBtn) state.els.launchBtn.setAttribute('aria-expanded', 'true');
    if (state.step === null) goToStep('welcome');
    emit('widgetOpened', {});
  }

  function close() {
    if (!state.els.panel) return;
    state.isOpen = false;
    state.els.panel.classList.remove('open');
    state.els.panel.setAttribute('aria-hidden', 'true');
    if (state.els.backdrop) state.els.backdrop.classList.remove('visible');
    if (state.els.launchBtn) state.els.launchBtn.setAttribute('aria-expanded', 'false');
    emit('widgetClosed', {});
  }

  function openAtStep(step) {
    state.step = null;
    open();
    goToStep(step);
  }

  /* ── Step navigation ────────────────────────────────────────────────────────── */

  const STEPS = ['welcome', 'consent', 'camera', 'processing', 'report', 'recommendations'];

  function goToStep(step) {
    state.step = step;
    const idx = STEPS.indexOf(step);
    const pct = idx <= 0 ? 0 : Math.round((idx / (STEPS.length - 1)) * 100);

    const fill = state.els.panel.querySelector('.gg-progress-fill');
    if (fill) fill.style.width = pct + '%';

    const body = state.els.panel.querySelector('.gg-body');
    body.innerHTML = '';
    const content = renderStep(step);
    body.appendChild(content);

    emit('stepChanged', { step, stepIndex: idx });
  }

  /* ── Step renderers ─────────────────────────────────────────────────────────── */

  function renderStep(step) {
    const wrap = document.createElement('div');
    wrap.className = 'gg-step';

    switch (step) {

      case 'welcome':
        wrap.innerHTML = `
          <div class="gg-welcome-visual">
            <div class="gg-welcome-art" aria-hidden="true">✦</div>
          </div>
          <div class="gg-step-inner">
            <h2 class="gg-step-title">Your Skin,<br>Understood.</h2>
            <p class="gg-step-desc">Discover skincare tailored to your unique skin profile through our guided analysis experience.</p>
            <ul class="gg-checklist">
              <li>
                <span class="gg-check-icon" aria-hidden="true">✓</span>
                Quick camera capture or image upload
              </li>
              <li>
                <span class="gg-check-icon" aria-hidden="true">✓</span>
                Illustrative skin insights for demonstration
              </li>
              <li>
                <span class="gg-check-icon" aria-hidden="true">✓</span>
                Personalised product matches
              </li>
            </ul>
            <button class="gg-btn gg-btn-primary gg-btn-full" data-next="consent">
              Begin Your Analysis
            </button>
            <button class="gg-btn gg-btn-ghost gg-btn-full" data-close>
              Maybe Later
            </button>
          </div>
        `;
        break;

      case 'consent':
        wrap.innerHTML = `
          <div class="gg-step-inner" style="padding-top:28px">
            <div class="gg-consent-icon" aria-hidden="true">🔒</div>
            <h2 class="gg-step-title" style="font-size:22px">Your Privacy Matters</h2>
            <p class="gg-step-desc" style="font-size:12.5px">Before we continue, please review how your image is handled.</p>
            <ul class="gg-checklist">
              <li><span class="gg-check-icon">✓</span>Images are processed locally in your browser only</li>
              <li><span class="gg-check-icon">✓</span>Nothing is uploaded, stored or transmitted</li>
              <li><span class="gg-check-icon">✓</span>Camera access requires your explicit permission</li>
              <li><span class="gg-check-icon">✓</span>Results are illustrative examples, not medical assessments</li>
            </ul>
            <div class="gg-disclaimer-box">
              <strong>Demo notice:</strong> This is a prototype demonstration. All analysis results are pre-defined sample data, not AI-generated or clinically validated assessments. No medical, dermatological, or diagnostic claims are made.
            </div>
            <button class="gg-btn gg-btn-primary gg-btn-full" data-next="camera" id="consent-agree-btn">
              I Understand and Agree
            </button>
            <button class="gg-btn gg-btn-ghost gg-btn-full" data-close>
              Not Right Now
            </button>
          </div>
        `;
        break;

      case 'camera':
        wrap.innerHTML = `
          <div class="gg-camera-wrap">
            <p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gg-text-muted);font-weight:500">Step 1 — Capture</p>
            <div class="gg-viewfinder" role="img" aria-label="Camera viewfinder - position your face in the frame">
              <div class="gg-viewfinder-inner">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="13" r="5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M6 11a2 2 0 012-2h2l2-3h8l2 3h2a2 2 0 012 2v13a2 2 0 01-2 2H8a2 2 0 01-2-2V11z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
                <span>Position your face here</span>
              </div>
              <div class="gg-vf-corner-bl" aria-hidden="true"></div>
              <div class="gg-vf-corner-br" aria-hidden="true"></div>
            </div>
            <p class="gg-camera-instruction">Ensure good lighting and centre your face in the frame. Glasses are fine.</p>
            <div class="gg-camera-actions">
              <button class="gg-btn gg-btn-primary gg-btn-full" data-next="processing">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="8" cy="8" r="3"/><path d="M13 5.5A1.5 1.5 0 0011.5 4h-1l-.8-1.6H6.3L5.5 4h-1A1.5 1.5 0 003 5.5v7A1.5 1.5 0 004.5 14h7A1.5 1.5 0 0013 12.5v-7z" fill="none" stroke="currentColor" stroke-width="1.2"/>
                </svg>
                Capture Photo
              </button>
              <button class="gg-btn gg-btn-secondary gg-btn-full" data-next="processing">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v8M4 4L7 1l3 3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                Upload an Image
              </button>
            </div>
            <p class="gg-privacy-note">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <path d="M5 1L2 2.5V5c0 2 1.5 3.5 3 4 1.5-.5 3-2 3-4V2.5L5 1z"/>
              </svg>
              Images never leave your device
            </p>
          </div>
        `;
        break;

      case 'processing': {
        wrap.innerHTML = `
          <div class="gg-processing-wrap">
            <div class="gg-pulse" aria-label="Processing" role="status">
              <div class="gg-pulse-ring"></div>
              <div class="gg-pulse-ring"></div>
              <div class="gg-pulse-ring"></div>
              <div class="gg-pulse-core">✦</div>
            </div>
            <h2 class="gg-step-title" style="text-align:center;font-size:22px">Analysing Your Skin</h2>
            <div class="gg-proc-steps" role="status" aria-live="polite">
              <div class="gg-proc-step active">Preparing image analysis...</div>
              <div class="gg-proc-step">Evaluating skin characteristics...</div>
              <div class="gg-proc-step">Matching your skin profile...</div>
              <div class="gg-proc-step">Generating insights...</div>
            </div>
          </div>
        `;
        emit('scanStarted', { sessionId: 'demo-' + Date.now() });
        let idx = 0;
        const steps = wrap.querySelectorAll('.gg-proc-step');
        const iv = setInterval(() => {
          idx++;
          steps.forEach(s => s.classList.remove('active'));
          if (steps[idx]) steps[idx].classList.add('active');
          if (idx >= steps.length - 1) {
            clearInterval(iv);
            setTimeout(() => {
              emit('scanComplete', { sessionId: 'demo-123', result: ANALYSIS });
              goToStep('report');
            }, 700);
          }
        }, 650);
        break;
      }

      case 'report':
        wrap.innerHTML = `
          <div class="gg-report-wrap">
            <div class="gg-report-heading">
              <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--gg-text-muted);font-weight:500">Your Results</span>
              <h2 class="gg-step-title" style="font-size:24px">Skin Insights</h2>
            </div>
            <div class="gg-demo-banner" role="note">
              <strong>Illustrative demo results only.</strong> These observations are pre-defined sample data for demonstration purposes. They are not AI-generated, clinically validated, or medical assessments.
            </div>
            <div class="gg-observations">
              ${ANALYSIS.observations.map(o => `
                <div class="gg-obs">
                  <span class="gg-obs-icon" aria-hidden="true">${o.icon}</span>
                  <div style="flex:1;min-width:0">
                    <div class="gg-obs-label">${o.label}</div>
                    <div class="gg-obs-note">${o.note}</div>
                  </div>
                  <span class="gg-obs-value">${o.value}</span>
                </div>
              `).join('')}
            </div>
            <button class="gg-btn gg-btn-primary gg-btn-full" data-next="recommendations">
              View Recommendations
            </button>
            <button class="gg-btn gg-btn-ghost gg-btn-full" data-next="camera">
              Retake Photo
            </button>
          </div>
        `;
        break;

      case 'recommendations':
        wrap.innerHTML = `
          <div class="gg-reco-wrap">
            <div>
              <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--gg-text-muted);font-weight:500">Based on your profile</span>
              <h2 class="gg-step-title" style="font-size:22px;margin-top:4px">Recommended For You</h2>
            </div>
            <div class="gg-reco-products">
              ${PRODUCTS.map(p => `
                <div class="gg-product-card">
                  <div class="gg-product-img" style="background:${p.gradient}" aria-hidden="true">
                    <span style="font-size:28px">${p.emoji}</span>
                  </div>
                  <div class="gg-product-details">
                    <span class="gg-product-reason">${p.reason}</span>
                    <span class="gg-product-name">${p.name}</span>
                    <span class="gg-product-price">$${p.price}</span>
                    <button class="gg-btn gg-btn-primary gg-btn-sm"
                      data-add-to-cart="${p.id}"
                      data-name="${p.name}"
                      data-price="${p.price}"
                      aria-label="Add ${p.name} to cart">
                      Add to Cart
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="gg-btn gg-btn-ghost gg-btn-full" data-next="report">
              Back to Insights
            </button>
          </div>
        `;
        break;
    }

    /* Bind navigation */
    wrap.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => goToStep(btn.dataset.next));
    });
    wrap.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    /* Bind consent event */
    const agreeBtn = wrap.querySelector('#consent-agree-btn');
    if (agreeBtn) {
      agreeBtn.addEventListener('click', () => {
        emit('consentGiven', { timestamp: new Date().toISOString() });
      });
    }

    /* Bind add to cart */
    wrap.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { addToCart: id, name, price } = btn.dataset;
        emit('addToCart', { productId: id, quantity: 1, productName: name, price: parseFloat(price) });

        btn.textContent = 'Added ✓';
        btn.classList.add('added');
        btn.disabled = true;

        showToast(name + ' added to your cart');
        root.dispatchEvent(new CustomEvent('luma:addToCart', {
          detail: { productId: id, name, price: parseFloat(price), quantity: 1 },
        }));
      });
    });

    return wrap;
  }

  /* ── DOM injection ─────────────────────────────────────────────────────────── */

  function inject() {
    const { brandName, mode, launcherPosition } = state.config;

    /* Backdrop */
    const backdrop = document.createElement('div');
    backdrop.className = 'gg-backdrop';
    backdrop.id = 'gg-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', close);
    document.body.appendChild(backdrop);
    state.els.backdrop = backdrop;

    /* Panel */
    const panel = document.createElement('div');
    panel.className = `gg-panel gg-panel--${launcherPosition}`;
    panel.id = 'gg-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'GlowGuide skin discovery');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="gg-header">
        <div class="gg-brand">
          <span class="gg-logo">✦ GlowGuide</span>
          <span class="gg-store-label">for ${brandName}</span>
        </div>
        <button class="gg-close" aria-label="Close GlowGuide">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="gg-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="gg-progress-fill"></div>
      </div>
      <div class="gg-body" id="gg-body"></div>
      <div class="gg-footer-bar">
        <span class="gg-powered">Powered by GlowGuide</span>
        <span class="gg-demo-tag">✦ Illustrative demo</span>
      </div>
    `;
    document.body.appendChild(panel);
    state.els.panel = panel;
    panel.querySelector('.gg-close').addEventListener('click', close);

    /* Launcher */
    if (mode === 'floating') {
      const launcher = document.createElement('div');
      launcher.className = `gg-launcher gg-launcher--${launcherPosition}`;
      launcher.id = 'gg-launcher';
      launcher.innerHTML = `
        <button class="gg-launch-btn" id="gg-launch-btn" aria-label="Open GlowGuide skin analysis" aria-expanded="false" aria-haspopup="dialog">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3c0 0-4.5 5-4.5 9s2 5.5 4.5 5.5 4.5-1.5 4.5-5.5S12 3 12 3z" stroke="currentColor" stroke-width="1.5" fill="rgba(255,255,255,0.3)"/>
            <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            <path d="M6.5 21c0 0 1.5-2 5.5-2s5.5 2 5.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      document.body.appendChild(launcher);
      state.els.launcher = launcher;
      state.els.launchBtn = launcher.querySelector('#gg-launch-btn');
      state.els.launchBtn.addEventListener('click', () => {
        if (state.isOpen) close(); else open();
      });
    }
  }

  /* ── Init ──────────────────────────────────────────────────────────────────── */

  function init(config) {
    state.config = Object.assign({}, DEFAULTS, config || {});

    /* Apply brand color */
    setCSSVar('--gg-accent',       state.config.primaryColor);
    setCSSVar('--gg-accent-hover', darken(state.config.primaryColor, 15));
    setCSSVar('--gg-accent-light', 'rgba(' + hexToRgb(state.config.primaryColor) + ',0.18)');
    setCSSVar('--gg-accent-lighter','rgba(' + hexToRgb(state.config.primaryColor) + ',0.08)');

    inject();

    if (state.config.autoOpen) open();

    emit('initialized', { config: state.config });
    return api;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#',''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }

  /* ── Public API ────────────────────────────────────────────────────────────── */

  const api = {
    init,
    open,
    close,
    openAtStep,
    goToStep,
    on,
    off,
    getConfig: () => ({ ...state.config }),
    getStep:   () => state.step,
    isOpen:    () => state.isOpen,
    updateConfig(patch) {
      Object.assign(state.config, patch);
      if (patch.primaryColor) {
        setCSSVar('--gg-accent', patch.primaryColor);
        setCSSVar('--gg-accent-hover', darken(patch.primaryColor, 15));
        setCSSVar('--gg-accent-light', 'rgba(' + hexToRgb(patch.primaryColor) + ',0.18)');
        setCSSVar('--gg-accent-lighter','rgba(' + hexToRgb(patch.primaryColor) + ',0.08)');
      }
      if (patch.brandName && state.els.panel) {
        const label = state.els.panel.querySelector('.gg-store-label');
        if (label) label.textContent = 'for ' + patch.brandName;
      }
      emit('configUpdated', state.config);
    },
    destroy() {
      if (state.els.panel)    state.els.panel.remove();
      if (state.els.backdrop) state.els.backdrop.remove();
      if (state.els.launcher) state.els.launcher.remove();
      state.config = null; state.isOpen = false; state.step = null;
      state.els = {}; state.listeners = {};
      emit('destroyed', {});
    },
  };

  root.GlowGuide = api;

})(window);
