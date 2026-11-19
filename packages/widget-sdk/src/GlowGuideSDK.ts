import type {
  GlowGuideConfig,
  GlowGuideInstance,
  SDKEventMap,
  SDKLifecycleState,
  SDKState,
} from './types';
import { normalizeConfig, validateConfig } from './config';
import { EventEmitter } from './events';

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
    this._events.emit('state-change', {
      previous: previousState,
      current: 'ready',
    });

    this._events.emit('ready', {
      instance: this,
      timestamp,
    });

    if (this._config.autoOpen) {
      this.open();
    }

    return this;
  }

  open(): void {
    this.assertNotDestroyed();
    this.assertInitialized();

    if (this._isOpen) return;

    this._isOpen = true;
    const timestamp = new Date().toISOString();

    this._events.emit('opened', { timestamp });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:open', {
          detail: { sessionId: this._sessionId, timestamp },
          bubbles: true,
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

    this._events.emit('closed', { timestamp });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('glowguide:close', {
          detail: { sessionId: this._sessionId, timestamp },
          bubbles: true,
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

  destroy(): void {
    if (this._lifecycleState === 'destroyed') return;

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

    this._events.emit('destroyed', { timestamp });
    this._events.emit('state-change', {
      previous: previousState,
      current: 'destroyed',
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

  private setupDomEventListeners(): void {
    if (typeof window === 'undefined') return;

    const onAddToCart = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail) {
        this._events.emit('add-to-cart', customEvt.detail);
        this._config?.onAddToCart?.(customEvt.detail);
      }
    };

    const onCheckoutRequest = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail) {
        this._events.emit('checkout-request', customEvt.detail);
        this._config?.onCheckoutRequest?.(customEvt.detail);
      }
    };

    window.addEventListener('glowguide:add-to-cart', onAddToCart);
    window.addEventListener('glowguide:checkout-request', onCheckoutRequest);

    this._cleanupFns.push(() => {
      window.removeEventListener('glowguide:add-to-cart', onAddToCart);
      window.removeEventListener('glowguide:checkout-request', onCheckoutRequest);
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
