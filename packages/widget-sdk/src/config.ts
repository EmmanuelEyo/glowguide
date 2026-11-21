import { isValidCssColor } from '@glowguide/widget-ui';
import type { GlowGuideConfig } from './types';

export const DEFAULT_CONFIG: Required<
  Pick<
    GlowGuideConfig,
    'mode' | 'primaryColor' | 'theme' | 'launcherPosition' | 'autoOpen' | 'shadowDom'
  >
> = {
  mode: 'floating',
  primaryColor: '#A7685E',
  theme: 'light',
  launcherPosition: 'bottom-right',
  autoOpen: false,
  shadowDom: true,
};

export function validateConfig(raw: unknown): GlowGuideConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('GlowGuide SDK Error: Configuration must be a non-null object.');
  }

  const config = raw as Record<string, unknown>;

  if (typeof config.storeId !== 'string' || config.storeId.trim().length === 0) {
    throw new Error('GlowGuide SDK Error: "storeId" is required and must be a non-empty string.');
  }

  if (config.mode !== undefined && config.mode !== 'floating' && config.mode !== 'inline') {
    throw new Error('GlowGuide SDK Error: "mode" must be either "floating" or "inline".');
  }

  if (config.theme !== undefined && config.theme !== 'light' && config.theme !== 'dark') {
    throw new Error('GlowGuide SDK Error: "theme" must be either "light" or "dark".');
  }

  if (
    config.launcherPosition !== undefined &&
    config.launcherPosition !== 'bottom-right' &&
    config.launcherPosition !== 'bottom-left'
  ) {
    throw new Error(
      'GlowGuide SDK Error: "launcherPosition" must be either "bottom-right" or "bottom-left".',
    );
  }

  if (config.primaryColor !== undefined) {
    if (typeof config.primaryColor !== 'string' || config.primaryColor.trim().length === 0) {
      throw new Error('GlowGuide SDK Error: "primaryColor" must be a non-empty CSS color string.');
    }
  }

  if (config.shadowDom !== undefined && typeof config.shadowDom !== 'boolean') {
    throw new Error('GlowGuide SDK Error: "shadowDom" must be a boolean.');
  }

  return raw as GlowGuideConfig;
}

export function normalizeConfig(config: GlowGuideConfig): Readonly<GlowGuideConfig> {
  const primaryColor =
    config.primaryColor && isValidCssColor(config.primaryColor)
      ? config.primaryColor.trim()
      : DEFAULT_CONFIG.primaryColor;

  const normalized: GlowGuideConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    storeId: config.storeId.trim(),
    brandName: config.brandName || 'GlowGuide',
    primaryColor,
    shadowDom: config.shadowDom !== false,
  };

  return Object.freeze(normalized);
}
