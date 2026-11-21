'use client';

import React, { useState } from 'react';
import type { PlaygroundEventCategory, PlaygroundEventItem } from './types';

interface PlaygroundEventInspectorProps {
  events: PlaygroundEventItem[];
  onClear: () => void;
}

export function PlaygroundEventInspector({
  events,
  onClear,
}: PlaygroundEventInspectorProps) {
  const [activeCategory, setActiveCategory] = useState<PlaygroundEventCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const filteredEvents = events.filter((evt) => {
    if (activeCategory === 'all') return true;
    return evt.category === activeCategory;
  });

  const handleCopyPayload = async (id: string, payload: Record<string, unknown>) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write failure in restricted environments
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const categories: { id: PlaygroundEventCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: events.length },
    { id: 'lifecycle', label: 'Lifecycle', count: events.filter((e) => e.category === 'lifecycle').length },
    { id: 'journey', label: 'Journey', count: events.filter((e) => e.category === 'journey').length },
    { id: 'cart', label: 'Cart', count: events.filter((e) => e.category === 'cart').length },
    { id: 'errors', label: 'Errors', count: events.filter((e) => e.category === 'errors').length },
  ];

  return (
    <div className="bg-luma-surface border border-luma-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Inspector Header */}
      <div className="p-4 border-b border-luma-border bg-luma-subtle/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent">
            Real-Time Telemetry
          </span>
          <h3 className="font-display text-lg font-light text-luma-ink mt-0.5">
            Event Stream Inspector
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-2.5 py-1 text-xs font-medium rounded border border-luma-border bg-luma-surface hover:bg-luma-subtle text-luma-ink transition-colors"
            >
              {copiedAll ? '✓ Copied All JSON' : 'Export All Events'}
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            disabled={events.length === 0}
            className="px-2.5 py-1 text-xs font-medium rounded border border-luma-border text-luma-secondary hover:text-luma-ink disabled:opacity-40 transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-luma-border bg-luma-surface flex items-center gap-1.5 overflow-x-auto">
        {categories.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-luma-accent text-luma-inverse font-semibold'
                  : 'bg-luma-subtle text-luma-secondary hover:text-luma-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[0.625rem] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-luma-border text-luma-ghost'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Event Stream Log List */}
      <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto font-sans">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-luma-secondary">
              No events recorded in this category.
            </p>
            <p className="text-xs text-luma-ghost mt-1 max-w-sm mx-auto">
              Interact with the widget preview above or click diagnostics buttons to trigger live GlowGuide CustomEvents.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isExpanded = expandedId === evt.id;
            const isCopied = copiedId === evt.id;

            return (
              <div
                key={evt.id}
                className="p-3 rounded-lg border border-luma-border bg-luma-surface hover:border-luma-accent/30 transition-colors text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[0.625rem] font-mono font-semibold tracking-wider uppercase ${
                      evt.category === 'errors'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : evt.category === 'cart'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : evt.category === 'journey'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}>
                      {evt.badge}
                    </span>
                    <span className="font-mono font-medium text-luma-ink">
                      glowguide:{evt.type}
                    </span>
                  </div>

                  <span className="font-mono text-[0.6875rem] text-luma-ghost">
                    {evt.timestamp}
                  </span>
                </div>

                <p className="text-luma-secondary text-xs mt-1.5">
                  {evt.summary}
                </p>

                <div className="mt-2 pt-2 border-t border-luma-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                    className="text-[0.6875rem] text-luma-accent hover:text-luma-accent-dark font-medium underline"
                  >
                    {isExpanded ? 'Hide Payload' : 'View Payload Details'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyPayload(evt.id, evt.payload)}
                    className="text-[0.6875rem] text-luma-secondary hover:text-luma-ink font-mono"
                  >
                    {isCopied ? '✓ Copied' : 'Copy JSON'}
                  </button>
                </div>

                {isExpanded && (
                  <pre className="mt-2 p-2.5 rounded bg-zinc-900 text-zinc-100 text-[0.6875rem] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
