'use client';

import { useState } from 'react';
import { useWidget } from '../../context/WidgetContext';

export function ConsentStep() {
  const { session, setConsent, nextStep, prevStep } = useWidget();
  const [agreed, setAgreed] = useState(session.consentGiven);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleContinue() {
    if (!agreed) {
      setErrorMessage('Please consent to local image analysis to proceed.');
      return;
    }
    setErrorMessage(null);
    setConsent(true);
    nextStep();
  }

  function handleCheckboxChange(checked: boolean) {
    setAgreed(checked);
    if (checked) {
      setErrorMessage(null);
    }
  }

  return (
    <div className="flex flex-col p-6 sm:p-8">
      {/* Icon emblem */}
      <div className="w-12 h-12 rounded-xl bg-luma-blush-pale border border-luma-blush flex items-center justify-center text-xl text-luma-accent mb-4">
        🔒
      </div>

      <p className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-1">
        Step 2 of 3
      </p>

      <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
        Camera Access &amp; Privacy
      </h3>

      <p className="text-xs text-luma-secondary leading-relaxed mb-6">
        GlowGuide uses a brief camera snapshot to analyse skin characteristics.
        Your privacy is guaranteed through local processing.
      </p>

      {/* Transparency disclosure points */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">🛡️</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink">100% In-Browser Processing</h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Images never leave your device. Analysis algorithms run directly inside your browser.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">🗑️</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink">Zero Image Storage</h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Snapshots are kept in temporary browser memory only and released upon closing.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-luma-page border border-luma-border">
          <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">✦</span>
          <div>
            <h4 className="text-xs font-semibold text-luma-ink">Demonstration Purpose</h4>
            <p className="text-xs text-luma-secondary mt-0.5">
              Insights provide illustrative product pairings, not medical diagnosis.
            </p>
          </div>
        </div>
      </div>

      {/* Consent checkbox */}
      <div className="p-3.5 rounded-lg border border-luma-border-mid bg-luma-surface mb-6">
        <label htmlFor="camera-consent" className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="camera-consent"
            type="checkbox"
            checked={agreed}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-luma-border-strong text-luma-accent accent-luma-accent cursor-pointer"
          />
          <span className="text-xs text-luma-ink leading-snug">
            I agree to temporary in-browser camera analysis for personalised product recommendations.
          </span>
        </label>
      </div>

      {/* Error validation feedback */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-md bg-luma-blush-pale/60 border border-luma-blush text-xs text-luma-accent-dark flex items-center gap-2"
        >
          <span>⚠</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="h-11 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase hover:bg-luma-subtle transition-colors"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 h-11 px-5 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors shadow-sm"
        >
          I Agree &amp; Continue
        </button>
      </div>
    </div>
  );
}
