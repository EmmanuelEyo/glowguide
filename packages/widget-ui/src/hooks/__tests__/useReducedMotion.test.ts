import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReducedMotion } from '../useReducedMotion';

type ChangeHandler = (e: MediaQueryListEvent) => void;

function makeMockMq(matches: boolean) {
  const listeners: ChangeHandler[] = [];
  const mq = {
    matches,
    addEventListener: vi.fn((_: string, fn: ChangeHandler) => { listeners.push(fn); }),
    removeEventListener: vi.fn((_: string, fn: ChangeHandler) => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    fire(newMatches: boolean) {
      listeners.forEach((fn) => fn({ matches: newMatches } as MediaQueryListEvent));
    },
  };
  return mq;
}

describe('useReducedMotion', () => {
  let mockMq: ReturnType<typeof makeMockMq>;

  beforeEach(() => {
    mockMq = makeMockMq(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => mockMq),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when prefers-reduced-motion does not match', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion matches initially', () => {
    mockMq = makeMockMq(true);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => mockMq),
    });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query fires a change event', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      mockMq.fire(true);
    });

    expect(result.current).toBe(true);
  });
});
