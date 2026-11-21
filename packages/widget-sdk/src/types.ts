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
  autoMount?: boolean;
  shadowDom?: boolean;
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
  mountContainer: HTMLElement | null;
  version: string;
}

export interface SDKEventMap {
  'ready': { instance: GlowGuideInstance; timestamp: string };
  'mounted': { container: HTMLElement; mode: WidgetMode; timestamp: string };
  'unmounted': { timestamp: string };
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

export interface MountOptions {
  config: Readonly<GlowGuideConfig>;
  target?: HTMLElement | string | null;
  onEvent?: <K extends keyof SDKEventMap>(event: K, data: SDKEventMap[K]) => void;
}

export interface MountHandle {
  container: HTMLElement;
  shadowRoot?: ShadowRoot | null;
  unmount: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface GlowGuideInstance {
  readonly lifecycleState: SDKLifecycleState;
  readonly isOpen: boolean;
  readonly config: Readonly<GlowGuideConfig>;
  readonly mountContainer: HTMLElement | null;
  init(config?: GlowGuideConfig): Promise<GlowGuideInstance>;
  mount(target?: HTMLElement | string): Promise<GlowGuideInstance>;
  unmount(): void;
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
