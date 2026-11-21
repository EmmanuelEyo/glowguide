import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GlowGuideSDK, createGlowGuide } from '../GlowGuideSDK';
import { validateConfig, normalizeConfig } from '../config';

describe('GlowGuide SDK', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-widget-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Configuration validation & normalization', () => {
    it('validates required storeId', () => {
      expect(() => {
        validateConfig({} as unknown as { storeId: string });
      }).toThrow(/storeId/i);
    });

    it('normalizes valid configuration defaults', () => {
      const config = normalizeConfig({ storeId: 'luma-demo' });
      expect(config.storeId).toBe('luma-demo');
      expect(config.mode).toBe('floating');
      expect(config.theme).toBe('light');
      expect(config.brandName).toBe('GlowGuide');
      expect(config.primaryColor).toBe('#A7685E');
    });

    it('preserves custom configuration parameters', () => {
      const config = normalizeConfig({
        storeId: 'aurora-botanicals',
        mode: 'inline',
        brandName: 'Aurora',
        primaryColor: '#2D6A4F',
        theme: 'dark',
      });
      expect(config.mode).toBe('inline');
      expect(config.brandName).toBe('Aurora');
      expect(config.primaryColor).toBe('#2D6A4F');
      expect(config.theme).toBe('dark');
    });
  });

  describe('Instance lifecycle & state', () => {
    it('initializes instance and transitions lifecycle state', async () => {
      const sdk = createGlowGuide({
        storeId: 'luma-store',
        mode: 'inline',
        container: '#test-widget-container',
      });

      expect(sdk.lifecycleState).toBe('uninitialized');

      await sdk.init();
      expect(sdk.lifecycleState).toBe('mounted');

      const state = sdk.getState();
      expect(state.lifecycleState).toBe('mounted');
      expect(state.config.storeId).toBe('luma-store');

      sdk.destroy();
      expect(sdk.lifecycleState).toBe('destroyed');
    });

    it('supports static GlowGuideSDK.init helper', async () => {
      const sdk = await GlowGuideSDK.init({
        storeId: 'test-merchant',
        mode: 'inline',
        container: '#test-widget-container',
      });

      expect(sdk.lifecycleState).toBe('mounted');
      expect(sdk.config.storeId).toBe('test-merchant');

      sdk.destroy();
      expect(sdk.lifecycleState).toBe('destroyed');
    });

    it('toggles visibility correctly in floating mode', async () => {
      const sdk = await GlowGuideSDK.init({
        storeId: 'test-merchant',
        mode: 'floating',
      });

      expect(sdk.isOpen).toBe(false);

      sdk.open();
      expect(sdk.isOpen).toBe(true);

      sdk.close();
      expect(sdk.isOpen).toBe(false);

      sdk.toggle();
      expect(sdk.isOpen).toBe(true);

      sdk.destroy();
    });

    it('registers and emits typed events through SDK event bus', async () => {
      const sdk = await GlowGuideSDK.init({
        storeId: 'test-merchant',
        mode: 'inline',
        container: '#test-widget-container',
      });

      const onStepChange = vi.fn();
      sdk.on('step-change', onStepChange);

      sdk.emit('step-change', {
        previousStep: 'welcome',
        currentStep: 'consent',
        sessionId: 's1',
        timestamp: '2026-11-21T12:00:00Z',
      });

      expect(onStepChange).toHaveBeenCalledWith(
        expect.objectContaining({
          previousStep: 'welcome',
          currentStep: 'consent',
        })
      );

      sdk.destroy();
    });

    it('cleans up mount container and dispatches destroyed event on destroy', async () => {
      const onDestroyed = vi.fn();
      const sdk = await GlowGuideSDK.init({
        storeId: 'test-merchant',
        mode: 'inline',
        container: '#test-widget-container',
      });

      sdk.on('destroyed', onDestroyed);
      sdk.destroy();

      expect(onDestroyed).toHaveBeenCalledTimes(1);
      expect(sdk.lifecycleState).toBe('destroyed');
    });
  });
});
