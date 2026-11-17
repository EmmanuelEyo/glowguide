'use client';

interface WidgetProgressProps {
  currentStepIndex: number;
  totalSteps: number;
}

const WIDTH_CLASSES_3: Record<number, string> = {
  1: 'w-1/3',
  2: 'w-2/3',
  3: 'w-full',
};

const WIDTH_CLASSES_5: Record<number, string> = {
  1: 'w-[20%]',
  2: 'w-[40%]',
  3: 'w-[60%]',
  4: 'w-[80%]',
  5: 'w-full',
};

export function WidgetProgress({ currentStepIndex, totalSteps }: WidgetProgressProps) {
  const stepNum = Math.min(totalSteps, Math.max(1, currentStepIndex + 1));
  const classMap = totalSteps === 3 ? WIDTH_CLASSES_3 : WIDTH_CLASSES_5;
  const widthClass = classMap[stepNum] || (stepNum >= totalSteps ? 'w-full' : 'w-1/3');
  const percentage = Math.round((stepNum / totalSteps) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Step ${stepNum} of ${totalSteps}`}
      className="w-full bg-luma-subtle h-1 overflow-hidden"
    >
      <div className={`bg-luma-accent h-full transition-all duration-300 ease-out ${widthClass}`} />
    </div>
  );
}
