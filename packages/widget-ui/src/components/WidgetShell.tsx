'use client';

import { WidgetHeader } from './WidgetHeader';
import { WidgetProgress } from './WidgetProgress';
import { WelcomeStep } from './steps/WelcomeStep';
import { ConsentStep } from './steps/ConsentStep';
import { CameraCaptureStep } from './steps/CameraCaptureStep';
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
    badge: 'Step 1 of 3',
    index: 0,
  },
  consent: {
    title: 'Camera Consent',
    badge: 'Step 2 of 3',
    index: 1,
  },
  capture: {
    title: 'Skin Capture',
    badge: 'Step 3 of 3',
    index: 2,
  },
};

export function WidgetShell({
  showClose = false,
  onClose,
  className = '',
}: WidgetShellProps) {
  const { config, currentStep } = useWidget();
  const currentMeta = STEP_METADATA[currentStep] || STEP_METADATA.welcome;

  return (
    <div
      className={`flex flex-col bg-luma-surface rounded-2xl border border-luma-border overflow-hidden shadow-2xl ${className}`}
    >
      <WidgetHeader
        brandName={config.brandName || 'GlowGuide'}
        stepTitle={currentMeta.title}
        stepBadge={currentMeta.badge}
        showClose={showClose}
        onClose={onClose}
      />

      <WidgetProgress currentStepIndex={currentMeta.index} totalSteps={3} />

      <div className="flex-1 overflow-y-auto">
        {currentStep === 'welcome' && <WelcomeStep />}
        {currentStep === 'consent' && <ConsentStep />}
        {currentStep === 'capture' && <CameraCaptureStep />}
      </div>
    </div>
  );
}
