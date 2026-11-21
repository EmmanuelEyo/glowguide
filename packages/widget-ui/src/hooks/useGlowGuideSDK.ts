'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AddToCartEvent,
  CameraErrorEvent,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  ScanCompleteEvent,
  ScanStartedEvent,
  StepChangeEvent,
  WidgetClosedEvent,
  WidgetOpenedEvent,
  SessionStepId,
} from '../types/widget';

export interface UseGlowGuideSDKOptions {
  autoOpen?: boolean;
  onOpened?: (event: WidgetOpenedEvent) => void;
  onClosed?: (event: WidgetClosedEvent) => void;
  onStepChange?: (event: StepChangeEvent) => void;
  onConsentGiven?: (event: ConsentGivenEvent) => void;
  onScanStarted?: (event: ScanStartedEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
  onCameraError?: (event: CameraErrorEvent) => void;
  onAddToCart?: (event: AddToCartEvent) => void;
  onCheckoutRequest?: (event: CheckoutRequestEvent) => void;
}

export interface GlowGuideEventLogItem {
  id: string;
  name: string;
  timestamp: string;
  summary: string;
  payload: unknown;
}

export interface UseGlowGuideSDKReturn {
  isMounted: boolean;
  isOpen: boolean;
  currentStep: SessionStepId;
  sessionId: string;
  lastEvent: GlowGuideEventLogItem | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setStep: (step: SessionStepId) => void;
  reset: () => void;
}

/**
 * Idiomatic React hook for integrating GlowGuide into React / Next.js applications.
 * Safely guards against SSR hydration mismatch and provides programmatic widget control.
 */
export function useGlowGuideSDK(
  options: UseGlowGuideSDKOptions = {},
): UseGlowGuideSDKReturn {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(options.autoOpen ?? false);
  const [currentStep, setCurrentStep] = useState<SessionStepId>('welcome');
  const [sessionId, setSessionId] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<GlowGuideEventLogItem | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') return;

    function recordEvent(name: string, summary: string, payload: unknown) {
      const timestamp = new Date().toISOString();
      const item: GlowGuideEventLogItem = {
        id: 'evt_' + Math.random().toString(36).substring(2, 9),
        name,
        timestamp,
        summary,
        payload,
      };
      setLastEvent(item);
    }

    function handleOpened(e: Event) {
      const detail = (e as CustomEvent<WidgetOpenedEvent>).detail;
      setIsOpen(true);
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent('opened', 'Widget opened', detail);
      optionsRef.current.onOpened?.(detail);
    }

    function handleClosed(e: Event) {
      const detail = (e as CustomEvent<WidgetClosedEvent>).detail;
      setIsOpen(false);
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent('closed', 'Widget closed', detail);
      optionsRef.current.onClosed?.(detail);
    }

    function handleStepChange(e: Event) {
      const detail = (e as CustomEvent<StepChangeEvent>).detail;
      if (detail?.currentStep) setCurrentStep(detail.currentStep);
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent(
        'step-change',
        `Step transition: ${detail?.previousStep} -> ${detail?.currentStep}`,
        detail,
      );
      optionsRef.current.onStepChange?.(detail);
    }

    function handleConsent(e: Event) {
      const detail = (e as CustomEvent<ConsentGivenEvent>).detail;
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent('consent-given', 'Biometric consent agreed', detail);
      optionsRef.current.onConsentGiven?.(detail);
    }

    function handleScanStarted(e: Event) {
      const detail = (e as CustomEvent<ScanStartedEvent>).detail;
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent('scan-started', 'Diagnostic skin analysis started', detail);
      optionsRef.current.onScanStarted?.(detail);
    }

    function handleScanComplete(e: Event) {
      const detail = (e as CustomEvent<ScanCompleteEvent>).detail;
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent(
        'scan-complete',
        `Skin analysis complete (${detail?.result?.observations?.length || 0} observations)`,
        detail,
      );
      optionsRef.current.onScanComplete?.(detail);
    }

    function handleCameraError(e: Event) {
      const detail = (e as CustomEvent<CameraErrorEvent>).detail;
      recordEvent('camera-error', `Camera error: [${detail?.code}] ${detail?.message}`, detail);
      optionsRef.current.onCameraError?.(detail);
    }

    function handleAddToCart(e: Event) {
      const detail = (e as CustomEvent<AddToCartEvent>).detail;
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent(
        'add-to-cart',
        `Added "${detail?.product?.name || detail?.productId}" (qty: ${detail?.quantity})`,
        detail,
      );
      optionsRef.current.onAddToCart?.(detail);
    }

    function handleCheckoutRequest(e: Event) {
      const detail = (e as CustomEvent<CheckoutRequestEvent>).detail;
      if (detail?.sessionId) setSessionId(detail.sessionId);
      recordEvent(
        'checkout-request',
        `Checkout routine with ${detail?.productIds?.length || 0} products`,
        detail,
      );
      optionsRef.current.onCheckoutRequest?.(detail);
    }

    window.addEventListener('glowguide:opened', handleOpened);
    window.addEventListener('glowguide:closed', handleClosed);
    window.addEventListener('glowguide:step-change', handleStepChange);
    window.addEventListener('glowguide:consent-given', handleConsent);
    window.addEventListener('glowguide:scan-started', handleScanStarted);
    window.addEventListener('glowguide:scan-complete', handleScanComplete);
    window.addEventListener('glowguide:camera-error', handleCameraError);
    window.addEventListener('glowguide:add-to-cart', handleAddToCart);
    window.addEventListener('glowguide:checkout-request', handleCheckoutRequest);

    return () => {
      window.removeEventListener('glowguide:opened', handleOpened);
      window.removeEventListener('glowguide:closed', handleClosed);
      window.removeEventListener('glowguide:step-change', handleStepChange);
      window.removeEventListener('glowguide:consent-given', handleConsent);
      window.removeEventListener('glowguide:scan-started', handleScanStarted);
      window.removeEventListener('glowguide:scan-complete', handleScanComplete);
      window.removeEventListener('glowguide:camera-error', handleCameraError);
      window.removeEventListener('glowguide:add-to-cart', handleAddToCart);
      window.removeEventListener('glowguide:checkout-request', handleCheckoutRequest);
    };
  }, []);

  const open = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('glowguide:command:open'));
    }
  }, []);

  const close = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('glowguide:command:close'));
    }
  }, []);

  const toggle = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('glowguide:command:toggle'));
    }
  }, []);

  const setStep = useCallback((step: SessionStepId) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:command:set-step', { detail: { step } }),
      );
    }
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('glowguide:command:reset'));
    }
  }, []);

  return {
    isMounted,
    isOpen,
    currentStep,
    sessionId,
    lastEvent,
    open,
    close,
    toggle,
    setStep,
    reset,
  };
}
