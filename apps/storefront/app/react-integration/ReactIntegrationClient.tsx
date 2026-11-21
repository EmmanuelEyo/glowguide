'use client';

import { useState } from 'react';
import {
  useGlowGuideSDK,
  WidgetProvider,
  InlineWidget,
} from '@glowguide/widget-ui';
import type { SessionStepId } from '@glowguide/widget-ui';
import { useCart } from '@/contexts/CartContext';

type RecipeTab = 'app-router' | 'dynamic' | 'hook' | 'inline';

const CODE_RECIPES: Record<
  RecipeTab,
  { title: string; filename: string; description: string; code: string }
> = {
  'app-router': {
    title: 'Next.js App Router (Client Boundary)',
    filename: 'components/StorefrontWidget.tsx',
    description:
      'Recommended for Next.js 14, 15, and 16. Wrap the widget in a client component and import it into your server layout with a Suspense boundary.',
    code: `'use client';

import { GlowGuideWidget } from '@glowguide/widget-ui';
import { useCart } from '@/contexts/CartContext';

export default function StorefrontWidget() {
  const { addItem, openCart } = useCart();

  return (
    <GlowGuideWidget
      config={{
        storeId: 'my-store',
        brandName: 'Luma Beauty',
        primaryColor: '#A7685E',
        theme: 'light',
      }}
      onAddToCart={(event) => {
        addItem(event.productId, event.quantity || 1);
        openCart();
      }}
      onCheckoutRequest={(event) => {
        console.log('Customer requested checkout:', event.productIds);
        openCart();
      }}
    />
  );
}`,
  },
  dynamic: {
    title: 'Next.js Dynamic Client Import (SSR Disabled)',
    filename: 'app/routine-finder/page.tsx',
    description:
      'For complex server pages, import the widget dynamically with ssr: false to guarantee zero client/server hydration overhead.',
    code: `import dynamic from 'next/dynamic';

// Dynamically import the widget with SSR disabled
const GlowGuideWidget = dynamic(
  () => import('@glowguide/widget-ui').then((mod) => mod.GlowGuideWidget),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[460px] h-[520px] rounded-2xl bg-stone-100 animate-pulse flex items-center justify-center text-stone-400 text-xs font-mono">
        Loading Diagnostic Experience...
      </div>
    ),
  }
);

export default function RoutineFinderPage() {
  return (
    <main className="py-16 container mx-auto">
      <h1 className="text-3xl font-light mb-8">Personalized Routine Advisor</h1>
      <GlowGuideWidget mode="inline" />
    </main>
  );
}`,
  },
  hook: {
    title: 'Headless React Hook (useGlowGuideSDK)',
    filename: 'components/CustomDiagnosticCta.tsx',
    description:
      'Use the useGlowGuideSDK hook anywhere in your React tree to read live widget telemetry and trigger open/close/toggle actions from custom merchant UI buttons.',
    code: `'use client';

import { useGlowGuideSDK } from '@glowguide/widget-ui';

export function CustomDiagnosticCta() {
  const { isMounted, isOpen, currentStep, open, close, toggle } = useGlowGuideSDK({
    onAddToCart: (event) => {
      console.log('Added via custom hook listener:', event.productId);
    },
    onStepChange: (event) => {
      console.log('Customer transitioned to step:', event.currentStep);
    },
  });

  if (!isMounted) {
    // Safe SSR fallback placeholder during server render
    return <button disabled className="opacity-50">Analyse Skin</button>;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium uppercase tracking-wider"
      >
        {isOpen ? 'Close Advisor' : \`Start Discovery (\${currentStep})\`}
      </button>

      {isOpen && (
        <span className="text-xs text-emerald-700 font-mono">Active</span>
      )}
    </div>
  );
}`,
  },
  inline: {
    title: 'Embedded Inline Layout Component',
    filename: 'app/inline-demo/page.tsx',
    description:
      'Mount the widget directly within a specific grid section or retail landing page layout with full Shadow DOM style isolation.',
    code: `'use client';

import { WidgetProvider, InlineWidget } from '@glowguide/widget-ui';

export function EmbeddedRoutineSection() {
  return (
    <WidgetProvider
      config={{
        storeId: 'aura-botanicals',
        brandName: 'Aura Botanicals',
        primaryColor: '#2D6A4F',
        mode: 'inline',
        theme: 'light',
      }}
      onAddToCart={(event) => {
        // Direct integration with your host shopping cart
        window.alert(\`Added \${event.product?.name || event.productId} to cart!\`);
      }}
    >
      <section className="py-12 bg-white rounded-2xl border p-8">
        <h2 className="text-2xl font-light text-center mb-6">Interactive Skin Routine</h2>
        <InlineWidget className="max-w-[460px] mx-auto" />
      </section>
    </WidgetProvider>
  );
}`,
  },
};

