'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import {
  type PlaygroundConfig,
  type PlaygroundEventItem,
  DEFAULT_PLAYGROUND_CONFIG,
} from './types';
import { PlaygroundConfigurator } from './PlaygroundConfigurator';
import { PlaygroundPreview } from './PlaygroundPreview';
import { PlaygroundEventInspector } from './PlaygroundEventInspector';
import { PlaygroundSnippetGenerator } from './PlaygroundSnippetGenerator';
import type { AddToCartEvent } from '@glowguide/widget-ui';

function formatTimestamp(isoString: string): string {
  try {
    const parts = isoString.split('T');
    if (parts[1]) {
      return parts[1].replace('Z', '').slice(0, 8);
    }
    return isoString;
  } catch {
    return isoString;
  }
}

export function PlaygroundClient() {
  const [config, setConfig] = useState<PlaygroundConfig>(DEFAULT_PLAYGROUND_CONFIG);
  const [events, setEvents] = useState<PlaygroundEventItem[]>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<'snippets' | 'events'>('snippets');
  const { addItem, openCart } = useCart();

  const handleEvent = useCallback(
    (
      type: string,
      category: 'lifecycle' | 'journey' | 'cart' | 'errors',
      badge: string,
      summary: string,
      payload: Record<string, unknown>
    ) => {
      const newEvent: PlaygroundEventItem = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        category,
        badge,
        summary,
        timestamp: formatTimestamp(new Date().toISOString()),
        payload,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
    },
    []
  );

  const handleClearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const handleResetConfig = useCallback(() => {
    setConfig(DEFAULT_PLAYGROUND_CONFIG);
  }, []);

  const handleAddToCart = useCallback(
    (evt: AddToCartEvent) => {
      if (evt.productId) {
        addItem(evt.productId, evt.quantity || 1);
        openCart();
      }
    },
    [addItem, openCart]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-luma-border bg-luma-surface shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-luma-ink">
              Live Configurator
            </h4>
          </div>
          <p className="text-xs text-luma-secondary leading-relaxed">
            Customize presentation mode, brand name, primary colors, and corner radius with instantaneous preview updates.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-luma-border bg-luma-surface shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-luma-ink">
              Event Telemetry
            </h4>
          </div>
          <p className="text-xs text-luma-secondary leading-relaxed">
            Real-time event stream monitoring all dispatched CustomEvents across widget lifecycle, journey, and cart interactions.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-luma-border bg-luma-surface shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-luma-accent" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-luma-ink">
              Snippet Exporter
            </h4>
          </div>
          <p className="text-xs text-luma-secondary leading-relaxed">
            Generate ready-to-run copy-paste snippets for HTML/UMD, ES Modules, React Components, and custom hooks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 xl:col-span-4 sticky top-24">
          <PlaygroundConfigurator
            config={config}
            onChange={setConfig}
            onReset={handleResetConfig}
          />

          <div className="mt-4 p-4 rounded-xl border border-luma-border bg-luma-subtle/50 text-xs text-luma-secondary space-y-2">
            <span className="font-semibold text-luma-ink uppercase tracking-wider text-[0.625rem] block">
              Related Developer Guides
            </span>
            <div className="flex flex-col gap-1.5">
              <Link
                href="/react-integration"
                className="text-luma-accent hover:underline flex items-center justify-between"
              >
                <span>React & Next.js Integration Guide</span>
                <span>→</span>
              </Link>
              <Link
                href="/widget-preview"
                className="text-luma-accent hover:underline flex items-center justify-between"
              >
                <span>Full Widget Preview & State Inspector</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          <PlaygroundPreview
            config={config}
            onEvent={handleEvent}
            onAddToCart={handleAddToCart}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-luma-border pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('snippets')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${activeBottomTab === 'snippets'
                      ? 'bg-luma-accent text-luma-inverse'
                      : 'text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle'
                    }`}
                >
                  <span>📋 Integration Snippets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('events')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${activeBottomTab === 'events'
                      ? 'bg-luma-accent text-luma-inverse'
                      : 'text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle'
                    }`}
                >
                  <span>⚡ Event Stream Inspector</span>
                  {events.length > 0 && (
                    <span className={`text-[0.625rem] px-1.5 py-0.2 rounded-full ${activeBottomTab === 'events' ? 'bg-white/20 text-white' : 'bg-luma-accent text-white'
                      }`}>
                      {events.length}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[0.6875rem] font-mono text-luma-ghost hidden sm:inline-block">
                {activeBottomTab === 'snippets' ? 'Live Dynamic Export' : 'CustomEvents Telemetry'}
              </span>
            </div>

            {activeBottomTab === 'snippets' ? (
              <PlaygroundSnippetGenerator config={config} />
            ) : (
              <PlaygroundEventInspector
                events={events}
                onClear={handleClearEvents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
