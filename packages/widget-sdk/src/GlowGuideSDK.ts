import type {
  GlowGuideConfig,
  GlowGuideInstance,
  MountHandle,
  SDKEventMap,
  SDKLifecycleState,
  SDKState,
  SessionStepId,
} from './types';
import { normalizeConfig, validateConfig } from './config';
import { EventEmitter } from './events';
import { mountWidget } from './mount';

export const SDK_VERSION = '0.1.0';

function generateSessionId(): string {
  return 'sdk_' + Math.random().toString(36).substring(2, 11);
}

export class GlowGuideSDK implements GlowGuideInstance {
  private _lifecycleState: SDKLifecycleState = 'uninitialized';
  private _isOpen = false;
  private _config: Readonly<GlowGuideConfig> | null = null;
  private _sessionId: string | null = null;
  private _events: EventEmitter = new EventEmitter();
  private _cleanupFns: Array<() => void> = [];
  private _mountHandle: MountHandle | null = null;
  private _mountContainer: HTMLElement | null = null;
  private _lastDispatchedKey = '';
  private _lastDispatchedTime = 0;

  constructor(config?: GlowGuideConfig) {
    if (config) {
      // Synchronous validation on constructor call if config provided
      const validated = validateConfig(config);
      this._config = normalizeConfig(validated);
    }
  }

