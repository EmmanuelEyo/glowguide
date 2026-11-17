'use client';

import { WidgetShell } from './WidgetShell';

interface InlineWidgetProps {
  className?: string;
}

export function InlineWidget({ className = '' }: InlineWidgetProps) {
  return (
    <div className={`w-full max-w-[460px] mx-auto ${className}`}>
      <WidgetShell showClose={false} className="w-full" />
    </div>
  );
}
