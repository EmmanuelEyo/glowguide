'use client';

import { useWidget } from '../../context/WidgetContext';

interface WelcomeStepProps {
  onStart?: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  const { nextStep } = useWidget();

  function handleStart() {
    if (onStart) {
      onStart();
    } else {
      nextStep();
    }
  }

  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Decorative emblem */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-luma-blush to-luma-accent/30 flex items-center justify-center text-2xl text-luma-accent mb-6 shadow-sm">
        ✦
      </div>

      <p className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-2">
        Powered by GlowGuide
      </p>

      <h3 className="font-display text-[1.75rem] sm:text-2xl font-light text-luma-ink leading-tight mb-3">
        Discover Your Skin&apos;s Match
      </h3>

      <p className="text-sm text-luma-secondary leading-relaxed max-w-[340px] mb-8">
        Take a guided 60-second skin analysis to receive curated product recommendations
        crafted for your unique profile.
      </p>

      {/* Feature pillars */}
      <div className="w-full space-y-3 mb-8 text-left">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-luma-accent text-base shrink-0 mt-0.5">✦</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink uppercase tracking-[0.06em]">
              Precision Skin Profile
            </h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Hydration, texture, and sensitivity observations.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-luma-accent text-base shrink-0 mt-0.5">✦</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink uppercase tracking-[0.06em]">
              Targeted Actives
            </h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Products paired by active ingredients and skin goals.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-luma-accent text-base shrink-0 mt-0.5">✦</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink uppercase tracking-[0.06em]">
              Privacy By Design
            </h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Images process locally in-browser and are never uploaded or retained.
            </p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={handleStart}
        className="w-full h-12 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.14em] uppercase transition-colors shadow-sm"
      >
        Begin Skin Analysis
      </button>

      {/* Demo disclaimer */}
      <p className="text-[0.625rem] text-luma-ghost tracking-[0.04em] mt-4">
        Illustrative demonstration results. Not medical diagnosis.
      </p>
    </div>
  );
}
