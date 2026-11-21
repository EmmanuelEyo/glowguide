import { describe, it, expect } from 'vitest';
import { getRecommendations, DEFAULT_PRODUCTS } from '../recommendationEngine';
import type { AnalysisResult, Product } from '../../types/widget';

describe('recommendationEngine service', () => {
  const mockAnalysisResult: AnalysisResult = {
    scenarioId: 'dry-hydration-needed',
    scenarioName: 'Barrier Dehydration',
    observations: [],
    generatedAt: new Date().toISOString(),
  };

  it('generates recommended products sorted by routine step order', () => {
    const recommendations = getRecommendations(mockAnalysisResult);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('matchScore');
    expect(recommendations[0]).toHaveProperty('matchReason');
    expect(recommendations[0]).toHaveProperty('routineStep');

    // Verify routine ordering: prep -> treat -> hydrate -> protect
    const steps = recommendations.map((r) => r.routineStep);
    for (let i = 0; i < steps.length - 1; i++) {
      const stepOrder: Record<string, number> = { prep: 1, treat: 2, hydrate: 3, protect: 4 };
      expect(stepOrder[steps[i]]).toBeLessThanOrEqual(stepOrder[steps[i + 1]]);
    }
  });

  it('falls back to default balanced recommendations when analysis result is null', () => {
    const recommendations = getRecommendations(null);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r) => r.id === 'lumiere-hydrating-serum')).toBe(true);
  });

  it('supports custom merchant catalog matching', () => {
    const customCatalog: Product[] = [
      {
        id: 'velvet-repair-moisturiser',
        name: 'Custom Velvet Repair',
        brand: 'Custom Merchant',
        description: 'Custom description',
        price: 50,
        category: 'moisturisers',
        tags: ['dry-skin'],
      },
    ];

    const recommendations = getRecommendations(mockAnalysisResult, customCatalog);

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].brand).toBe('Custom Merchant');
    expect(recommendations[0].id).toBe('velvet-repair-moisturiser');
  });
});
