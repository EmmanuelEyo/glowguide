'use client';

import { useState } from 'react';
import { WidgetProvider, InlineWidget, useWidget } from '@glowguide/widget-ui';
import type { SessionStepId } from '@glowguide/widget-ui';

function SessionInspector() {
  const { session, currentStep, setStep, resetSession } = useWidget();
  const [copied, setCopied] = useState(false);

  const handleCopySessionId = async () => {
    try {
      await navigator.clipboard.writeText(session.sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps: { id: SessionStepId; label: string; number: number }[] = [
    { id: 'welcome', label: 'Welcome', number: 1 },
    { id: 'consent', label: 'Consent', number: 2 },
    { id: 'capture', label: 'Capture', number: 3 },
  ];

  return (
    <div className="flex flex-col bg-luma-surface rounded-2xl border border-luma-border p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-luma-border">
        <div>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent">
            Developer Inspection
          </span>
          <h3 className="font-display text-lg font-light text-luma-ink mt-0.5">
            Session State Engine
          </h3>
        </div>
        <button
          type="button"
          onClick={resetSession}
          className="text-xs font-medium text-luma-accent hover:text-luma-accent-dark border border-luma-accent/30 hover:border-luma-accent px-3 py-1.5 rounded-full transition-colors"
        >
          Reset Session
        </button>
      </div>

      <div className="space-y-4">
        {/* Session ID */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-luma-secondary">Session ID</span>
            <button
              type="button"
              onClick={handleCopySessionId}
              className="text-[0.6875rem] text-luma-accent hover:underline font-mono"
            >
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>
          <div className="font-mono text-xs text-luma-ink bg-luma-subtle px-3 py-2 rounded-lg border border-luma-border break-all select-all">
            {session.sessionId}
          </div>
        </div>

        {/* Current Step */}
        <div>
          <span className="block text-xs text-luma-secondary mb-2">Current Step</span>
          <div className="grid grid-cols-3 gap-2">
            {steps.map((s) => {
              const isActive = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-luma-accent text-luma-inverse border-luma-accent shadow-sm'
                      : 'bg-luma-subtle text-luma-secondary border-luma-border hover:bg-luma-card'
                  }`}
                >
                  <span className="text-[0.625rem] opacity-80 uppercase tracking-wider">
                    Step {s.number}
                  </span>
                  <span className="font-semibold mt-0.5">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Status */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-luma-subtle p-3 rounded-xl border border-luma-border">
            <span className="block text-[0.6875rem] uppercase tracking-wider text-luma-ghost mb-1">
              Consent Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.consentGiven ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold text-luma-ink">
                {session.consentGiven ? 'Agreed' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="bg-luma-subtle p-3 rounded-xl border border-luma-border">
            <span className="block text-[0.6875rem] uppercase tracking-wider text-luma-ghost mb-1">
              Consent Timestamp
            </span>
            <span className="text-xs font-mono text-luma-ink truncate block">
              {session.consentTimestamp
                ? new Date(session.consentTimestamp).toLocaleTimeString()
                : 'None'}
            </span>
          </div>
        </div>

        {/* In-Memory Guarantee */}
        <div className="p-3.5 bg-luma-accent/5 rounded-xl border border-luma-accent/20">
          <div className="flex items-start gap-2.5">
            <span className="text-luma-accent text-sm mt-0.5">🔒</span>
            <div className="text-xs text-luma-secondary leading-relaxed">
              <strong className="text-luma-ink font-medium block mb-0.5">
                Privacy Architecture
              </strong>
              Biometric permissions and session state live strictly in React memory for the active visit. No camera frames or consent markers are written to cookies, local storage, or remote servers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetPreviewClient() {
  return (
    <WidgetProvider
      config={{
        storeId: 'luma-beauty',
        brandName: 'Luma Beauty',
        mode: 'inline',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inline Widget presentation */}
        <div className="lg:col-span-7 flex justify-center">
          <InlineWidget className="w-full max-w-[460px]" />
        </div>

        {/* Developer Session Inspector */}
        <div className="lg:col-span-5">
          <SessionInspector />
        </div>
      </div>
    </WidgetProvider>
  );
}
