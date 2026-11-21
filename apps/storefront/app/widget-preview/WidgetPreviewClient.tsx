'use client';

import { useState } from 'react';
import {
  WidgetProvider,
  InlineWidget,
  useWidget,
  SCENARIO_KEYS,
  MOCK_SCENARIOS,
} from '@glowguide/widget-ui';
import type {
  AddToCartEvent,
  CheckoutRequestEvent,
  SessionStepId,
} from '@glowguide/widget-ui';
import { useCart } from '@/contexts/CartContext';

interface CartLogEntry {
  id: string;
  type: 'add-to-cart' | 'checkout-request';
  summary: string;
  timestamp: string;
}

const COLOR_PRESETS = [
  { name: 'Terracotta (Luma)', hex: '#A7685E', bgClass: 'bg-[#A7685E]' },
  { name: 'Forest Sage', hex: '#2D6A4F', bgClass: 'bg-[#2D6A4F]' },
  { name: 'Royal Indigo', hex: '#2563EB', bgClass: 'bg-[#2563EB]' },
  { name: 'Berry Plum', hex: '#831843', bgClass: 'bg-[#831843]' },
  { name: 'Obsidian Noir', hex: '#1E293B', bgClass: 'bg-[#1E293B]' },
];

interface SessionInspectorProps {
  cartEvents: CartLogEntry[];
  onClearEvents: () => void;
  brandName: string;
  onBrandNameChange: (val: string) => void;
  primaryColor: string;
  onPrimaryColorChange: (val: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (val: 'light' | 'dark') => void;
}

function SessionInspector({
  cartEvents,
  onClearEvents,
  brandName,
  onBrandNameChange,
  primaryColor,
  onPrimaryColorChange,
  theme,
  onThemeChange,
}: SessionInspectorProps) {
  const {
    session,
    currentStep,
    setStep,
    resetSession,
    setCameraState,
    setCameraError,
    clearCameraError,
    startAnalysis,
    cancelAnalysis,
    resetAnalysis,
    recommendations,
    addedProductIds,
    cartInteraction,
  } = useWidget();
  const { itemCount, subtotal, openCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('auto');

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
    { id: 'analyzing', label: 'Scanning', number: 3 },
    { id: 'report', label: 'Report', number: 4 },
  ];

  const handleSimulateCameraError = (
    code: 'PERMISSION_DENIED' | 'CAMERA_IN_USE' | 'NO_CAMERA_FOUND' | 'DISCONNECTED',
    message: string,
  ) => {
    setStep('capture');
    setCameraState(code === 'PERMISSION_DENIED' ? 'denied' : 'error');
    setCameraError({ code, message });
  };

  const handleClearCameraError = () => {
    clearCameraError();
    setCameraState('idle');
  };

  const handleTriggerAnalysis = () => {
    const override = selectedScenario === 'auto' ? undefined : selectedScenario;
    startAnalysis(override);
  };

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
        {/* Merchant Branding & Theming Controls */}
        <div className="bg-luma-subtle p-3.5 rounded-xl border border-luma-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] uppercase tracking-wider text-luma-ghost font-semibold">
              Merchant Branding & Theming
            </span>
            <span className="text-[0.625rem] px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Shadow DOM Isolated
            </span>
          </div>

          {/* Brand Name Input */}
          <div>
            <label
              htmlFor="brand-name-input"
              className="block text-[0.625rem] uppercase tracking-wider text-luma-secondary mb-1"
            >
              Merchant Brand Name
            </label>
            <input
              id="brand-name-input"
              type="text"
              value={brandName}
              onChange={(e) => onBrandNameChange(e.target.value)}
              placeholder="e.g. Luma Beauty, Aura Botanicals"
              className="w-full text-xs bg-luma-surface border border-luma-border rounded-lg px-2.5 py-1.5 text-luma-ink focus:outline-none focus:ring-1 focus:ring-luma-accent"
            />
          </div>

          {/* Theme Mode Toggle */}
          <div>
            <span className="block text-[0.625rem] uppercase tracking-wider text-luma-secondary mb-1.5">
              Theme Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  theme === 'light'
                    ? 'bg-luma-surface text-luma-ink border-luma-accent shadow-xs'
                    : 'bg-luma-surface/50 text-luma-muted border-luma-border hover:bg-luma-surface'
                }`}
              >
                <span>☀️</span>
                <span>Light Theme</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  theme === 'dark'
                    ? 'bg-stone-900 text-stone-100 border-luma-accent shadow-xs'
                    : 'bg-luma-surface/50 text-luma-muted border-luma-border hover:bg-luma-surface'
                }`}
              >
                <span>🌙</span>
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Primary Accent Color */}
          <div>
            <div className="flex items-center justify-between text-[0.625rem] uppercase tracking-wider text-luma-secondary mb-1.5">
              <span>Primary Accent Color</span>
              <span className="font-mono text-luma-ghost lowercase">{primaryColor}</span>
            </div>

            {/* Presets and Custom Picker */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => onPrimaryColorChange(preset.hex)}
                      title={`${preset.name} (${preset.hex})`}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${preset.bgClass} ${
                        isSelected
                          ? 'border-luma-ink scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Native color input */}
              <label
                title="Custom color picker"
                className="relative flex items-center justify-center w-7 h-7 rounded-full border border-luma-border bg-luma-surface cursor-pointer hover:border-luma-accent"
              >
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <span className="text-xs">🎨</span>
              </label>
            </div>
          </div>
        </div>

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
          <div className="grid grid-cols-5 gap-1">
            {steps.map((s) => {
              const isActive = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-luma-accent text-luma-inverse border-luma-accent shadow-sm'
                      : 'bg-luma-subtle text-luma-secondary border-luma-border hover:bg-luma-card'
                  }`}
                >
                  <span className="text-[0.5625rem] opacity-80 uppercase tracking-wider">
                    {s.number ? `Step ${s.number}` : 'Extra'}
                  </span>
                  <span className="font-semibold text-[0.625rem] mt-0.5 truncate w-full text-center">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent & Camera Status */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
              Camera State
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.cameraState === 'active'
                    ? 'bg-emerald-500'
                    : session.cameraState === 'error' || session.cameraState === 'denied'
                    ? 'bg-red-500'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="text-xs font-semibold text-luma-ink capitalize">
                {session.cameraState}
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Engine Status */}
        <div className="bg-luma-subtle p-3 rounded-xl border border-luma-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6875rem] uppercase tracking-wider text-luma-ghost">
              Skin Analysis Service
            </span>
            <span
              className={`text-[0.625rem] px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider ${
                session.processingStatus === 'done'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : session.processingStatus === 'loading'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                  : session.processingStatus === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {session.processingStatus}
            </span>
          </div>

          {/* Scenario override selector */}
          <div className="mb-3">
            <label
              htmlFor="scenario-select"
              className="block text-[0.625rem] uppercase tracking-wider text-luma-secondary mb-1"
            >
              Scenario Preset:
            </label>
            <select
              id="scenario-select"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full text-xs bg-luma-surface border border-luma-border rounded-lg px-2.5 py-1.5 text-luma-ink focus:outline-none focus:ring-1 focus:ring-luma-accent"
            >
              <option value="auto">Auto (Deterministic Hash)</option>
              {SCENARIO_KEYS.map((k) => (
                <option key={k} value={k}>
                  {MOCK_SCENARIOS[k]?.name || k} ({k})
                </option>
              ))}
            </select>
          </div>

          {/* Analysis trigger actions */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleTriggerAnalysis}
              disabled={session.processingStatus === 'loading'}
              className="flex-1 text-[0.625rem] px-2 py-1.5 rounded border border-luma-accent/40 bg-luma-accent/10 hover:bg-luma-accent/20 text-luma-accent font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Run Analysis
            </button>

            {session.processingStatus === 'loading' ? (
              <button
                type="button"
                onClick={cancelAnalysis}
                className="text-[0.625rem] px-2.5 py-1.5 rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-medium uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={resetAnalysis}
                className="text-[0.625rem] px-2.5 py-1.5 rounded border border-luma-border bg-luma-surface hover:bg-luma-card text-luma-secondary font-medium uppercase tracking-wider transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Instant Scenario Quick Previews */}
          <div className="mt-3 pt-2.5 border-t border-luma-border">
            <span className="block text-[0.5625rem] uppercase tracking-wider text-luma-ghost mb-1.5">
              Instant Profile Previews (Feature 8):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SCENARIO_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setSelectedScenario(k);
                    startAnalysis(k);
                  }}
                  className="text-[0.625rem] px-2 py-1.5 rounded border border-luma-border bg-luma-surface hover:bg-luma-card text-luma-ink font-medium truncate text-left transition-colors"
                >
                  ✦ {MOCK_SCENARIOS[k]?.name || k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Result Summary if done */}
        {session.analysisResult && (
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.6875rem] uppercase tracking-wider text-emerald-800 font-semibold truncate">
                {session.analysisResult.scenarioName || session.analysisResult.scenarioId}
              </span>
              <span className="text-[0.625rem] text-emerald-700 font-mono">
                {session.analysisResult.observations.length} Metrics
              </span>
            </div>
            {session.analysisResult.primaryFocus && (
              <p className="text-[0.625rem] text-emerald-900 font-medium mb-1.5">
                Focus: {session.analysisResult.primaryFocus}
              </p>
            )}
            <div className="space-y-1">
              {session.analysisResult.observations.map((obs) => (
                <div key={obs.label} className="text-[0.625rem] flex items-center justify-between">
                  <span className="text-emerald-950 font-medium">{obs.label}:</span>
                  <span className="text-emerald-800">
                    {obs.value} ({obs.score}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Inspector (Feature 9) */}
        {recommendations && recommendations.length > 0 && (
          <div className="p-3 rounded-xl border border-luma-accent/30 bg-luma-accent/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.6875rem] uppercase tracking-wider text-luma-accent font-semibold">
                Recommendations ({recommendations.length})
              </span>
              <span className="text-[0.625rem] text-luma-secondary font-mono">
                Curated Routine
              </span>
            </div>
            <div className="space-y-2">
              {recommendations.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2 rounded-lg bg-luma-surface border border-luma-border text-left"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[0.6875rem] font-semibold text-luma-ink truncate">
                      {prod.name}
                    </span>
                    <span className="text-[0.625rem] font-mono text-luma-accent font-medium">
                      {prod.matchScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[0.625rem] text-luma-secondary">
                    <span className="uppercase tracking-wider capitalize text-luma-ghost">
                      {prod.routineStep}
                    </span>
                    <span className="font-medium text-luma-ink">£{prod.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[0.5625rem] text-luma-secondary mt-1 leading-normal italic">
                    &ldquo;{prod.matchReason}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host Storefront Cart Synchronization (Feature 10) */}
        <div className="p-3.5 rounded-xl border border-luma-accent/30 bg-luma-accent/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6875rem] uppercase tracking-wider text-luma-accent font-semibold">
              Host Cart Sync & Events
            </span>
            <button
              type="button"
              onClick={openCart}
              className="text-[0.625rem] text-luma-accent hover:underline font-mono"
            >
              Open Drawer ({itemCount})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-luma-surface border border-luma-border">
              <span className="text-[0.5625rem] uppercase tracking-wider text-luma-ghost block">
                Storefront Cart
              </span>
              <span className="text-xs font-semibold text-luma-ink font-mono">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} (£{subtotal.toFixed(2)})
              </span>
            </div>

            <div className="p-2 rounded-lg bg-luma-surface border border-luma-border">
              <span className="text-[0.5625rem] uppercase tracking-wider text-luma-ghost block">
                Session Added
              </span>
              <span className="text-xs font-semibold text-luma-ink font-mono">
                {addedProductIds.length} {addedProductIds.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          {/* Last Interaction */}
          {cartInteraction && (
            <div className="p-2 rounded-lg bg-luma-surface border border-luma-border text-left mb-3">
              <span className="text-[0.5625rem] uppercase tracking-wider text-luma-ghost block mb-0.5">
                Last Interaction
              </span>
              <div className="flex items-center justify-between text-[0.6875rem]">
                <span className="font-mono text-emerald-800 font-medium">
                  {cartInteraction.action.toUpperCase()}
                </span>
                <span className="text-luma-secondary text-[0.625rem] font-mono">
                  {cartInteraction.productId}
                </span>
              </div>
            </div>
          )}

          {/* Real-time Event Stream */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.625rem] uppercase tracking-wider text-luma-ghost font-medium">
                Dispatched Event Log ({cartEvents.length})
              </span>
              {cartEvents.length > 0 && (
                <button
                  type="button"
                  onClick={onClearEvents}
                  className="text-[0.5625rem] text-luma-ghost hover:text-luma-ink font-mono"
                >
                  Clear Log
                </button>
              )}
            </div>

            {cartEvents.length === 0 ? (
              <p className="text-[0.625rem] text-luma-ghost italic p-2 bg-luma-surface rounded-lg border border-luma-border text-center">
                No cart events dispatched yet. Click &ldquo;Add to Bag&rdquo; in recommendations to trigger.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {cartEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-1.5 rounded bg-luma-surface border border-luma-border text-left"
                  >
                    <div className="flex items-center justify-between text-[0.5625rem] mb-0.5">
                      <span className="font-mono text-luma-accent font-semibold uppercase">
                        {evt.type}
                      </span>
                      <span className="font-mono text-luma-ghost">
                        {evt.timestamp.split('T')[1]?.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-[0.625rem] text-luma-ink font-mono truncate">
                      {evt.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Captured Image Inspector */}
        <div className="bg-luma-subtle p-3 rounded-xl border border-luma-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6875rem] uppercase tracking-wider text-luma-ghost">
              Captured Image
            </span>
            {session.capturedImageUrl && (
              <span className="text-[0.625rem] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                Blob Loaded
              </span>
            )}
          </div>
          {session.capturedImageUrl ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-luma-canvas border border-luma-border overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.capturedImageUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-luma-ink truncate">In-Memory Object URL</p>
                <p className="text-[0.625rem] font-mono text-luma-ghost truncate">
                  {session.capturedImageUrl}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-luma-ghost italic">No image captured yet</p>
          )}
        </div>

        {/* Camera Error State */}
        {session.cameraError && (
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.6875rem] uppercase tracking-wider text-amber-800 font-semibold">
                Camera Error
              </span>
              <button
                type="button"
                onClick={handleClearCameraError}
                className="text-[0.625rem] text-amber-700 hover:underline font-mono"
              >
                Clear
              </button>
            </div>
            <p className="text-xs font-mono text-amber-900">{session.cameraError.code}</p>
            <p className="text-[0.6875rem] text-amber-700 mt-0.5">{session.cameraError.message}</p>
          </div>
        )}

        {/* Error Simulation Controls */}
        <div className="bg-luma-subtle p-3 rounded-xl border border-luma-border">
          <span className="block text-[0.6875rem] uppercase tracking-wider text-luma-ghost mb-2">
            Simulate Camera Failure
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { code: 'PERMISSION_DENIED', label: 'Denied', msg: 'Camera permission was denied.' },
              { code: 'CAMERA_IN_USE', label: 'In Use', msg: 'Camera is in use by another app.' },
              { code: 'NO_CAMERA_FOUND', label: 'No Camera', msg: 'No camera device was detected.' },
              { code: 'DISCONNECTED', label: 'Disconnect', msg: 'Camera device was disconnected.' },
            ].map(({ code, label, msg }) => (
              <button
                key={code}
                type="button"
                onClick={() =>
                  handleSimulateCameraError(
                    code as 'PERMISSION_DENIED' | 'CAMERA_IN_USE' | 'NO_CAMERA_FOUND' | 'DISCONNECTED',
                    msg,
                  )
                }
                className="text-[0.625rem] px-2 py-1 rounded border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 font-medium uppercase tracking-wider transition-colors"
              >
                {label}
              </button>
            ))}
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
              Biometric permissions, photos, and analysis calculations live strictly in React memory for the active visit. Zero frames or biometric markers are stored or transmitted remotely.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetPreviewClient() {
  const { addItem, openCart } = useCart();
  const [cartEvents, setCartEvents] = useState<CartLogEntry[]>([]);
  const [brandName, setBrandName] = useState('Luma Beauty');
  const [primaryColor, setPrimaryColor] = useState('#A7685E');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleAddToCart = (event: AddToCartEvent) => {
    addItem(event.productId, event.quantity || 1);
    setCartEvents((prev) => [
      {
        id: 'evt_' + Math.random().toString(36).substring(2, 9),
        type: 'add-to-cart',
        summary: `Added "${event.product?.name || event.productId}" (qty: ${event.quantity})`,
        timestamp: event.timestamp,
      },
      ...prev,
    ]);
    openCart();
  };

  const handleCheckoutRequest = (event: CheckoutRequestEvent) => {
    setCartEvents((prev) => [
      {
        id: 'evt_' + Math.random().toString(36).substring(2, 9),
        type: 'checkout-request',
        summary: `Checkout routine with ${event.productIds.length} products`,
        timestamp: event.timestamp,
      },
      ...prev,
    ]);
    openCart();
  };

  const handleClearEvents = () => {
    setCartEvents([]);
  };

  return (
    <WidgetProvider
      config={{
        storeId: 'luma-beauty',
        brandName,
        primaryColor,
        theme,
        mode: 'inline',
      }}
      onAddToCart={handleAddToCart}
      onCheckoutRequest={handleCheckoutRequest}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inline Widget presentation */}
        <div className="lg:col-span-7 flex justify-center">
          <InlineWidget className="w-full max-w-[460px]" />
        </div>

        {/* Developer Session Inspector */}
        <div className="lg:col-span-5">
          <SessionInspector
            cartEvents={cartEvents}
            onClearEvents={handleClearEvents}
            brandName={brandName}
            onBrandNameChange={setBrandName}
            primaryColor={primaryColor}
            onPrimaryColorChange={setPrimaryColor}
            theme={theme}
            onThemeChange={setTheme}
          />
        </div>
      </div>
    </WidgetProvider>
  );
}
