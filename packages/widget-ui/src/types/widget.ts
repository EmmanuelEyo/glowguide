export type WidgetMode = 'floating' | 'inline';
export type WidgetTheme = 'light' | 'dark' | string;
export type LauncherPosition = 'bottom-right' | 'bottom-left' | string;

export type SessionStepId = 'welcome' | 'consent' | 'capture';
export type CameraState = 'idle' | 'active' | 'error' | 'denied';

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
  id: SessionStepId;
  title: string;
  stepNumber: number;
  totalSteps: number;
}

export interface SessionState {
  sessionId: string;
  step: SessionStepId;
  consentGiven: boolean;
  consentTimestamp: string | null;
  cameraState: CameraState;
  capturedImageUrl: string | null;
}

export interface ConsentGivenEvent {
  timestamp: string;
  sessionId: string;
}

export interface WidgetContextValue {
  isOpen: boolean;
  mode: WidgetMode;
  session: SessionState;
  currentStep: SessionStepId;
  config: WidgetConfig;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setStep: (step: SessionStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSession: () => void;
  setConsent: (consentGiven: boolean) => void;
  setCameraState: (cameraState: CameraState) => void;
  setCapturedImage: (imageUrl: string) => void;
  clearCapturedImage: () => void;
}
