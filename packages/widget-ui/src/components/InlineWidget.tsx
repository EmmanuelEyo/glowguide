'use client';

import { WidgetShell } from './WidgetShell';
import { useWidget } from '../context/WidgetContext';
import { generateThemeVariables } from '../styles/theme';

interface InlineWidgetProps {
  className?: string;
}

export function InlineWidget({ className = '' }: InlineWidgetProps) {
  const { config } = useWidget();
  const themeVars = generateThemeVariables(config);
  const themeClass = `glowguide-theme-root ${config.theme === 'dark' ? 'dark' : ''} w-full max-w-[460px] mx-auto ${className}`;

  return (
    <div
      className={themeClass}
      data-theme={config.theme || 'light'}
      style={themeVars as React.CSSProperties}
    >
      <WidgetShell showClose={false} className="w-full" />
    </div>
  );
}
