'use client';

import { useEffect, useRef } from 'react';
import { useWidget } from '../context/WidgetContext';
import { WidgetShell } from './WidgetShell';
import { generateThemeVariables } from '../styles/theme';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function FloatingWidget() {
  const { isOpen, openWidget, closeWidget, config } = useWidget();
  const dialogRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const themeVars = generateThemeVariables(config);
  const themeClass = `glowguide-theme-root ${config.theme === 'dark' ? 'dark' : ''}`;
  const reducedMotion = useReducedMotion();

  // Activate focus trap while dialog is open
  useFocusTrap(dialogRef, isOpen);

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

  // Move focus into dialog on open; return to launcher on close
  useEffect(() => {
    if (isOpen) {
      // Allow the DOM to settle before querying focusable children
      const id = window.requestAnimationFrame(() => {
        const container = dialogRef.current;
        if (!container) return;
        const focusable = container.querySelector<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        focusable?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    } else {
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  const isLeft = config.launcherPosition === 'bottom-left';
  const launcherPosClass = isLeft ? 'bottom-6 left-6' : 'bottom-6 right-6';
  const dialogPosClass = isLeft
    ? 'sm:bottom-24 sm:left-6'
    : 'sm:bottom-24 sm:right-6';

  // Animation classes gated by reduced motion preference
  const dialogTransitionClass = reducedMotion
    ? ''
    : 'transition-all duration-300 ease-out origin-bottom';

  const dialogVisibilityClass = isOpen
    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 scale-95 translate-y-4 pointer-events-none';

  const launcherLiftClass = reducedMotion ? '' : 'motion-safe:hover:-translate-y-0.5';

  return (
    <div
      className={themeClass}
      data-theme={config.theme || 'light'}
      style={themeVars as React.CSSProperties}
    >
      {/* Floating launcher trigger button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={openWidget}
        aria-label="Open GlowGuide skin analysis"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`fixed ${launcherPosClass} z-[500] inline-flex items-center gap-2 h-12 px-5 rounded-full bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase shadow-lg hover:shadow-xl transition-all duration-200 ${launcherLiftClass} select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-2`}
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
        className={`fixed ${dialogPosClass} max-sm:inset-x-0 max-sm:bottom-0 z-[500] w-full sm:max-w-[420px] max-h-[85vh] flex flex-col ${dialogTransitionClass} ${dialogVisibilityClass}`}
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
