'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CameraState,
  ConsentGivenEvent,
  SessionState,
  SessionStepId,
  WidgetConfig,
  WidgetContextValue,
  WidgetMode,
} from '../types/widget';

const DEFAULT_CONFIG: WidgetConfig = {
  storeId: 'luma-beauty',
  mode: 'floating',
  brandName: 'GlowGuide',
  primaryColor: '#A7685E',
  theme: 'light',
  launcherPosition: 'bottom-right',
  autoOpen: false,
};

const STEP_ORDER: SessionStepId[] = ['welcome', 'consent', 'capture'];

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 11);
}

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
  onConsentGiven?: (event: ConsentGivenEvent) => void;
}

export function WidgetProvider({
  children,
  config: userConfig,
  onConsentGiven,
}: WidgetProviderProps) {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...userConfig }),
    [userConfig],
  );

  const [isOpen, setIsOpen] = useState(mergedConfig.autoOpen ?? false);
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [currentStep, setCurrentStep] = useState<SessionStepId>('welcome');
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);
  const [cameraState, setCameraStateState] = useState<CameraState>('idle');
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  const mode: WidgetMode = mergedConfig.mode ?? 'floating';

  const openWidget = useCallback(() => setIsOpen(true), []);
  const closeWidget = useCallback(() => setIsOpen(false), []);
  const toggleWidget = useCallback(() => setIsOpen((prev) => !prev), []);

  const setStep = useCallback((step: SessionStepId) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev);
      if (idx !== -1 && idx < STEP_ORDER.length - 1) {
        return STEP_ORDER[idx + 1];
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev);
      if (idx > 0) {
        return STEP_ORDER[idx - 1];
      }
      return prev;
    });
  }, []);

  const setConsent = useCallback(
    (given: boolean) => {
      const timestamp = given ? new Date().toISOString() : null;
      setConsentGiven(given);
      setConsentTimestamp(timestamp);
      if (given && timestamp) {
        onConsentGiven?.({ timestamp, sessionId });
      }
    },
    [sessionId, onConsentGiven],
  );

  const setCameraState = useCallback((state: CameraState) => {
    setCameraStateState(state);
  }, []);

  const setCapturedImage = useCallback((url: string) => {
    setCapturedImageUrl((prev) => {
      if (prev && prev !== url && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return url;
    });
  }, []);

  const clearCapturedImage = useCallback(() => {
    setCapturedImageUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const resetSession = useCallback(() => {
    setCapturedImageUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCameraStateState('idle');
    setSessionId(generateSessionId());
    setCurrentStep('welcome');
    setConsentGiven(false);
    setConsentTimestamp(null);
  }, []);

  // Cleanup object URL on unmount of provider
  useEffect(() => {
    return () => {
      if (capturedImageUrl && capturedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(capturedImageUrl);
      }
    };
  }, [capturedImageUrl]);

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

  const session = useMemo<SessionState>(
    () => ({
      sessionId,
      step: currentStep,
      consentGiven,
      consentTimestamp,
      cameraState,
      capturedImageUrl,
    }),
    [sessionId, currentStep, consentGiven, consentTimestamp, cameraState, capturedImageUrl],
  );

  const value = useMemo<WidgetContextValue>(
    () => ({
      isOpen,
      mode,
      session,
      currentStep,
      config: mergedConfig,
      openWidget,
      closeWidget,
      toggleWidget,
      setStep,
      nextStep,
      prevStep,
      resetSession,
      setConsent,
      setCameraState,
      setCapturedImage,
      clearCapturedImage,
    }),
    [
      isOpen,
      mode,
      session,
      currentStep,
      mergedConfig,
      openWidget,
      closeWidget,
      toggleWidget,
      setStep,
      nextStep,
      prevStep,
      resetSession,
      setConsent,
      setCameraState,
      setCapturedImage,
      clearCapturedImage,
    ],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
}
