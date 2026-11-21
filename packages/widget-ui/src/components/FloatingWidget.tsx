'use client';

import { useEffect, useRef } from 'react';
import { useWidget } from '../context/WidgetContext';
import { WidgetShell } from './WidgetShell';
import { generateThemeVariables } from '../styles/theme';

export function FloatingWidget() {
  const { isOpen, openWidget, closeWidget, config } = useWidget();
  const dialogRef = useRef<HTMLDivElement>(null);
  const themeVars = generateThemeVariables(config);
  const themeClass = `glowguide-theme-root ${config.theme === 'dark' ? 'dark' : ''}`;

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        closeWidget();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWidget]);

  const isLeft = config.launcherPosition === 'bottom-left';
  const launcherPosClass = isLeft ? 'bottom-6 left-6' : 'bottom-6 right-6';
  const dialogPosClass = isLeft
    ? 'sm:bottom-24 sm:left-6'
    : 'sm:bottom-24 sm:right-6';

  return (
    <div
      className={themeClass}
      data-theme={config.theme || 'light'}
      style={themeVars as React.CSSProperties}
    >
      {/* Floating launcher trigger button */}
      <button
        type="button"
        onClick={openWidget}
        aria-label="Open GlowGuide skin analysis"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`fixed ${launcherPosClass} z-[500] inline-flex items-center gap-2 h-12 px-5 rounded-full bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 select-none`}
      >
        <span className="text-sm" aria-hidden="true">✦</span>
        <span>Analyse Skin</span>
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeWidget}
        className={`fixed inset-0 bg-luma-canvas/40 backdrop-blur-[2px] z-[499] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Floating dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="GlowGuide skin analysis"
        aria-hidden={!isOpen}
        className={`fixed ${dialogPosClass} max-sm:inset-x-0 max-sm:bottom-0 z-[500] w-full sm:max-w-[420px] max-h-[85vh] flex flex-col transition-all duration-300 ease-out origin-bottom ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <WidgetShell
          showClose={true}
          onClose={closeWidget}
          className="h-full max-h-[85vh] max-sm:rounded-b-none"
        />
      </div>
    </div>
  );
}
