'use client';

import { WidgetProvider, useWidget } from '../context/WidgetContext';
import { FloatingWidget } from './FloatingWidget';
import { InlineWidget } from './InlineWidget';
import type { ConsentGivenEvent, WidgetConfig, WidgetMode } from '../types/widget';

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
  children?: React.ReactNode;
}

export function GlowGuideWidget({
  config,
  mode,
  className,
  onConsentGiven,
  children,
}: GlowGuideWidgetProps) {
  const mergedConfig: Partial<WidgetConfig> = {
    ...config,
    ...(mode ? { mode } : {}),
  };

  return (
    <WidgetProvider config={mergedConfig} onConsentGiven={onConsentGiven}>
      <GlowGuideWidgetInner modeOverride={mode} className={className} />
      {children}
    </WidgetProvider>
  );
}
