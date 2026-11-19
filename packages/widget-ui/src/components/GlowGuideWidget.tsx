'use client';

import { WidgetProvider, useWidget } from '../context/WidgetContext';
import { FloatingWidget } from './FloatingWidget';
import { InlineWidget } from './InlineWidget';
import type {
  AddToCartEvent,
  CameraErrorEvent,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  ScanCompleteEvent,
  ScanStartedEvent,
  WidgetConfig,
  WidgetMode,
} from '../types/widget';

interface GlowGuideWidgetInnerProps {
  modeOverride?: WidgetMode;
  className?: string;
}

function GlowGuideWidgetInner({ modeOverride, className }: GlowGuideWidgetInnerProps) {
  const { mode } = useWidget();
  const effectiveMode = modeOverride ?? mode;

  if (effectiveMode === 'inline') {
    return <InlineWidget className={className} />;
  }

  return <FloatingWidget />;
}

export interface GlowGuideWidgetProps {
  config?: Partial<WidgetConfig>;
  mode?: WidgetMode;
  className?: string;
  onConsentGiven?: (event: ConsentGivenEvent) => void;
  onCameraError?: (event: CameraErrorEvent) => void;
  onScanStarted?: (event: ScanStartedEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
  onAddToCart?: (event: AddToCartEvent) => void;
  onCheckoutRequest?: (event: CheckoutRequestEvent) => void;
  children?: React.ReactNode;
}

export function GlowGuideWidget({
  config,
  mode,
  className,
  onConsentGiven,
  onCameraError,
  onScanStarted,
  onScanComplete,
  onAddToCart,
  onCheckoutRequest,
  children,
}: GlowGuideWidgetProps) {
  const mergedConfig: Partial<WidgetConfig> = {
    ...config,
    ...(mode ? { mode } : {}),
  };

  return (
    <WidgetProvider
      config={mergedConfig}
      onConsentGiven={onConsentGiven}
      onCameraError={onCameraError}
      onScanStarted={onScanStarted}
      onScanComplete={onScanComplete}
      onAddToCart={onAddToCart}
      onCheckoutRequest={onCheckoutRequest}
    >
      <GlowGuideWidgetInner modeOverride={mode} className={className} />
      {children}
    </WidgetProvider>
  );
}
