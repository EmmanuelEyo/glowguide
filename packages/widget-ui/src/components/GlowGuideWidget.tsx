'use client';

import { WidgetProvider, useWidget } from '../context/WidgetContext';
import { FloatingWidget } from './FloatingWidget';
import { InlineWidget } from './InlineWidget';
import type { WidgetConfig, WidgetMode } from '../types/widget';

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
}

export function GlowGuideWidget({ config, mode, className }: GlowGuideWidgetProps) {
  const mergedConfig: Partial<WidgetConfig> = {
    ...config,
    ...(mode ? { mode } : {}),
  };

  return (
    <WidgetProvider config={mergedConfig}>
      <GlowGuideWidgetInner modeOverride={mode} className={className} />
    </WidgetProvider>
  );
}
