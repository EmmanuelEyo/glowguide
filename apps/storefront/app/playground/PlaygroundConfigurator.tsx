'use client';

import React from 'react';
import {
  type PlaygroundConfig,
  type BorderRadiusOption,
  COLOR_PRESETS,
  BORDER_RADIUS_MAP,
  STEP_OPTIONS,
} from './types';
import { SCENARIO_KEYS, MOCK_SCENARIOS } from '@glowguide/widget-ui';

interface PlaygroundConfiguratorProps {
  config: PlaygroundConfig;
  onChange: (updated: PlaygroundConfig) => void;
  onReset: () => void;
}

export function PlaygroundConfigurator({
  config,
  onChange,
  onReset,
}: PlaygroundConfiguratorProps) {
  const update = <K extends keyof PlaygroundConfig>(key: K, value: PlaygroundConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-luma-surface border border-luma-border rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-luma-border">
        <div>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-luma-accent">
            Interactive Configurator
          </span>
          <h2 className="font-display text-lg font-light text-luma-ink mt-0.5">
            Widget Parameters
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-luma-secondary hover:text-luma-ink border border-luma-border hover:border-luma-ghost px-2.5 py-1 rounded transition-colors"
          title="Reset to default settings"
        >
          Reset Defaults
        </button>
      </div>

      {/* Presentation Mode */}
      <div>
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary mb-2">
          Presentation Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => update('mode', 'inline')}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between ${
              config.mode === 'inline'
                ? 'bg-luma-accent/10 border-luma-accent text-luma-accent font-semibold'
                : 'bg-luma-subtle border-luma-border text-luma-secondary hover:text-luma-ink'
            }`}
          >
            <span>Embedded Inline</span>
            {config.mode === 'inline' && <span className="text-xs">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => update('mode', 'floating')}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between ${
              config.mode === 'floating'
                ? 'bg-luma-accent/10 border-luma-accent text-luma-accent font-semibold'
                : 'bg-luma-subtle border-luma-border text-luma-secondary hover:text-luma-ink'
            }`}
          >
            <span>Floating Modal</span>
            {config.mode === 'floating' && <span className="text-xs">✓</span>}
          </button>
        </div>
        <p className="text-[0.6875rem] text-luma-ghost mt-1.5">
          {config.mode === 'inline'
            ? 'Embeds directly inside host page layout or product section.'
            : 'Renders a corner launcher pill and pops up in an overlay modal.'}
        </p>
      </div>

      {/* Brand Identity */}
      <div className="space-y-3">
        <label
          htmlFor="cfg-brand-name"
          className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary"
        >
          Merchant Brand Name
        </label>
        <input
          id="cfg-brand-name"
          type="text"
          value={config.brandName}
          onChange={(e) => update('brandName', e.target.value)}
          placeholder="e.g. Luma Beauty"
          className="w-full px-3 py-2 text-xs bg-luma-subtle border border-luma-border rounded-lg text-luma-ink focus:outline-none focus:ring-1 focus:ring-luma-accent focus:border-luma-accent font-mono"
        />
      </div>

      {/* Color Palette & Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary">
            Primary Theme Color
          </label>
          <span className="text-[0.6875rem] font-mono text-luma-ghost">
            {config.primaryColor}
          </span>
        </div>

        {/* Color Presets */}
        <div className="grid grid-cols-3 gap-1.5">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = config.primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChange({
                    ...config,
                    primaryColor: preset.hex,
                    accentColor: preset.accentHex,
                  });
                }}
                className={`flex items-center gap-1.5 p-1.5 rounded-md border text-left transition-all ${
                  isSelected
                    ? 'border-luma-accent bg-luma-accent/10'
                    : 'border-luma-border bg-luma-subtle hover:bg-luma-surface'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className="text-[0.625rem] truncate text-luma-ink font-medium">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="w-8 h-8 rounded border border-luma-border cursor-pointer bg-transparent p-0"
            title="Custom primary color"
          />
          <input
            type="text"
            value={config.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-luma-subtle border border-luma-border rounded-lg text-luma-ink font-mono focus:outline-none focus:ring-1 focus:ring-luma-accent"
            placeholder="#A7685E"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary">
          Corner Radius
        </label>
        <div className="grid grid-cols-5 gap-1">
          {(Object.keys(BORDER_RADIUS_MAP) as BorderRadiusOption[]).map((key) => {
            const item = BORDER_RADIUS_MAP[key];
            const isSelected = config.borderRadius === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update('borderRadius', key)}
                className={`py-1.5 text-[0.6875rem] font-medium border rounded-md transition-all text-center ${
                  isSelected
                    ? 'bg-luma-accent text-luma-inverse border-luma-accent font-semibold'
                    : 'bg-luma-subtle border-luma-border text-luma-secondary hover:text-luma-ink'
                }`}
              >
                {item.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Initial Step Selection */}
      <div className="space-y-2">
        <label
          htmlFor="cfg-initial-step"
          className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary"
        >
          Initial Step On Mount
        </label>
        <select
          id="cfg-initial-step"
          value={config.initialStep}
          onChange={(e) => update('initialStep', e.target.value as PlaygroundConfig['initialStep'])}
          className="w-full px-3 py-2 text-xs bg-luma-subtle border border-luma-border rounded-lg text-luma-ink focus:outline-none focus:ring-1 focus:ring-luma-accent"
        >
          {STEP_OPTIONS.map((step) => (
            <option key={step.id} value={step.id}>
              {step.label} ({step.desc})
            </option>
          ))}
        </select>
      </div>

      {/* Mock Skin Scenario */}
      <div className="space-y-2">
        <label
          htmlFor="cfg-scenario"
          className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-luma-secondary"
        >
          Mock Analysis Profile
        </label>
        <select
          id="cfg-scenario"
          value={config.scenarioKey}
          onChange={(e) => update('scenarioKey', e.target.value)}
          className="w-full px-3 py-2 text-xs bg-luma-subtle border border-luma-border rounded-lg text-luma-ink focus:outline-none focus:ring-1 focus:ring-luma-accent"
        >
          <option value="auto">Automatic (Deterministic by session)</option>
          {SCENARIO_KEYS.map((key) => {
            const scenario = MOCK_SCENARIOS[key];
            return (
              <option key={key} value={key}>
                {scenario.name} ({scenario.primaryFocus})
              </option>
            );
          })}
        </select>
      </div>

      {/* Host Cart Sync Toggle */}
      <div className="pt-2 border-t border-luma-border flex items-center justify-between">
        <div>
          <span className="block text-xs font-medium text-luma-ink">
            Host Cart Synchronization
          </span>
          <span className="block text-[0.6875rem] text-luma-ghost">
            Forward add-to-cart events to the storefront cart drawer
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.simulateHostCart}
          onClick={() => update('simulateHostCart', !config.simulateHostCart)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            config.simulateHostCart ? 'bg-luma-accent' : 'bg-luma-border'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              config.simulateHostCart ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
