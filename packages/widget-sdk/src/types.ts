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
  StepChangeEvent,
  WidgetClosedEvent,
  WidgetMode,
  WidgetOpenedEvent,
  WidgetTheme,
} from '@glowguide/widget-ui';
import { GlowGuideEvent, type GlowGuideEventType } from '@glowguide/widget-ui';

export { GlowGuideEvent };
export type { GlowGuideEventType };

export type SDKLifecycleState = 'uninitialized' | 'ready' | 'mounted' | 'destroyed';

export type LauncherPosition = 'bottom-right' | 'bottom-left';

export interface ReadyEvent {
  instance: GlowGuideInstance;
  timestamp: string;
}

export interface MountedEvent {
  container: HTMLElement;
  mode: WidgetMode;
  timestamp: string;
}

export interface UnmountedEvent {
  timestamp: string;
}

export interface DestroyedEvent {
  timestamp: string;
}

export interface StateChangeEvent {
  previous: SDKLifecycleState;
  current: SDKLifecycleState;
  timestamp?: string;
}

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
  onReady?: (event: ReadyEvent) => void;
  onMounted?: (event: MountedEvent) => void;
  onUnmounted?: (event: UnmountedEvent) => void;
  onDestroyed?: (event: DestroyedEvent) => void;
  onStateChange?: (event: StateChangeEvent) => void;
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

export interface SDKState {
  lifecycleState: SDKLifecycleState;
  isOpen: boolean;
  config: Readonly<GlowGuideConfig>;
  sessionId: string | null;
  mountContainer: HTMLElement | null;
  version: string;
}

export interface SDKEventMap {
  'ready': ReadyEvent;
  'mounted': MountedEvent;
  'unmounted': UnmountedEvent;
  'opened': WidgetOpenedEvent;
  'closed': WidgetClosedEvent;
  'destroyed': DestroyedEvent;
  'state-change': StateChangeEvent;
  'step-change': StepChangeEvent;
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
  emit<K extends keyof SDKEventMap>(event: K, data: SDKEventMap[K]): void;
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
  StepChangeEvent,
  WidgetClosedEvent,
  WidgetMode,
  WidgetOpenedEvent,
  WidgetTheme,
};
