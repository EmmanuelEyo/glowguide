'use client';

import { useEffect, useState } from 'react';
import { useWidget } from '../../context/WidgetContext';
import { ANALYSIS_PROGRESS_PHASES } from '../../services/skinAnalysis';

export function AnalyzingStep() {
  const { session, startAnalysis, cancelAnalysis, prevStep, setStep } = useWidget();
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Cycle through progress milestone messages while loading
  useEffect(() => {
    if (session.processingStatus !== 'loading') return;

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % ANALYSIS_PROGRESS_PHASES.length);
    }, 800);

    return () => clearInterval(interval);
  }, [session.processingStatus]);

  // If analysis error occurred
  if (session.processingStatus === 'error' || session.analysisError) {
    const error = session.analysisError || {
      code: 'UNKNOWN',
      message: 'Unable to complete skin analysis.',
    };

    return (
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-2xl text-red-600 mb-4">
          ⚠
        </div>

        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-red-700 mb-1">
          Analysis Notice
        </span>

        <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
          Assessment Interrupted
        </h3>

        <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6">
          {error.message}
        </p>

        <div className="w-full max-w-[340px] p-3.5 bg-luma-subtle rounded-xl border border-luma-border text-left mb-6">
          <div className="flex items-center justify-between text-[0.6875rem] text-luma-ghost uppercase tracking-wider mb-1">
            <span>Status Code</span>
            <span className="font-mono text-red-700">{error.code}</span>
          </div>
          <p className="text-xs text-luma-secondary leading-normal">
            Your image remains secure in device memory. You can retry the simulated analysis or choose another photo.
          </p>
        </div>

        <div className="w-full max-w-[340px] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => startAnalysis()}
            className="w-full h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2"
          >
            <span>↻</span> Try Analysis Again
          </button>

          <button
            type="button"
            onClick={() => {
              cancelAnalysis();
              prevStep();
            }}
            className="w-full h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ← Retake or Upload Photo
          </button>
        </div>
      </div>
    );
  }

  // If analysis completed successfully (interim presentation before Feature 8 full report)
  if (session.processingStatus === 'done' && session.analysisResult) {
    const result = session.analysisResult;
    return (
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[0.625rem] font-medium tracking-[0.08em] uppercase mb-4">
          <span aria-hidden="true">✓</span>
          <span>Simulation Complete</span>
        </div>

        <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
          Observations Ready
        </h3>

        <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-5">
          Simulated diagnostic profile derived deterministically for demonstration:
        </p>

        {/* Observations list */}
        <div className="w-full max-w-[340px] flex flex-col gap-2.5 mb-6 text-left">
          {result.observations.map((obs) => (
            <div
              key={obs.label}
              className="p-3 rounded-xl bg-luma-subtle border border-luma-border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-luma-ink">{obs.label}</span>
                <span className="text-[0.6875rem] font-medium text-luma-accent bg-luma-surface px-2 py-0.5 rounded border border-luma-border">
                  {obs.value}
                </span>
              </div>
              <p className="text-[0.6875rem] text-luma-secondary leading-relaxed">
                {obs.note}
              </p>
            </div>
          ))}
        </div>

        {/* Educational disclaimer */}
        <div className="w-full max-w-[340px] p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-left mb-6">
          <p className="text-[0.6875rem] text-amber-900 leading-relaxed">
            <strong>Illustrative Disclaimer:</strong> These metrics are simulated for demonstration and do not constitute medical or dermatological advice.
          </p>
        </div>

        <div className="w-full max-w-[340px] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('capture')}
            className="flex-1 h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ← Retake Photo
          </button>

          <button
            type="button"
            onClick={() => startAnalysis()}
            className="flex-1 h-10 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink hover:bg-luma-subtle text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ↻ Re-Analyze
          </button>
        </div>
      </div>
    );
  }

  // Active Loading Viewfinder State
  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Live progress badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luma-subtle border border-luma-border text-[0.625rem] font-medium tracking-[0.08em] uppercase text-luma-secondary mb-4">
        <span className="w-2 h-2 rounded-full bg-luma-accent animate-ping" aria-hidden="true" />
        <span>Evaluating Profile</span>
      </div>

      <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
        Analyzing Your Skin
      </h3>

      <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6 min-h-[32px] transition-opacity duration-300">
        {ANALYSIS_PROGRESS_PHASES[phaseIndex]}
      </p>

      {/* Visual scanning container with animated radar beam */}
      <div className="w-full max-w-[280px] aspect-[4/3] rounded-2xl bg-luma-canvas border border-luma-border overflow-hidden shadow-inner mb-6 relative">
        {session.capturedImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.capturedImageUrl}
            alt="Skin snapshot being analyzed"
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-luma-ghost text-4xl">
            ✦
          </div>
        )}

        {/* Radar scan grid overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-luma-accent/20 to-transparent animate-pulse pointer-events-none"
          aria-hidden="true"
        />

        {/* Central landmark scanning oval */}
        <div
          className="absolute inset-0 m-auto w-32 h-44 rounded-[50%] border border-luma-accent/60 pointer-events-none flex items-center justify-center animate-pulse"
          aria-hidden="true"
        >
          <div className="w-20 h-28 rounded-[50%] border border-dashed border-luma-accent/40" />
        </div>

        {/* Moving horizontal scanning beam */}
        <div
          className="absolute inset-x-0 h-1 bg-luma-accent shadow-[0_0_12px_rgba(167,104,94,0.8)] animate-bounce top-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* In-Memory guarantee pill */}
      <div className="w-full max-w-[320px] p-2.5 rounded-lg bg-luma-subtle border border-luma-border text-center mb-6">
        <p className="text-[0.625rem] text-luma-secondary uppercase tracking-wider">
          🔒 In-Browser Memory Assessment • No Server Uploads
        </p>
      </div>

      {/* Cancel action */}
      <button
        type="button"
        onClick={cancelAnalysis}
        className="h-10 px-6 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
      >
        Cancel Analysis
      </button>
    </div>
  );
}
