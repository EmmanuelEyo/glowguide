export type WidgetMode = 'floating' | 'inline';
export type WidgetTheme = 'light' | 'dark' | string;
export type LauncherPosition = 'bottom-right' | 'bottom-left' | string;

export type SessionStepId =
  | 'welcome'
  | 'consent'
  | 'capture'
  | 'analyzing'
  | 'report';
export type CameraState = 'idle' | 'active' | 'error' | 'denied';

export type CameraErrorCode =
  | 'PERMISSION_DENIED'
  | 'NO_CAMERA_FOUND'
  | 'CAMERA_IN_USE'
  | 'UNSUPPORTED'
  | 'DISCONNECTED'
  | 'UNKNOWN';

export const GlowGuideEvent = {
  READY: 'ready',
  MOUNTED: 'mounted',
  UNMOUNTED: 'unmounted',
  OPENED: 'opened',
  CLOSED: 'closed',
  DESTROYED: 'destroyed',
  STATE_CHANGE: 'state-change',
  STEP_CHANGE: 'step-change',
  CONSENT_GIVEN: 'consent-given',
  SCAN_STARTED: 'scan-started',
  SCAN_COMPLETE: 'scan-complete',
  CAMERA_ERROR: 'camera-error',
  ADD_TO_CART: 'add-to-cart',
  CHECKOUT_REQUEST: 'checkout-request',
} as const;

export type GlowGuideEventType = (typeof GlowGuideEvent)[keyof typeof GlowGuideEvent];

export interface WidgetOpenedEvent {
  timestamp: string;
  sessionId?: string;
}

export interface WidgetClosedEvent {
  timestamp: string;
  sessionId?: string;
}

export interface StepChangeEvent {
  previousStep: SessionStepId;
  currentStep: SessionStepId;
  sessionId: string;
  timestamp: string;
}

export interface CameraErrorEvent {
  code: CameraErrorCode;
  message: string;
  timestamp?: string;
}

export type ObservationLevel =
  | 'optimal'
  | 'good'
  | 'moderate'
  | 'needs-attention';

export interface Observation {
  label: string;
  value: string;
  note: string;
  score?: number;
  level?: ObservationLevel;
}

export interface AnalysisResult {
  scenarioId: string;
  scenarioName?: string;
  summary?: string;
  primaryFocus?: string;
  observations: Observation[];
  generatedAt: string;
}

export type ProcessingStatus = 'idle' | 'loading' | 'done' | 'error';

export type AnalysisErrorCode =
  | 'TIMEOUT'
  | 'IMAGE_UNREADABLE'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN';

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
}

export interface ScanStartedEvent {
  sessionId: string;
  timestamp: string;
}

export interface ScanCompleteEvent {
  sessionId: string;
  result: AnalysisResult;
  timestamp?: string;
}

export interface AddToCartEvent {
  productId: string;
  quantity: number;
  product?: RecommendedProduct;
  timestamp: string;
  sessionId: string;
}

export interface CheckoutRequestEvent {
  productIds: string[];
  timestamp: string;
  sessionId: string;
}

export interface CartInteraction {
  productId: string;
  action: 'add' | 'checkout';
  quantity?: number;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  gradient?: string;
  emoji?: string;
  imageUrl?: string;
}

export type RoutineStep = 'prep' | 'treat' | 'hydrate' | 'protect';

export interface RecommendedProduct extends Product {
  matchReason: string;
  routineStep: RoutineStep;
  matchScore: number;
}

export interface WidgetConfig {
  storeId: string;
  mode?: WidgetMode;
  brandName?: string;
  primaryColor?: string;
  theme?: WidgetTheme;
  launcherPosition?: LauncherPosition;
  autoOpen?: boolean;
  products?: Product[];
  onOpened?: (event: WidgetOpenedEvent) => void;
  onClosed?: (event: WidgetClosedEvent) => void;
  onStepChange?: (event: StepChangeEvent) => void;
  onConsentGiven?: (event: ConsentGivenEvent) => void;
  onScanStarted?: (event: ScanStartedEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
  onCameraError?: (event: CameraErrorEvent) => void;
  onAddToCart?: (event: AddToCartEvent) => void;
  onCheckoutRequest?: (event: CheckoutRequestEvent) => void;
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
  cameraError: CameraErrorEvent | null;
  processingStatus: ProcessingStatus;
  analysisResult: AnalysisResult | null;
  analysisError: AnalysisError | null;
  recommendations: RecommendedProduct[];
  cartInteraction: CartInteraction | null;
  addedProductIds: string[];
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
  recommendations: RecommendedProduct[];
  addedProductIds: string[];
  cartInteraction: CartInteraction | null;
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
  setCameraError: (error: CameraErrorEvent | null) => void;
  clearCameraError: () => void;
  startAnalysis: (scenarioOverride?: string) => Promise<AnalysisResult | null>;
  cancelAnalysis: () => void;
  resetAnalysis: () => void;
  addToCart: (product: RecommendedProduct, quantity?: number) => void;
  addAllToCart: (products: RecommendedProduct[]) => void;
  requestCheckout: (productIds?: string[]) => void;
}
