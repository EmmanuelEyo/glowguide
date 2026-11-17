'use client';

import { WidgetHeader } from './WidgetHeader';
import { WidgetProgress } from './WidgetProgress';
import { WelcomeStep } from './steps/WelcomeStep';
import { useWidget } from '../context/WidgetContext';

interface WidgetShellProps {
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
}

export function WidgetShell({
  showClose = false,
  onClose,
  className = '',
}: WidgetShellProps) {
  const { config, currentStep, setStep } = useWidget();

  return (
    <div
      className={`flex flex-col bg-luma-surface rounded-2xl border border-luma-border overflow-hidden shadow-2xl ${className}`}
    >
      <WidgetHeader
        brandName={config.brandName || 'GlowGuide'}
        stepTitle="Skin Discovery"
        showClose={showClose}
        onClose={onClose}
      />

      <WidgetProgress currentStepIndex={0} totalSteps={5} />

      <div className="flex-1 overflow-y-auto">
        {currentStep === 'welcome' && (
          <WelcomeStep onStart={() => setStep('welcome')} />
        )}
      </div>
    </div>
  );
}
