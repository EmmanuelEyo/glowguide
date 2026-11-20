import { GlowGuideSDK, createGlowGuide, SDK_VERSION } from './GlowGuideSDK';
import { validateConfig, normalizeConfig, DEFAULT_CONFIG } from './config';
import { EventEmitter } from './events';
import { mountWidget } from './mount';

export * from './types';
export {
  GlowGuideSDK,
  createGlowGuide,
  SDK_VERSION,
  validateConfig,
  normalizeConfig,
  DEFAULT_CONFIG,
  EventEmitter,
  mountWidget,
};

// Global browser window attachment
declare global {
  interface Window {
    GlowGuide?: typeof GlowGuideSDK & {
      init: typeof GlowGuideSDK.init;
      create: typeof createGlowGuide;
      version: string;
    };
  }
}

if (typeof window !== 'undefined') {
  const GlobalGlowGuide = Object.assign(GlowGuideSDK, {
    init: GlowGuideSDK.init,
    create: createGlowGuide,
    version: SDK_VERSION,
  });

  window.GlowGuide = GlobalGlowGuide;
}

export default GlowGuideSDK;
