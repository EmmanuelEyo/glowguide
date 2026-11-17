'use client';

import { useWidget } from '../../context/WidgetContext';

export function CaptureStepPlaceholder() {
  const { session, prevStep, resetSession } = useWidget();

  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Consent badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luma-subtle border border-luma-border text-[0.625rem] font-medium tracking-[0.08em] uppercase text-luma-secondary mb-4">
        <span className="text-luma-accent" aria-hidden="true">✓</span>
        <span>Consent Verified</span>
      </div>

      <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
        Skin Analysis Capture
      </h3>

      <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6">
        Prepare for your skin snapshot. Position yourself in a well-lit area for optimal guidance.
      </p>

      {/* Simulated camera frame placeholder */}
      <div className="w-full aspect-video rounded-xl bg-luma-page border-2 border-dashed border-luma-border-mid flex flex-col items-center justify-center p-6 mb-6 relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-luma-blush-pale flex items-center justify-center text-xl text-luma-accent mb-2">
          📷
        </div>
        <p className="text-xs font-medium text-luma-ink mb-1">
          Camera Viewfinder Ready
        </p>
        <p className="text-[0.6875rem] text-luma-ghost max-w-[240px]">
          Live camera access and capture controls activate in Feature 5.
        </p>
      </div>

      {/* Preparation checklist */}
      <div className="w-full grid grid-cols-3 gap-2 mb-6 text-left">
        <div className="p-2.5 rounded-lg bg-luma-page border border-luma-border text-center">
          <span className="text-sm block mb-1">☀️</span>
          <span className="text-[0.625rem] font-medium text-luma-ink block">Even Light</span>
        </div>
        <div className="p-2.5 rounded-lg bg-luma-page border border-luma-border text-center">
          <span className="text-sm block mb-1">👤</span>
          <span className="text-[0.625rem] font-medium text-luma-ink block">Face Center</span>
        </div>
        <div className="p-2.5 rounded-lg bg-luma-page border border-luma-border text-center">
          <span className="text-sm block mb-1">✨</span>
          <span className="text-[0.625rem] font-medium text-luma-ink block">Clean Skin</span>
        </div>
      </div>

      {/* Session footer info */}
      <div className="w-full py-2 px-3 rounded bg-luma-subtle/50 text-[0.625rem] text-luma-ghost font-mono mb-6 truncate">
        Session: {session.sessionId}
      </div>

      {/* Navigation actions */}
      <div className="w-full flex items-center gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="h-11 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase hover:bg-luma-subtle transition-colors"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={resetSession}
          className="flex-1 h-11 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
        >
          Restart Session
        </button>
      </div>
    </div>
  );
}
