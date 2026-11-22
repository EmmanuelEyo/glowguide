'use client';

import { useEffect, useState } from 'react';
import { WidgetHeader } from './WidgetHeader';
import { WidgetProgress } from './WidgetProgress';
import { WelcomeStep } from './steps/WelcomeStep';
import { ConsentStep } from './steps/ConsentStep';
import { CameraCaptureStep } from './steps/CameraCaptureStep';
import { AnalyzingStep } from './steps/AnalyzingStep';
import { SkinReportStep } from './steps/SkinReportStep';
import { useWidget } from '../context/WidgetContext';
import type { SessionStepId } from '../types/widget';

interface WidgetShellProps {
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
}

const STEP_METADATA: Record<
  SessionStepId,
  { title: string; badge: string; index: number }
> = {
  welcome: {
    title: 'Skin Discovery',
    badge: 'Step 1 of 4',
    index: 0,
  },
  consent: {
    title: 'Camera Consent',
    badge: 'Step 2 of 4',
    index: 1,
  },
  capture: {
    title: 'Skin Capture',
    badge: 'Step 3 of 4',
    index: 2,
  },
  analyzing: {
    title: 'Skin Analysis',
    badge: 'Evaluating...',
    index: 2,
  },
  report: {
    title: 'Skin Profile',
    badge: 'Step 4 of 4',
    index: 3,
  },
};

export function WidgetShell({
  showClose = false,
  onClose,
  className = '',
}: WidgetShellProps) {
  const { config, currentStep } = useWidget();
  const currentMeta = STEP_METADATA[currentStep] || STEP_METADATA.welcome;

  // Live region announcement text, updated on each step change
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    setAnnouncement(`Now on ${currentMeta.title}, ${currentMeta.badge}`);
  }, [currentStep, currentMeta.title, currentMeta.badge]);

  return (
    <div
      data-theme={config.theme || 'light'}
      className={`glowguide-widget-shell flex flex-col bg-luma-surface rounded-2xl border border-luma-border overflow-hidden shadow-2xl ${className}`}
    >
      {/* Screen-reader live region: announces step changes to assistive technology */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      <WidgetHeader
        brandName={config.brandName || 'GlowGuide'}
        stepTitle={currentMeta.title}
        stepBadge={currentMeta.badge}
        showClose={showClose}
        onClose={onClose}
      />

      <WidgetProgress currentStepIndex={currentMeta.index} totalSteps={4} />

      <div className="flex-1 overflow-y-auto">
        {currentStep === 'welcome' && <WelcomeStep />}
        {currentStep === 'consent' && <ConsentStep />}
        {currentStep === 'capture' && <CameraCaptureStep />}
        {currentStep === 'analyzing' && <AnalyzingStep />}
        {currentStep === 'report' && <SkinReportStep />}
      </div>
    </div>
  );
}
