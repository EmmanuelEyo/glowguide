import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlowGuideSDK } from '../useGlowGuideSDK';

describe('useGlowGuideSDK', () => {
  it('mounts with initial state and reports isMounted true', () => {
    const { result } = renderHook(() => useGlowGuideSDK());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentStep).toBe('welcome');
  });

  it('dispatches open and close command events on programmatic calls', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useGlowGuideSDK());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'glowguide:command:open',
      })
    );

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'glowguide:command:close',
      })
    );

    dispatchSpy.mockRestore();
  });

  it('toggles visibility state with toggle()', () => {
    const { result } = renderHook(() => useGlowGuideSDK());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('updates step and notifies callback on window step-change event', () => {
    const onStepChange = vi.fn();
    const { result } = renderHook(() => useGlowGuideSDK({ onStepChange }));

    act(() => {
      window.dispatchEvent(
        new CustomEvent('glowguide:step-change', {
          detail: {
            previousStep: 'welcome',
            currentStep: 'consent',
            sessionId: 'sess_123',
            timestamp: new Date().toISOString(),
          },
        })
      );
    });

    expect(result.current.currentStep).toBe('consent');
    expect(onStepChange).toHaveBeenCalledWith(
      expect.objectContaining({
        previousStep: 'welcome',
        currentStep: 'consent',
      })
    );
  });

  it('forwards commerce callbacks when add-to-cart CustomEvent fires', () => {
    const onAddToCart = vi.fn();
    renderHook(() => useGlowGuideSDK({ onAddToCart }));

    act(() => {
      window.dispatchEvent(
        new CustomEvent('glowguide:add-to-cart', {
          detail: {
            productId: 'lumiere-hydrating-serum',
            quantity: 2,
            timestamp: new Date().toISOString(),
            sessionId: 'sess_123',
          },
        })
      );
    });

    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'lumiere-hydrating-serum',
        quantity: 2,
      })
    );
  });

  it('cleans up event listeners on unmount', () => {
    const onStepChange = vi.fn();
    const { unmount } = renderHook(() => useGlowGuideSDK({ onStepChange }));

    unmount();

    act(() => {
      window.dispatchEvent(
        new CustomEvent('glowguide:step-change', {
          detail: {
            previousStep: 'welcome',
            currentStep: 'report',
            sessionId: 'sess_123',
            timestamp: new Date().toISOString(),
          },
        })
      );
    });

    expect(onStepChange).not.toHaveBeenCalled();
  });
});
