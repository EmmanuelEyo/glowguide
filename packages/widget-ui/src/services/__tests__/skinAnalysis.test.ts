import { describe, it, expect } from 'vitest';
import {
  analyzeSkin,
  MOCK_SCENARIOS,
  SCENARIO_KEYS,
  hashStringToScenario,
} from '../skinAnalysis';

describe('skinAnalysis service', () => {
  it('resolves with analysis result matching the scenario override', async () => {
    const result = await analyzeSkin({
      imageUrl: 'test-image',
      scenarioOverride: 'dry-hydration-needed',
      latencyMs: 10,
    });

    expect(result.scenarioId).toBe('dry-hydration-needed');
    expect(result.scenarioName).toBe(MOCK_SCENARIOS['dry-hydration-needed'].name);
    expect(result.observations.length).toBeGreaterThan(0);
    expect(result.observations[0]).toHaveProperty('label');
    expect(result.observations[0]).toHaveProperty('score');
  });

  it('deterministically maps identical image URL strings to identical scenarios', () => {
    const sampleUrl = 'data:image/jpeg;base64,sample-test-image-payload-xyz';
    const scenario1 = hashStringToScenario(sampleUrl);
    const scenario2 = hashStringToScenario(sampleUrl);

    expect(scenario1).toBe(scenario2);
    expect(SCENARIO_KEYS).toContain(scenario1);
  });

  it('rejects when simulateError option is passed', async () => {
    await expect(
      analyzeSkin({
        imageUrl: 'test-image',
        simulateError: 'IMAGE_UNREADABLE',
        latencyMs: 10,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'IMAGE_UNREADABLE',
      })
    );
  });

  it('rejects when request times out', async () => {
    await expect(
      analyzeSkin({
        imageUrl: 'test-image',
        latencyMs: 100,
        timeoutMs: 10,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'TIMEOUT',
      })
    );
  });

  it('rejects immediately when abort signal is triggered', async () => {
    const controller = new AbortController();
    const promise = analyzeSkin({
      imageUrl: 'test-image',
      latencyMs: 100,
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toEqual(
      expect.objectContaining({
        code: 'UNKNOWN',
        message: expect.stringMatching(/cancelled/i),
      })
    );
  });
});
