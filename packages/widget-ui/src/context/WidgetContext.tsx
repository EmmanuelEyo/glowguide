'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AddToCartEvent,
  AnalysisError,
  AnalysisResult,
  CameraErrorCode,
  CameraErrorEvent,
  CameraState,
  CartInteraction,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  ProcessingStatus,
  RecommendedProduct,
  ScanCompleteEvent,
  ScanStartedEvent,
  SessionState,
  SessionStepId,
  WidgetConfig,
  WidgetContextValue,
  WidgetMode,
} from '../types/widget';
import { analyzeSkin } from '../services/skinAnalysis';
import { getRecommendations } from '../services/recommendationEngine';

const DEFAULT_CONFIG: WidgetConfig = {
  storeId: 'luma-beauty',
  mode: 'floating',
  brandName: 'GlowGuide',
  primaryColor: '#A7685E',
  theme: 'light',
  launcherPosition: 'bottom-right',
  autoOpen: false,
};

const STEP_ORDER: SessionStepId[] = [
  'welcome',
  'consent',
  'capture',
  'analyzing',
  'report',
];

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
  onCameraError?: (event: CameraErrorEvent) => void;
  onScanStarted?: (event: ScanStartedEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
  onAddToCart?: (event: AddToCartEvent) => void;
  onCheckoutRequest?: (event: CheckoutRequestEvent) => void;
}

export function WidgetProvider({
  children,
  config: userConfig,
  onConsentGiven,
  onCameraError,
  onScanStarted,
  onScanComplete,
  onAddToCart,
  onCheckoutRequest,
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
  const [cameraError, setCameraErrorState] = useState<CameraErrorEvent | null>(null);

  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [cartInteraction, setCartInteraction] = useState<CartInteraction | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const mode: WidgetMode = mergedConfig.mode ?? 'floating';

  const openWidget = useCallback(() => setIsOpen(true), []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next && abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return next;
    });
  }, []);

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

  const setCameraError = useCallback(
    (err: CameraErrorEvent | null) => {
      setCameraErrorState(err);
      if (err) {
        onCameraError?.(err);
      }
    },
    [onCameraError],
  );

  const clearCameraError = useCallback(() => {
    setCameraErrorState(null);
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessingStatus('idle');
    setAnalysisError(null);
    setCurrentStep('capture');
  }, []);

  const resetAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessingStatus('idle');
    setAnalysisResult(null);
    setAnalysisError(null);
    setRecommendations([]);
  }, []);

  const startAnalysis = useCallback(
    async (scenarioOverride?: string): Promise<AnalysisResult | null> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setProcessingStatus('loading');
      setAnalysisError(null);
      setAnalysisResult(null);
      setRecommendations([]);
      setCurrentStep('analyzing');

      const timestamp = new Date().toISOString();
      onScanStarted?.({ sessionId, timestamp });

      try {
        const result = await analyzeSkin({
          imageUrl: capturedImageUrl || sessionId,
          scenarioOverride,
          signal: controller.signal,
        });

        setAnalysisResult(result);
        const recs = getRecommendations(result, mergedConfig.products);
        setRecommendations(recs);
        setProcessingStatus('done');
        setCurrentStep('report');
        onScanComplete?.({ sessionId, result });
        return result;
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return null;
        }
        const analysisErr = err as AnalysisError;
        setAnalysisError(analysisErr);
        setProcessingStatus('error');
        return null;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [sessionId, capturedImageUrl, mergedConfig.products, onScanStarted, onScanComplete],
  );

  const addToCart = useCallback(
    (product: RecommendedProduct, quantity = 1) => {
      const timestamp = new Date().toISOString();
      const event: AddToCartEvent = {
        productId: product.id,
        quantity,
        product,
        timestamp,
        sessionId,
      };

      setAddedProductIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
      setCartInteraction({
        productId: product.id,
        action: 'add',
        quantity,
        timestamp,
      });

      onAddToCart?.(event);
      mergedConfig.onAddToCart?.(event);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('glowguide:add-to-cart', {
            detail: event,
            bubbles: true,
          }),
        );
      }
    },
    [sessionId, onAddToCart, mergedConfig],
  );

  const addAllToCart = useCallback(
    (products: RecommendedProduct[]) => {
      if (!products || products.length === 0) return;
      const timestamp = new Date().toISOString();
      const newIds: string[] = [];

      products.forEach((product) => {
        newIds.push(product.id);
        const event: AddToCartEvent = {
          productId: product.id,
          quantity: 1,
          product,
          timestamp,
          sessionId,
        };
        onAddToCart?.(event);
        mergedConfig.onAddToCart?.(event);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('glowguide:add-to-cart', {
              detail: event,
              bubbles: true,
            }),
          );
        }
      });

      setAddedProductIds((prev) => {
        const set = new Set([...prev, ...newIds]);
        return Array.from(set);
      });

      setCartInteraction({
        productId: 'routine-all',
        action: 'add',
        quantity: products.length,
        timestamp,
      });
    },
    [sessionId, onAddToCart, mergedConfig],
  );

  const requestCheckout = useCallback(
    (productIds?: string[]) => {
      const ids = productIds && productIds.length > 0 ? productIds : addedProductIds;
      const timestamp = new Date().toISOString();
      const event: CheckoutRequestEvent = {
        productIds: ids,
        timestamp,
        sessionId,
      };

      setCartInteraction({
        productId: ids[0] || 'checkout',
        action: 'checkout',
        timestamp,
      });

      onCheckoutRequest?.(event);
      mergedConfig.onCheckoutRequest?.(event);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('glowguide:checkout-request', {
            detail: event,
            bubbles: true,
          }),
        );
      }
    },
    [addedProductIds, sessionId, onCheckoutRequest, mergedConfig],
  );

  const resetSession = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setCapturedImageUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCameraStateState('idle');
    setCameraErrorState(null);
    setProcessingStatus('idle');
    setAnalysisResult(null);
    setAnalysisError(null);
    setRecommendations([]);
    setAddedProductIds([]);
    setCartInteraction(null);
    setSessionId(generateSessionId());
    setCurrentStep('welcome');
    setConsentGiven(false);
    setConsentTimestamp(null);
  }, []);

  // Cleanup object URL and pending controllers on unmount of provider
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
      cameraError,
      processingStatus,
      analysisResult,
      analysisError,
      recommendations,
      cartInteraction,
      addedProductIds,
    }),
    [
      sessionId,
      currentStep,
      consentGiven,
      consentTimestamp,
      cameraState,
      capturedImageUrl,
      cameraError,
      processingStatus,
      analysisResult,
      analysisError,
      recommendations,
      cartInteraction,
      addedProductIds,
    ],
  );

  const value = useMemo<WidgetContextValue>(
    () => ({
      isOpen,
      mode,
      session,
      currentStep,
      config: mergedConfig,
      recommendations,
      addedProductIds,
      cartInteraction,
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
      setCameraError,
      clearCameraError,
      startAnalysis,
      cancelAnalysis,
      resetAnalysis,
      addToCart,
      addAllToCart,
      requestCheckout,
    }),
    [
      isOpen,
      mode,
      session,
      currentStep,
      mergedConfig,
      recommendations,
      addedProductIds,
      cartInteraction,
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
      setCameraError,
      clearCameraError,
      startAnalysis,
      cancelAnalysis,
      resetAnalysis,
      addToCart,
      addAllToCart,
      requestCheckout,
    ],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
}
