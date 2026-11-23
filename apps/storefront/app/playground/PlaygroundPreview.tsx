'use client';

import React, { useState } from 'react';
import {
  type PlaygroundConfig,
  type PlaygroundViewport,
  BORDER_RADIUS_MAP,
} from './types';
import {
  WidgetProvider,
  InlineWidget,
  FloatingWidget,
  useWidget,
  generateThemeVariables,
} from '@glowguide/widget-ui';
import type {
  AddToCartEvent,
  CameraErrorEvent,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  ScanCompleteEvent,
  ScanStartedEvent,
  SessionStepId,
  StepChangeEvent,
  WidgetClosedEvent,
  WidgetOpenedEvent,
} from '@glowguide/widget-ui';

interface PlaygroundPreviewProps {
  config: PlaygroundConfig;
  onEvent: (type: string, category: 'lifecycle' | 'journey' | 'cart' | 'errors', badge: string, summary: string, payload: Record<string, unknown>) => void;
  onAddToCart?: (event: AddToCartEvent) => void;
}

function PreviewDiagnostics({
  config,
}: {
  config: PlaygroundConfig;
}) {
  const {
    session,
    currentStep,
    setStep,
    resetSession,
    setCameraState,
    setCameraError,
    clearCameraError,
    startAnalysis,
    recommendations,
    addedProductIds,
    isOpen,
    openWidget,
    closeWidget,
  } = useWidget();

  const handleSimulateCameraDenied = () => {
    setStep('capture');
    setCameraState('denied');
    setCameraError({
      code: 'PERMISSION_DENIED',
      message: 'Camera permission denied by user browser.',
      timestamp: new Date().toISOString(),
    });
  };

  const handleSimulateNoCamera = () => {
    setStep('capture');
    setCameraState('error');
    setCameraError({
      code: 'NO_CAMERA_FOUND',
      message: 'No optical camera device detected on host system.',
      timestamp: new Date().toISOString(),
    });
  };

  const handleSimulateAnalysis = () => {
    setStep('analyzing');
    const override = config.scenarioKey === 'auto' ? undefined : config.scenarioKey;
    startAnalysis(override);
  };

  return (
    <div className="border-t border-luma-border bg-luma-subtle/70 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.6875rem]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-luma-ink uppercase tracking-wider">
            Live Telemetry:
          </span>
          <span className="bg-luma-surface border border-luma-border px-2 py-0.5 rounded font-mono text-luma-secondary">
            Step: <strong className="text-luma-ink">{currentStep}</strong>
          </span>
          <span className="bg-luma-surface border border-luma-border px-2 py-0.5 rounded font-mono text-luma-secondary">
            Session: <strong className="text-luma-ink">{session.sessionId}</strong>
          </span>
          {config.mode === 'floating' && (
            <span className={`px-2 py-0.5 rounded font-mono font-medium ${isOpen
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}>
              {isOpen ? 'Drawer: OPEN' : 'Drawer: CLOSED'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {recommendations.length > 0 && (
            <span className="text-emerald-700 font-mono text-[0.625rem] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {recommendations.length} Recommendations
            </span>
          )}
          {addedProductIds.length > 0 && (
            <span className="text-luma-accent font-mono text-[0.625rem] bg-luma-accent/10 px-2 py-0.5 rounded border border-luma-accent/30 font-semibold">
              {addedProductIds.length} Added to Cart
            </span>
          )}
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-luma-ghost mr-1">
          Diagnostics:
        </span>

        {(['welcome', 'consent', 'capture', 'analyzing', 'report'] as SessionStepId[]).map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => {
              clearCameraError();
              setStep(step);
            }}
            className={`px-2 py-1 text-[0.625rem] rounded font-medium transition-colors border ${currentStep === step
                ? 'bg-luma-accent text-luma-inverse border-luma-accent'
                : 'bg-luma-surface text-luma-secondary hover:text-luma-ink border-luma-border hover:bg-luma-subtle'
              }`}
          >
            {step}
          </button>
        ))}

        <div className="h-4 w-px bg-luma-border mx-1" />

        {/* Error simulators */}
        <button
          type="button"
          onClick={handleSimulateCameraDenied}
          className="px-2 py-1 text-[0.625rem] rounded font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
          title="Simulate permission denied"
        >
          Camera Denied
        </button>

        <button
          type="button"
          onClick={handleSimulateNoCamera}
          className="px-2 py-1 text-[0.625rem] rounded font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          title="Simulate camera not found"
        >
          No Camera
        </button>

        <button
          type="button"
          onClick={handleSimulateAnalysis}
          className="px-2 py-1 text-[0.625rem] rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          title="Trigger analysis flow"
        >
          Run Analysis
        </button>

        {config.mode === 'floating' && (
          <button
            type="button"
            onClick={isOpen ? closeWidget : openWidget}
            className="px-2 py-1 text-[0.625rem] rounded font-medium bg-luma-surface text-luma-ink border border-luma-border hover:bg-luma-subtle transition-colors"
          >
            {isOpen ? 'Close Drawer' : 'Open Drawer'}
          </button>
        )}

        <button
          type="button"
          onClick={resetSession}
          className="ml-auto px-2 py-1 text-[0.625rem] rounded font-medium text-luma-secondary hover:text-luma-ink hover:underline"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
}

export function PlaygroundPreview({
  config,
  onEvent,
  onAddToCart,
}: PlaygroundPreviewProps) {
  const [viewport, setViewport] = useState<PlaygroundViewport>('desktop');

  const themeVariables = generateThemeVariables({
    primaryColor: config.primaryColor,
    theme: config.theme,
  });

  const radiusPx = BORDER_RADIUS_MAP[config.borderRadius]?.px || '8px';

  const handleOpened = (evt: WidgetOpenedEvent) => {
    onEvent('opened', 'lifecycle', 'OPENED', 'Widget drawer or interface opened', evt as unknown as Record<string, unknown>);
  };

  const handleClosed = (evt: WidgetClosedEvent) => {
    onEvent('closed', 'lifecycle', 'CLOSED', 'Widget drawer or interface closed', evt as unknown as Record<string, unknown>);
  };

  const handleStepChange = (evt: StepChangeEvent) => {
    onEvent('step-change', 'journey', 'STEP', `Navigated from ${evt.previousStep} to ${evt.currentStep}`, evt as unknown as Record<string, unknown>);
  };

  const handleConsentGiven = (evt: ConsentGivenEvent) => {
    onEvent('consent-given', 'journey', 'CONSENT', 'User granted optical capture consent', evt as unknown as Record<string, unknown>);
  };

  const handleScanStarted = (evt: ScanStartedEvent) => {
    onEvent('scan-started', 'journey', 'SCAN START', 'Skin assessment started', evt as unknown as Record<string, unknown>);
  };

  const handleScanComplete = (evt: ScanCompleteEvent) => {
    onEvent('scan-complete', 'journey', 'SCAN DONE', `Analysis completed (${evt.result.observations?.length ?? 0} observations)`, evt as unknown as Record<string, unknown>);
  };

  const handleCameraError = (evt: CameraErrorEvent) => {
    onEvent('camera-error', 'errors', 'CAM ERROR', `Camera failure: ${evt.code} - ${evt.message}`, evt as unknown as Record<string, unknown>);
  };

  const handleAddToCart = (evt: AddToCartEvent) => {
    onEvent('add-to-cart', 'cart', 'CART ADD', `Added product ${evt.productId} (qty: ${evt.quantity})`, evt as unknown as Record<string, unknown>);
    if (config.simulateHostCart && onAddToCart) {
      onAddToCart(evt);
    }
  };

  const handleCheckoutRequest = (evt: CheckoutRequestEvent) => {
    onEvent('checkout-request', 'cart', 'CHECKOUT', `Checkout requested for ${evt.productIds.length} items`, evt as unknown as Record<string, unknown>);
  };

  const viewportStyles: Record<PlaygroundViewport, string> = {
    desktop: 'w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[400px]',
  };

  const merchantSlug = config.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'merchant-store';

  return (
    <div className="bg-luma-surface border border-luma-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-luma-subtle px-4 py-2.5 border-b border-luma-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
        </div>

        <div className="flex-1 max-w-md mx-auto bg-luma-surface border border-luma-border px-3 py-1 rounded text-center text-[0.6875rem] font-mono text-luma-secondary truncate">
          <span className="text-emerald-700 mr-1.5">🔒</span>
          https://{merchantSlug}.com/skin-discovery
        </div>

        <div className="flex items-center gap-1 bg-luma-surface p-0.5 rounded-lg border border-luma-border shrink-0">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-2 py-1 rounded text-[0.625rem] font-medium transition-colors ${viewport === 'desktop'
                ? 'bg-luma-accent text-luma-inverse'
                : 'text-luma-secondary hover:text-luma-ink'
              }`}
            title="Desktop View (100%)"
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-2 py-1 rounded text-[0.625rem] font-medium transition-colors ${viewport === 'tablet'
                ? 'bg-luma-accent text-luma-inverse'
                : 'text-luma-secondary hover:text-luma-ink'
              }`}
            title="Tablet View (768px)"
          >
            Tablet
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-2 py-1 rounded text-[0.625rem] font-medium transition-colors ${viewport === 'mobile'
                ? 'bg-luma-accent text-luma-inverse'
                : 'text-luma-secondary hover:text-luma-ink'
              }`}
            title="Mobile View (400px)"
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-[#F4EFEA] flex justify-center items-start min-h-[580px] overflow-x-auto">
        <div
          className={`${viewportStyles[viewport]} mx-auto transition-all duration-300 relative rounded-xl border border-luma-border bg-luma-page shadow-md overflow-hidden`}
          style={{
            ...themeVariables,
            ['--gg-radius' as string]: radiusPx,
          }}
        >
          <div className="px-4 py-3 bg-luma-surface border-b border-luma-border flex items-center justify-between">
            <span className="font-display text-sm font-normal text-luma-ink tracking-wide">
              {config.brandName || 'Merchant Store'}
            </span>
            <div className="flex items-center gap-3 text-[0.6875rem] text-luma-secondary">
              <span>Catalog</span>
              <span>About</span>
              <span className="font-semibold text-luma-ink">Bag (0)</span>
            </div>
          </div>

          <WidgetProvider
            config={{
              mode: config.mode,
              brandName: config.brandName,
              primaryColor: config.primaryColor,
              theme: config.theme,
              autoOpen: config.mode === 'floating',
            }}
            onOpened={handleOpened}
            onClosed={handleClosed}
            onStepChange={handleStepChange}
            onConsentGiven={handleConsentGiven}
            onScanStarted={handleScanStarted}
            onScanComplete={handleScanComplete}
            onCameraError={handleCameraError}
            onAddToCart={handleAddToCart}
            onCheckoutRequest={handleCheckoutRequest}
          >
            {config.mode === 'inline' ? (
              <div className="p-4 md:p-6">
                <div className="mb-4 text-center">
                  <h3 className="font-display text-lg text-luma-ink font-light">
                    Personalized Skincare Consultation
                  </h3>
                  <p className="text-xs text-luma-secondary mt-1 max-w-md mx-auto">
                    Analyze your skin profile in seconds with our integrated intelligence assessment.
                  </p>
                </div>
                <div className="max-w-xl mx-auto">
                  <InlineWidget />
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 min-h-[460px] flex flex-col justify-between relative">
                <div>
                  <span className="text-[0.625rem] uppercase tracking-wider text-luma-ghost font-semibold">
                    Simulated Product Detail Page
                  </span>
                  <h2 className="font-display text-2xl text-luma-ink font-light mt-1">
                    Lumiere Botanical Hydration Complex
                  </h2>
                  <p className="text-xs text-luma-secondary mt-2 max-w-sm">
                    A restorative daily barrier serum infused with botanical extracts and antioxidant peptides.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-base font-semibold text-luma-ink">
                      $68.00
                    </span>
                    <button
                      type="button"
                      className="px-4 py-2 text-xs font-medium bg-luma-canvas text-luma-inverse rounded"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-3 rounded-lg bg-luma-subtle border border-luma-border text-center text-xs text-luma-secondary">
                  Floating launcher widget is mounted in the bottom-right corner below.
                </div>

                <FloatingWidget />
              </div>
            )}

            <PreviewDiagnostics config={config} />
          </WidgetProvider>
        </div>
      </div>
    </div>
  );
}
