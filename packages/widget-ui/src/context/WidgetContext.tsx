'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { WidgetConfig, WidgetContextValue, WidgetMode } from '../types/widget';

const DEFAULT_CONFIG: WidgetConfig = {
  storeId: 'luma-beauty',
  mode: 'floating',
  brandName: 'GlowGuide',
  primaryColor: '#A7685E',
  theme: 'light',
  launcherPosition: 'bottom-right',
  autoOpen: false,
};

const WidgetContext = createContext<WidgetContextValue | null>(null);

export function useWidget(): WidgetContextValue {
  const ctx = useContext(WidgetContext);
  if (!ctx) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return ctx;
}

interface WidgetProviderProps {
  children: React.ReactNode;
  config?: Partial<WidgetConfig>;
}

export function WidgetProvider({ children, config: userConfig }: WidgetProviderProps) {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...userConfig }),
    [userConfig],
  );

  const [isOpen, setIsOpen] = useState(mergedConfig.autoOpen ?? false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const mode: WidgetMode = mergedConfig.mode ?? 'floating';

  const openWidget = useCallback(() => setIsOpen(true), []);
  const closeWidget = useCallback(() => setIsOpen(false), []);
  const toggleWidget = useCallback(() => setIsOpen((prev) => !prev), []);
  const setStep = useCallback((step: string) => setCurrentStep(step), []);

  // Document-level listener for elements with [data-open-widget] attribute
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trigger = target.closest('[data-open-widget]');
      if (trigger) {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const value = useMemo<WidgetContextValue>(
    () => ({
      isOpen,
      mode,
      currentStep,
      config: mergedConfig,
      openWidget,
      closeWidget,
      toggleWidget,
      setStep,
    }),
    [isOpen, mode, currentStep, mergedConfig, openWidget, closeWidget, toggleWidget, setStep],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
}