  get lifecycleState(): SDKLifecycleState {
    return this._lifecycleState;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get config(): Readonly<GlowGuideConfig> {
    if (!this._config) {
      throw new Error('GlowGuide SDK Error: SDK has not been configured yet. Call init() first.');
    }
    return this._config;
  }

  get mountContainer(): HTMLElement | null {
    return this._mountContainer;
  }

  async init(rawConfig?: GlowGuideConfig): Promise<GlowGuideInstance> {
    if (this._lifecycleState === 'destroyed') {
      throw new Error(
        'GlowGuide SDK Error: Cannot re-initialize a destroyed SDK instance. Create a new instance instead.',
      );
    }

    if (this._lifecycleState === 'ready' || this._lifecycleState === 'mounted') {
      console.warn('GlowGuide SDK: SDK is already initialized. Returning existing instance.');
      return this;
    }

    const configToValidate = rawConfig || this._config;
    if (!configToValidate) {
      throw new Error('GlowGuide SDK Error: Configuration must be provided to init().');
    }

    const validated = validateConfig(configToValidate);
    this._config = normalizeConfig(validated);
    this._sessionId = generateSessionId();

    // Setup browser DOM CustomEvent listeners for decoupled widget events
    this.setupDomEventListeners();

    const previousState = this._lifecycleState;
    this._lifecycleState = 'ready';

    const timestamp = new Date().toISOString();

    // Notify state change and ready
    this.dispatchSdkEvent('state-change', {
      previous: previousState,
      current: 'ready',
      timestamp,
    });

    this.dispatchSdkEvent('ready', {
      instance: this,
      timestamp,
    });

    // Auto-mount by default unless explicitly disabled or in non-DOM environment
    if (typeof window !== 'undefined' && this._config.autoMount !== false) {
      await this.mount();
    }

    if (this._config.autoOpen) {
      this.open();
    }

    return this;
  }

  async mount(target?: HTMLElement | string): Promise<GlowGuideInstance> {
    this.assertNotDestroyed();
    this.assertInitialized();

    if (this._lifecycleState === 'mounted') {
      console.warn('GlowGuide SDK: Widget is already mounted. Call unmount() first to remount.');
      return this;
    }

    const targetCandidate = target || this.config.container;
    this._mountHandle = mountWidget({
      config: this.config,
      target: targetCandidate,
      onEvent: (event, data) => {
        this.dispatchSdkEvent(event, data);
      },
    });

    this._mountContainer = this._mountHandle.container;
    const previousState = this._lifecycleState;
    this._lifecycleState = 'mounted';

    const timestamp = new Date().toISOString();
    this.dispatchSdkEvent('mounted', {
      container: this._mountContainer,
      mode: this.config.mode || 'floating',
      timestamp,
    });
    this.dispatchSdkEvent('state-change', {
      previous: previousState,
      current: 'mounted',
      timestamp,
    });

    return this;
  }

  unmount(): void {
    if (this._lifecycleState !== 'mounted' || !this._mountHandle) {
      return;
    }

    this._mountHandle.unmount();
    this._mountHandle = null;
    this._mountContainer = null;
    this._isOpen = false;

    const previousState = this._lifecycleState;
    this._lifecycleState = 'ready';

    const timestamp = new Date().toISOString();
    this.dispatchSdkEvent('unmounted', { timestamp });
    this.dispatchSdkEvent('state-change', {
      previous: previousState,
      current: 'ready',
      timestamp,
    });
  }

  open(): void {
    this.assertNotDestroyed();
    this.assertInitialized();

    if (this._isOpen) return;

    this._isOpen = true;
    const timestamp = new Date().toISOString();

    if (this._mountHandle) {
      this._mountHandle.open();
    }

    this.dispatchSdkEvent('opened', { timestamp, sessionId: this._sessionId || undefined });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:open', {
          detail: { sessionId: this._sessionId, timestamp },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  close(): void {
    this.assertNotDestroyed();
    this.assertInitialized();

    if (!this._isOpen) return;

    this._isOpen = false;
    const timestamp = new Date().toISOString();

    if (this._mountHandle) {
      this._mountHandle.close();
    }

    this.dispatchSdkEvent('closed', { timestamp, sessionId: this._sessionId || undefined });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:close', {
          detail: { sessionId: this._sessionId, timestamp },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setStep(step: SessionStepId): void {
    this.assertNotDestroyed();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:command:set-step', {
          detail: { step },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  reset(): void {
    this.assertNotDestroyed();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:command:reset', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  destroy(): void {
    if (this._lifecycleState === 'destroyed') return;

    if (this._lifecycleState === 'mounted') {
      this.unmount();
    }

    const previousState = this._lifecycleState;

    if (this._isOpen) {
      this.close();
    }

    // Run all registered DOM and cleanup callbacks
    for (const cleanup of this._cleanupFns) {
      try {
        cleanup();
      } catch (err) {
        console.error('GlowGuide SDK: Error during cleanup:', err);
      }
    }
    this._cleanupFns = [];

    this._lifecycleState = 'destroyed';
    const timestamp = new Date().toISOString();

    this.dispatchSdkEvent('destroyed', { timestamp });
    this.dispatchSdkEvent('state-change', {
      previous: previousState,
      current: 'destroyed',
      timestamp,
    });

    // Clear event listeners after emitting final destruction events
    this._events.clear();
  }

  getState(): SDKState {
    return {
      lifecycleState: this._lifecycleState,
      isOpen: this._isOpen,
      config: this._config || ({} as Readonly<GlowGuideConfig>),
      sessionId: this._sessionId,
      mountContainer: this._mountContainer,
      version: SDK_VERSION,
    };
  }

  getConfig(): Readonly<GlowGuideConfig> {
    return this.config;
  }

  on<K extends keyof SDKEventMap>(
    event: K,
    handler: (data: SDKEventMap[K]) => void,
  ): () => void {
    this.assertNotDestroyed();
    return this._events.on(event, handler);
  }

  off<K extends keyof SDKEventMap>(
    event: K,
    handler: (data: SDKEventMap[K]) => void,
  ): void {
    this._events.off(event, handler);
  }

  once<K extends keyof SDKEventMap>(
    event: K,
    handler: (data: SDKEventMap[K]) => void,
  ): () => void {
    this.assertNotDestroyed();
    return this._events.once(event, handler);
  }

  emit<K extends keyof SDKEventMap>(event: K, data: SDKEventMap[K]): void {
    this.assertNotDestroyed();
    this.dispatchSdkEvent(event, data);
  }

  private dispatchSdkEvent<K extends keyof SDKEventMap>(event: K, data: SDKEventMap[K]): void {
    if (this._lifecycleState === 'destroyed' && event !== 'destroyed' && event !== 'state-change') return;

    // Deduplicate identical events arriving within 25ms (e.g. direct mount bridge + DOM CustomEvent)
    const key = `${String(event)}_${JSON.stringify(data)}`;
    const now = Date.now();
    if (this._lastDispatchedKey === key && now - this._lastDispatchedTime < 25) {
      return;
    }
    this._lastDispatchedKey = key;
    this._lastDispatchedTime = now;

    if (event === 'opened') {
      this._isOpen = true;
    } else if (event === 'closed') {
      this._isOpen = false;
    }

    // 1. Emit to active EventEmitter listeners
    this._events.emit(event, data);

    // 2. Invoke matching config callback with isolated error protection
    if (this._config) {
      try {
        switch (event) {
          case 'ready':
            this._config.onReady?.(data as SDKEventMap['ready']);
            break;
          case 'mounted':
            this._config.onMounted?.(data as SDKEventMap['mounted']);
            break;
          case 'unmounted':
            this._config.onUnmounted?.(data as SDKEventMap['unmounted']);
            break;
          case 'destroyed':
            this._config.onDestroyed?.(data as SDKEventMap['destroyed']);
            break;
          case 'state-change':
            this._config.onStateChange?.(data as SDKEventMap['state-change']);
            break;
          case 'opened':
            this._config.onOpened?.(data as SDKEventMap['opened']);
            break;
          case 'closed':
            this._config.onClosed?.(data as SDKEventMap['closed']);
            break;
          case 'step-change':
            this._config.onStepChange?.(data as SDKEventMap['step-change']);
            break;
          case 'consent-given':
            this._config.onConsentGiven?.(data as SDKEventMap['consent-given']);
            break;
          case 'scan-started':
            this._config.onScanStarted?.(data as SDKEventMap['scan-started']);
            break;
          case 'scan-complete':
            this._config.onScanComplete?.(data as SDKEventMap['scan-complete']);
            break;
          case 'camera-error':
            this._config.onCameraError?.(data as SDKEventMap['camera-error']);
            break;
          case 'add-to-cart':
            this._config.onAddToCart?.(data as SDKEventMap['add-to-cart']);
            break;
          case 'checkout-request':
            this._config.onCheckoutRequest?.(data as SDKEventMap['checkout-request']);
            break;
        }
      } catch (err) {
        console.error(`GlowGuide SDK: Error in config callback for event "${String(event)}":`, err);
      }
    }
  }

  private setupDomEventListeners(): void {
    if (typeof window === 'undefined') return;

    const eventNames: Array<{ dom: string; sdk: keyof SDKEventMap }> = [
      { dom: 'glowguide:add-to-cart', sdk: 'add-to-cart' },
      { dom: 'glowguide:checkout-request', sdk: 'checkout-request' },
      { dom: 'glowguide:consent-given', sdk: 'consent-given' },
      { dom: 'glowguide:scan-started', sdk: 'scan-started' },
      { dom: 'glowguide:scan-complete', sdk: 'scan-complete' },
      { dom: 'glowguide:camera-error', sdk: 'camera-error' },
      { dom: 'glowguide:step-change', sdk: 'step-change' },
      { dom: 'glowguide:opened', sdk: 'opened' },
      { dom: 'glowguide:closed', sdk: 'closed' },
    ];

    const listeners: Array<{ dom: string; handler: EventListener }> = [];

    for (const { dom, sdk } of eventNames) {
      const handler: EventListener = (e: Event) => {
        const customEvt = e as CustomEvent;
        if (customEvt.detail) {
          this.dispatchSdkEvent(sdk, customEvt.detail);
        }
      };
      window.addEventListener(dom, handler);
      listeners.push({ dom, handler });
    }

    this._cleanupFns.push(() => {
      for (const { dom, handler } of listeners) {
        window.removeEventListener(dom, handler);
      }
    });
  }

  private assertNotDestroyed(): void {
    if (this._lifecycleState === 'destroyed') {
      throw new Error(
        'GlowGuide SDK Error: Cannot invoke methods on a destroyed instance. Create a new instance instead.',
      );
    }
  }

  private assertInitialized(): void {
    if (this._lifecycleState === 'uninitialized') {
      throw new Error('GlowGuide SDK Error: SDK is not initialized. Call init() first.');
    }
  }

  static async init(config: GlowGuideConfig): Promise<GlowGuideSDK> {
    const instance = new GlowGuideSDK(config);
    await instance.init();
    return instance;
  }
}

export function createGlowGuide(config?: GlowGuideConfig): GlowGuideSDK {
  return new GlowGuideSDK(config);
}
