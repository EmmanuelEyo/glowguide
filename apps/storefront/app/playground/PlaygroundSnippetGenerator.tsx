'use client';

import React, { useState } from 'react';
import type { PlaygroundConfig } from './types';
import { BORDER_RADIUS_MAP } from './types';

interface PlaygroundSnippetGeneratorProps {
  config: PlaygroundConfig;
}

type SnippetTab = 'html' | 'esm' | 'react' | 'hook' | 'json';

export function PlaygroundSnippetGenerator({ config }: PlaygroundSnippetGeneratorProps) {
  const [activeTab, setActiveTab] = useState<SnippetTab>('html');
  const [copied, setCopied] = useState(false);

  const radiusPx = BORDER_RADIUS_MAP[config.borderRadius]?.px || '8px';
  const merchantSlug = config.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'merchant-store';

  const snippets: Record<SnippetTab, { title: string; filename: string; language: string; code: string }> = {
    html: {
      title: 'HTML & UMD Script',
      filename: 'index.html',
      language: 'html',
      code: `<!-- 1. GlowGuide Widget Container -->
<div id="glowguide-widget-container"></div>

<!-- 2. Load the GlowGuide UMD SDK from CDN or self-hosted assets -->
<script src="https://cdn.glowguide.dev/v1/glowguide.umd.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', async () => {
    // 3. Initialize GlowGuide with your brand configuration
    const widget = await window.GlowGuide.init({
      storeId: '${merchantSlug}',
      mode: '${config.mode}',
      brandName: '${config.brandName}',
      primaryColor: '${config.primaryColor}',
      theme: '${config.theme}',
      container: '#glowguide-widget-container',
      autoOpen: ${config.mode === 'floating'}
    });

    // 4. Listen for shopper cart actions
    widget.on('add-to-cart', (event) => {
      console.log('Shopper added product to bag:', event.productId, event.quantity);
      // Synchronize with your host storefront cart API here
    });

    // 5. Listen for checkout request
    widget.on('checkout-request', (event) => {
      console.log('Checkout requested for products:', event.productIds);
      // Redirect to host checkout or open checkout drawer
    });
  });
</script>`,
    },
    esm: {
      title: 'JavaScript / TypeScript SDK',
      filename: 'widget-integration.ts',
      language: 'typescript',
      code: `import { GlowGuide } from '@glowguide/widget-sdk';

export async function mountGlowGuideWidget(containerSelector: string) {
  const widget = await GlowGuide.init({
    storeId: '${merchantSlug}',
    mode: '${config.mode}',
    brandName: '${config.brandName}',
    primaryColor: '${config.primaryColor}',
    theme: '${config.theme}',
    container: containerSelector,
    autoOpen: ${config.mode === 'floating'},
  });

  // Lifecycle listeners
  widget.on('opened', () => console.log('Widget opened'));
  widget.on('closed', () => console.log('Widget closed'));
  widget.on('step-change', (e) => console.log('Step navigated:', e.currentStep));

  // Commerce integration
  widget.on('add-to-cart', (e) => {
    console.log('Add to cart received from GlowGuide:', e.productId, e.quantity);
  });

  return widget;
}`,
    },
    react: {
      title: 'React / Next.js Component',
      filename: 'SkinAnalysisSection.tsx',
      language: 'tsx',
      code: `'use client';

import React from 'react';
import { GlowGuideWidget } from '@glowguide/widget-ui';

export function SkinAnalysisSection() {
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <GlowGuideWidget
        mode="${config.mode}"
        config={{
          storeId: '${merchantSlug}',
          brandName: '${config.brandName}',
          primaryColor: '${config.primaryColor}',
          theme: '${config.theme}',
          autoOpen: ${config.mode === 'floating'},
        }}
        onStepChange={(event) => {
          console.log('Widget navigated to step:', event.currentStep);
        }}
        onAddToCart={(event) => {
          console.log('Shopper added product:', event.productId, event.quantity);
        }}
        onCheckoutRequest={(event) => {
          console.log('Direct checkout triggered for items:', event.productIds);
        }}
      />
    </div>
  );
}`,
    },
    hook: {
      title: 'Headless React Hook',
      filename: 'CustomSkinTrigger.tsx',
      language: 'tsx',
      code: `'use client';

import React from 'react';
import { useGlowGuideSDK } from '@glowguide/widget-ui';

export function CustomSkinTrigger() {
  const { isMounted, isReady, isOpen, open, close, toggle, currentStep } = useGlowGuideSDK(
    {
      storeId: '${merchantSlug}',
      mode: '${config.mode}',
      brandName: '${config.brandName}',
      primaryColor: '${config.primaryColor}',
      theme: '${config.theme}',
    },
    {
      onAddToCart: (event) => {
        console.log('Add to cart from hook:', event);
      },
    }
  );

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggle}
        className="px-5 py-2.5 bg-[${config.primaryColor}] text-white text-xs font-semibold uppercase tracking-wider rounded-[${radiusPx}] shadow"
      >
        {isOpen ? 'Close Skin Analysis' : 'Start Skin Consultation'}
      </button>
      <span className="text-xs text-neutral-500 font-mono">
        Active Step: {currentStep}
      </span>
    </div>
  );
}`,
    },
    json: {
      title: 'JSON Configuration',
      filename: 'glowguide.config.json',
      language: 'json',
      code: JSON.stringify(
        {
          schemaVersion: 1,
          storeId: merchantSlug,
          brandName: config.brandName,
          mode: config.mode,
          theme: config.theme,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor,
          borderRadius: radiusPx,
          initialStep: config.initialStep,
          scenarioKey: config.scenarioKey,
          launcherPosition: 'bottom-right',
          autoOpen: config.mode === 'floating',
          simulateHostCart: config.simulateHostCart,
        },
        null,
        2
      ),
    },
  };

  const currentSnippet = snippets[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const tabs: { id: SnippetTab; label: string }[] = [
    { id: 'html', label: 'HTML <script>' },
    { id: 'esm', label: 'JavaScript / ES' },
    { id: 'react', label: 'React Component' },
    { id: 'hook', label: 'useGlowGuideSDK Hook' },
    { id: 'json', label: 'JSON Config' },
  ];

  return (
    <div className="bg-luma-surface border border-luma-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-luma-border bg-luma-subtle/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent">
            Snippet Generator
          </span>
          <h3 className="font-display text-lg font-light text-luma-ink mt-0.5">
            Production Integration Code
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-1.5 text-xs font-semibold rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {copied ? (
            <>
              <span>✓</span> Copied to Clipboard!
            </>
          ) : (
            <>
              <span>📋</span> Copy Code Snippet
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-luma-border bg-luma-surface flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-luma-accent/10 border border-luma-accent text-luma-accent font-semibold'
                  : 'text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        <span className="ml-auto text-[0.6875rem] font-mono text-luma-ghost hidden sm:inline-block">
          {currentSnippet.filename}
        </span>
      </div>

      {/* Code Display */}
      <div className="p-4 bg-zinc-950 overflow-x-auto">
        <pre className="text-zinc-200 text-xs font-mono leading-relaxed selection:bg-luma-accent/40">
          <code>{currentSnippet.code}</code>
        </pre>
      </div>

      {/* Footer Notes */}
      <div className="p-3 bg-luma-subtle/50 border-t border-luma-border text-[0.6875rem] text-luma-secondary flex items-center justify-between">
        <span>
          Snippets dynamically sync with your active configurator parameters.
        </span>
        <span className="font-mono text-luma-ghost">
          {currentSnippet.language}
        </span>
      </div>
    </div>
  );
}
