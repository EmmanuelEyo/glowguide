import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../events';

describe('EventEmitter', () => {
  it('registers listener and receives emitted event data', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('opened', handler);
    emitter.emit('opened', { timestamp: '2026-11-21T12:00:00Z', sessionId: 'sess_123' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      timestamp: '2026-11-21T12:00:00Z',
      sessionId: 'sess_123',
    });
  });

  it('unsubscribes via returned function', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    const unsubscribe = emitter.on('closed', handler);
    emitter.emit('closed', { timestamp: '2026-11-21T12:00:00Z' });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitter.emit('closed', { timestamp: '2026-11-21T12:01:00Z' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes via off method', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('opened', handler);
    emitter.off('opened', handler);
    emitter.emit('opened', { timestamp: '2026-11-21T12:00:00Z' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('handles once listeners by executing only on first emit', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.once('consent-given', handler);
    emitter.emit('consent-given', { timestamp: '2026-11-21T12:00:00Z', sessionId: 's1' });
    emitter.emit('consent-given', { timestamp: '2026-11-21T12:01:00Z', sessionId: 's2' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ timestamp: '2026-11-21T12:00:00Z', sessionId: 's1' });
  });

  it('protects subsequent handlers when one handler throws an error', () => {
    const emitter = new EventEmitter();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const failingHandler = vi.fn().mockImplementation(() => {
      throw new Error('Handler crashed intentionally');
    });
    const healthyHandler = vi.fn();

    emitter.on('opened', failingHandler);
    emitter.on('opened', healthyHandler);

    expect(() => {
      emitter.emit('opened', { timestamp: '2026-11-21T12:00:00Z' });
    }).not.toThrow();

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(healthyHandler).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('clears all listeners with clear()', () => {
    const emitter = new EventEmitter();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    emitter.on('opened', handler1);
    emitter.on('closed', handler2);

    emitter.clear();

    emitter.emit('opened', { timestamp: '2026-11-21T12:00:00Z' });
    emitter.emit('closed', { timestamp: '2026-11-21T12:00:00Z' });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('does not throw when emitting to an event with no listeners', () => {
    const emitter = new EventEmitter();
    expect(() => {
      emitter.emit('scan-started', { sessionId: 's1', timestamp: '2026-11-21T12:00:00Z' });
    }).not.toThrow();
  });
});
