export type WidgetMode = 'floating' | 'inline';
export type WidgetTheme = 'light' | 'dark' | string;
export type LauncherPosition = 'bottom-right' | 'bottom-left' | string;

export interface WidgetConfig {
  storeId: string;
  mode?: WidgetMode;
  brandName?: string;
  primaryColor?: string;
  theme?: WidgetTheme;
  launcherPosition?: LauncherPosition;
  autoOpen?: boolean;
}

export interface WidgetStep {
  id: string;
  title: string;
  stepNumber: number;
  totalSteps: number;
}

export interface WidgetContextValue {
  isOpen: boolean;
  mode: WidgetMode;
  currentStep: string;
  config: WidgetConfig;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setStep: (step: string) => void;
}
