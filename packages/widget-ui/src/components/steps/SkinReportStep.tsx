'use client';

import { useWidget } from '../../context/WidgetContext';
import { RecommendedProducts } from '../recommendations/RecommendedProducts';
import type { ObservationLevel } from '../../types/widget';

const SCORE_WIDTH_CLASSES: Record<number, string> = {
  35: 'w-[35%]',
  40: 'w-[40%]',
  45: 'w-[45%]',
  50: 'w-[50%]',
  55: 'w-[55%]',
  60: 'w-[60%]',
  65: 'w-[65%]',
  70: 'w-[70%]',
  75: 'w-[75%]',
  80: 'w-[80%]',
  85: 'w-[85%]',
  90: 'w-[90%]',
  95: 'w-[95%]',
  100: 'w-full',
};

function getScoreWidthClass(score: number): string {
  const clamped = Math.min(100, Math.max(35, Math.round(score / 5) * 5));
  return SCORE_WIDTH_CLASSES[clamped] || 'w-[70%]';
}

function getLevelBadge(level?: ObservationLevel) {
  switch (level) {
    case 'optimal':
      return {
        text: 'Optimal',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bar: 'bg-emerald-500',
      };
    case 'good':
      return {
        text: 'Good',
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        bar: 'bg-teal-500',
      };
    case 'moderate':
      return {
        text: 'Moderate',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        bar: 'bg-amber-500',
      };
    case 'needs-attention':
      return {
        text: 'Needs Care',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        bar: 'bg-rose-500',
      };
    default:
      return {
        text: 'Balanced',
        bg: 'bg-luma-subtle text-luma-secondary border-luma-border',
        bar: 'bg-luma-accent',
      };
  }
}

export function SkinReportStep() {
  const { session, setStep, startAnalysis, resetSession, recommendations } = useWidget();
  const result = session.analysisResult;

  const handleScrollToRecommendations = () => {
    const el = document.getElementById('recommended-routine');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fallback if navigated to report without an active analysis result
  if (!result) {
    return (
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-full bg-luma-subtle border border-luma-border flex items-center justify-center text-2xl text-luma-ghost mb-4">
          ✦
        </div>

        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent mb-1">
          Profile Pending
        </span>

        <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
          No Report Available
        </h3>

        <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6">
          Capture or upload a photo to generate your personalized skin observations.
        </p>

        <button
          type="button"
          onClick={() => setStep('capture')}
          className="h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors"
        >
          Go to Camera Capture
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 sm:p-8 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[0.625rem] font-medium tracking-[0.08em] uppercase mb-3">
          <span aria-hidden="true">✓</span>
          <span>{result.scenarioName || 'Diagnostic Profile'}</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-light text-luma-ink leading-tight mb-2">
          Your Skin Insights
        </h3>

        {result.summary && (
          <p className="text-xs text-luma-secondary leading-relaxed max-w-[340px] mb-3">
            {result.summary}
          </p>
        )}

        {/* Thumbnail and Privacy Tag */}
        <div className="flex items-center gap-3 bg-luma-subtle px-3 py-2 rounded-xl border border-luma-border max-w-[340px] w-full">
          {session.capturedImageUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-luma-border bg-luma-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.capturedImageUrl}
                alt="Analyzed snapshot thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-sm">✦</span>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-luma-ink">
              In-Browser Memory
            </p>
            <p className="text-[0.5625rem] text-luma-ghost truncate">
              Zero frames saved or uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Primary Focus Card */}
      {result.primaryFocus && (
        <div className="p-3.5 rounded-xl bg-luma-accent/10 border border-luma-accent/30 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-luma-accent">✦</span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-luma-accent">
              Primary Skin Focus
            </span>
          </div>
          <p className="text-xs font-medium text-luma-ink leading-snug">
            {result.primaryFocus}
          </p>
        </div>
      )}

      {/* Observation Metric Cards */}
      <div className="space-y-3">
        <span className="block text-[0.6875rem] uppercase tracking-wider text-luma-ghost font-medium">
          Detailed Observations
        </span>

        {result.observations.map((obs) => {
          const badge = getLevelBadge(obs.level);
          const score = obs.score ?? 70;
          return (
            <div
              key={obs.label}
              className="p-3.5 rounded-xl bg-luma-subtle border border-luma-border flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-luma-ink">{obs.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-luma-secondary font-medium">{obs.value}</span>
                  <span
                    className={`text-[0.5625rem] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badge.bg}`}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>

              {/* Visual meter bar */}
              <div
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${obs.label} Score`}
                className="w-full bg-luma-canvas h-1.5 rounded-full overflow-hidden border border-luma-border shadow-inner"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${badge.bar} ${getScoreWidthClass(score)}`}
                />
              </div>

              <p className="text-[0.6875rem] text-luma-secondary leading-relaxed">
                {obs.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recommended Products Section */}
      <RecommendedProducts recommendations={recommendations} />

      {/* Illustrative Simulation Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-left">
        <p className="text-[0.6875rem] text-amber-900 leading-relaxed">
          <strong>Demonstration Notice:</strong> Observations and metric scores are simulated client-side for educational demonstration only. They do not constitute clinical or medical diagnosis.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleScrollToRecommendations}
          className="w-full h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span>✦</span> View Recommended Products
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setStep('capture')}
            className="flex-1 h-10 px-3 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ← Retake Photo
          </button>

          <button
            type="button"
            onClick={() => startAnalysis()}
            className="flex-1 h-10 px-3 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ↻ Re-Analyze
          </button>

          <button
            type="button"
            onClick={resetSession}
            className="h-10 px-3 rounded-[3px] border border-luma-border text-luma-ghost hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
