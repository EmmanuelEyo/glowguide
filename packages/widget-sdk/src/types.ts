import type {
  AddToCartEvent,
  AnalysisResult,
  CameraErrorEvent,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  Product,
  RecommendedProduct,
  ScanCompleteEvent,
  ScanStartedEvent,
  WidgetMode,
  WidgetTheme,
} from '@glowguide/widget-ui';

export type SDKLifecycleState = 'uninitialized' | 'ready' | 'mounted' | 'destroyed';

export type LauncherPosition = 'bottom-right' | 'bottom-left';

export interface GlowGuideConfig {
  storeId: string;
  mode?: WidgetMode;
  brandName?: string;
  primaryColor?: string;
  theme?: WidgetTheme;
  launcherPosition?: LauncherPosition;
  container?: HTMLElement | string | null;
  autoOpen?: boolean;
  products?: Product[];
  onAddToCart?: (event: AddToCartEvent) => void;
  onCheckoutRequest?: (event: CheckoutRequestEvent) => void;
  onConsentGiven?: (event: ConsentGivenEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
}

export interface SDKState {
  lifecycleState: SDKLifecycleState;
  isOpen: boolean;
  config: Readonly<GlowGuideConfig>;
  sessionId: string | null;
  version: string;
}

export interface SDKEventMap {
  'ready': { instance: GlowGuideInstance; timestamp: string };
  'opened': { timestamp: string };
  'closed': { timestamp: string };
  'destroyed': { timestamp: string };
  'state-change': { previous: SDKLifecycleState; current: SDKLifecycleState };
  'add-to-cart': AddToCartEvent;
  'checkout-request': CheckoutRequestEvent;
  'consent-given': ConsentGivenEvent;
  'scan-started': ScanStartedEvent;
  'scan-complete': ScanCompleteEvent;
  'camera-error': CameraErrorEvent;
}

export interface GlowGuideInstance {
  readonly lifecycleState: SDKLifecycleState;
  readonly isOpen: boolean;
  readonly config: Readonly<GlowGuideConfig>;
  init(config?: GlowGuideConfig): Promise<GlowGuideInstance>;
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
  getState(): SDKState;
  getConfig(): Readonly<GlowGuideConfig>;
  on<K extends keyof SDKEventMap>(event: K, handler: (data: SDKEventMap[K]) => void): () => void;
  off<K extends keyof SDKEventMap>(event: K, handler: (data: SDKEventMap[K]) => void): void;
  once<K extends keyof SDKEventMap>(event: K, handler: (data: SDKEventMap[K]) => void): () => void;
}

export type {
  AddToCartEvent,
  AnalysisResult,
  CameraErrorEvent,
  CheckoutRequestEvent,
  ConsentGivenEvent,
  Product,
  RecommendedProduct,
  ScanCompleteEvent,
  ScanStartedEvent,
  WidgetMode,
  WidgetTheme,
};