export function ReactIntegrationClient() {
  const { addItem, openCart } = useCart();
  const [activeTab, setActiveTab] = useState<RecipeTab>('app-router');
  const [copied, setCopied] = useState(false);
  const [showInlineDemo, setShowInlineDemo] = useState(true);

  // Hook instance under test
  const {
    isMounted,
    isOpen,
    currentStep,
    sessionId,
    lastEvent,
    open,
    close,
    toggle,
    setStep,
    reset,
  } = useGlowGuideSDK({
    onAddToCart: (event) => {
      addItem(event.productId, event.quantity || 1);
      openCart();
    },
    onCheckoutRequest: () => {
      openCart();
    },
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps: SessionStepId[] = [
    'welcome',
    'consent',
    'capture',
    'analyzing',
    'report',
  ];

  return (
    <div className="space-y-12">
      {/* Architectural Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-luma-surface border border-luma-border shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-luma-accent/10 border border-luma-accent/30 flex items-center justify-center text-luma-accent text-lg mb-4">
            🛡️
          </div>
          <h3 className="font-display text-lg font-light text-luma-ink mb-2">
            SSR & Hydration Safe
          </h3>
          <p className="text-xs text-luma-secondary leading-relaxed">
            Zero window or document references during server rendering. Deterministic session IDs initialize cleanly post-hydration, completely eliminating Next.js hydration mismatches.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-luma-surface border border-luma-border shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 text-lg mb-4">
            ⚡
          </div>
          <h3 className="font-display text-lg font-light text-luma-ink mb-2">
            Next.js 16 & PPR Ready
          </h3>
          <p className="text-xs text-luma-secondary leading-relaxed">
            Built for React 19, Server Components, and Next.js Partial Prerendering. Works effortlessly with Turbopack and Webpack bundlers without external polyfills.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-luma-surface border border-luma-border shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 text-lg mb-4">
            🧩
          </div>
          <h3 className="font-display text-lg font-light text-luma-ink mb-2">
            Headless Hook Control
          </h3>
          <p className="text-xs text-luma-secondary leading-relaxed">
            The <code className="font-mono text-[0.6875rem] text-luma-ink bg-luma-subtle px-1 py-0.5 rounded">useGlowGuideSDK</code> hook delivers real-time telemetry, step management, and programmatic open/close triggers to any React component.
          </p>
        </div>
      </div>

      {/* Live Interactive React Hook Demonstration */}
      <section className="bg-luma-surface rounded-2xl border border-luma-border p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-luma-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent">
                Live React Demonstration
              </span>
            </div>
            <h2 className="font-display text-2xl font-light text-luma-ink">
              useGlowGuideSDK Hook in Action
            </h2>
            <p className="text-xs text-luma-secondary mt-1">
              Interact with the programmatic controls below to observe real-time state synchronization with the widget.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInlineDemo((prev) => !prev)}
              className="text-xs font-medium text-luma-secondary hover:text-luma-ink border border-luma-border hover:border-luma-accent px-3 py-1.5 rounded-lg transition-colors"
            >
              {showInlineDemo ? 'Hide Inline Widget' : 'Show Inline Widget'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-luma-accent hover:text-luma-accent-dark border border-luma-accent/30 hover:border-luma-accent px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>

        {/* Live Hook State Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-luma-subtle p-3.5 rounded-xl border border-luma-border">
            <span className="block text-[0.625rem] uppercase tracking-wider text-luma-ghost mb-1">
              Hydration Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMounted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold text-luma-ink font-mono">
                {isMounted ? 'Hydrated (Client)' : 'Server Rendering'}
              </span>
            </div>
          </div>

          <div className="bg-luma-subtle p-3.5 rounded-xl border border-luma-border">
            <span className="block text-[0.625rem] uppercase tracking-wider text-luma-ghost mb-1">
              Widget Visibility
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              <span className="text-xs font-semibold text-luma-ink font-mono">
                {isOpen ? 'Open (Active)' : 'Closed'}
              </span>
            </div>
          </div>

          <div className="bg-luma-subtle p-3.5 rounded-xl border border-luma-border">
            <span className="block text-[0.625rem] uppercase tracking-wider text-luma-ghost mb-1">
              Current Step
            </span>
            <span className="text-xs font-semibold text-luma-accent font-mono uppercase">
              {currentStep}
            </span>
          </div>

          <div className="bg-luma-subtle p-3.5 rounded-xl border border-luma-border">
            <span className="block text-[0.625rem] uppercase tracking-wider text-luma-ghost mb-1">
              Session ID
            </span>
            <span className="text-xs font-mono text-luma-ink truncate block">
              {sessionId || 'initializing...'}
            </span>
          </div>
        </div>

        {/* Programmatic Control Buttons */}
        <div className="bg-luma-subtle p-4 rounded-xl border border-luma-border mb-6">
          <span className="block text-[0.6875rem] uppercase tracking-wider text-luma-ghost font-semibold mb-3">
            Programmatic Controls (Called via Hook)
          </span>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={open}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-luma-accent text-luma-inverse hover:bg-luma-accent-dark transition-colors shadow-xs"
            >
              ✦ open()
            </button>

            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-luma-surface border border-luma-border hover:border-luma-accent text-luma-ink transition-colors"
            >
              close()
            </button>

            <button
              type="button"
              onClick={toggle}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-luma-surface border border-luma-border hover:border-luma-accent text-luma-ink transition-colors"
            >
              toggle()
            </button>

            <div className="h-4 w-px bg-luma-border mx-1 hidden sm:block" />

            <span className="text-[0.625rem] uppercase tracking-wider text-luma-secondary mr-1">
              Jump Step:
            </span>

            {steps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setStep(step)}
                className={`px-2 py-1 rounded text-[0.625rem] font-mono capitalize border transition-colors ${
                  currentStep === step
                    ? 'bg-luma-accent/10 border-luma-accent text-luma-accent font-semibold'
                    : 'bg-luma-surface border-luma-border text-luma-secondary hover:bg-luma-subtle'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* Last Intercepted Event Row */}
        {lastEvent && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-6 text-left">
            <div className="flex items-center justify-between text-[0.625rem] mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {lastEvent.name}
                </span>
                <span className="text-emerald-950 font-medium">
                  {lastEvent.summary}
                </span>
              </div>
              <span className="font-mono text-emerald-700">
                {lastEvent.timestamp.split('T')[1]?.slice(0, 8)}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Inline Presentation Demonstration */}
        {showInlineDemo && (
          <div className="mt-6 pt-6 border-t border-luma-border text-center">
            <div className="max-w-md mx-auto">
              <span className="text-[0.6875rem] uppercase tracking-wider text-luma-ghost font-semibold block mb-2">
                Live Inline Component Demonstration
              </span>
              <WidgetProvider
                config={{
                  storeId: 'luma-beauty',
                  brandName: 'Luma Beauty',
                  mode: 'inline',
                  theme: 'light',
                }}
              >
                <div className="p-4 bg-luma-subtle rounded-2xl border border-luma-border shadow-xs">
                  <InlineWidget className="w-full" />
                </div>
              </WidgetProvider>
            </div>
          </div>
        )}
      </section>

      {/* Code Recipes Section */}
      <section className="bg-luma-surface rounded-2xl border border-luma-border p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent block mb-1">
            Integration Recipes
          </span>
          <h2 className="font-display text-2xl font-light text-luma-ink">
            Production-Ready Code Snippets
          </h2>
          <p className="text-xs text-luma-secondary mt-1">
            Select an architectural pattern below to view and copy the integration snippet.
          </p>
        </div>

        {/* Recipe Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-luma-subtle rounded-xl border border-luma-border mb-6">
          {(
            [
              { id: 'app-router', label: 'App Router Boundary' },
              { id: 'dynamic', label: 'Dynamic Import' },
              { id: 'hook', label: 'Headless Hook' },
              { id: 'inline', label: 'Embedded Inline' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-luma-surface text-luma-ink border border-luma-border shadow-xs font-semibold'
                    : 'text-luma-secondary hover:text-luma-ink hover:bg-luma-surface/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Selected Recipe Display */}
        <div className="rounded-xl border border-luma-border overflow-hidden bg-luma-subtle">
          <div className="p-4 bg-luma-surface border-b border-luma-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-luma-ink">
                  {CODE_RECIPES[activeTab].title}
                </span>
                <span className="text-[0.6875rem] font-mono text-luma-ghost bg-luma-subtle px-1.5 py-0.5 rounded border border-luma-border">
                  {CODE_RECIPES[activeTab].filename}
                </span>
              </div>
              <p className="text-[0.6875rem] text-luma-secondary mt-1 leading-normal">
                {CODE_RECIPES[activeTab].description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCode(CODE_RECIPES[activeTab].code)}
              className="text-xs font-mono font-medium text-luma-accent hover:text-luma-accent-dark border border-luma-accent/30 hover:border-luma-accent px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-luma-ink overflow-x-auto leading-relaxed select-all">
            <code>{CODE_RECIPES[activeTab].code}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
