import type {
  AnalysisResult,
  Product,
  RecommendedProduct,
  RoutineStep,
} from '../types/widget';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'lumiere-hydrating-serum',
    name: 'Lumière Hydrating Serum',
    brand: 'Luma Beauty',
    description:
      '72-hour deep hydration with a triple hyaluronic acid complex. Lightweight gel texture absorbs instantly, plumping skin and reinforcing the moisture barrier.',
    price: 68,
    category: 'serums',
    tags: ['hydrating', 'all-skin-types', 'lightweight', 'sensitive-friendly'],
    gradient: 'linear-gradient(145deg, #F5E6D8, #E0C5A8, #C9A880)',
    emoji: '🫙',
  },
  {
    id: 'velvet-repair-moisturiser',
    name: 'Velvet Repair Moisturiser',
    brand: 'Luma Beauty',
    description:
      'Rich ceramide and shea butter formula that restores the skin barrier overnight. Clinically tested to reduce dryness by 60% in four weeks.',
    price: 85,
    category: 'moisturisers',
    tags: ['barrier-repair', 'dry-skin', 'nourishing', 'overnight'],
    gradient: 'linear-gradient(145deg, #EDE8E3, #D4C9BF, #BEB0A5)',
    emoji: '🧴',
  },
  {
    id: 'radiance-brightening-toner',
    name: 'Radiance Brightening Toner',
    brand: 'Luma Beauty',
    description:
      'Niacinamide and vitamin C complex toner that gently resurfaces and brightens in one step. Alcohol-free, suitable for daily use morning and evening.',
    price: 42,
    category: 'toners',
    tags: ['brightening', 'vitamin-c', 'niacinamide', 'daily-use'],
    gradient: 'linear-gradient(145deg, #FFF4ED, #FFDCC8, #F5B8A0)',
    emoji: '✨',
  },
  {
    id: 'petal-spf-50',
    name: 'Petal SPF 50',
    brand: 'Luma Beauty',
    description:
      'Mineral broad-spectrum SPF 50 with a weightless, invisible finish. Enriched with green tea antioxidants. No white cast, comfortable for daily wear under makeup.',
    price: 56,
    category: 'spf',
    tags: ['spf-50', 'mineral', 'daily-protection', 'makeup-compatible'],
    gradient: 'linear-gradient(145deg, #EDF2ED, #D1E0D1, #B4CCB4)',
    emoji: '☀️',
  },
  {
    id: 'calm-soothe-cleanser',
    name: 'Calm & Soothe Cleanser',
    brand: 'Luma Beauty',
    description:
      'Gentle micellar-gel cleanser with oat extract and aloe vera. Removes makeup and impurities without stripping the skin. pH-balanced for sensitive and reactive skin.',
    price: 38,
    category: 'cleansers',
    tags: ['sensitive', 'gentle', 'micellar', 'oat-extract'],
    gradient: 'linear-gradient(145deg, #EEF2F0, #D5E3DC, #B8CFC5)',
    emoji: '🌊',
  },
  {
    id: 'midnight-renewal-face-oil',
    name: 'Midnight Renewal Face Oil',
    brand: 'Luma Beauty',
    description:
      'Luxurious overnight facial oil with bakuchiol, rosehip, and sea buckthorn. Visibly reduces fine lines and improves skin tone while you sleep.',
    price: 95,
    category: 'serums',
    tags: ['anti-aging', 'bakuchiol', 'overnight', 'dry-skin'],
    gradient: 'linear-gradient(145deg, #2A2420, #4A3832, #6A5448)',
    emoji: '🌙',
  },
  {
    id: 'nourish-eye-contour-cream',
    name: 'Nourish Eye Contour Cream',
    brand: 'Luma Beauty',
    description:
      'Peptide-rich eye cream that targets dark circles, puffiness, and fine lines. Caffeine and vitamin K complex depuffs and brightens in four weeks.',
    price: 72,
    category: 'eye-care',
    tags: ['eye-care', 'peptides', 'dark-circles', 'anti-puffiness'],
    gradient: 'linear-gradient(145deg, #F8F3EE, #EDE3DA, #DCCFC4)',
    emoji: '👁',
  },
  {
    id: 'glow-exfoliating-mask',
    name: 'Glow Exfoliating Mask',
    brand: 'Luma Beauty',
    description:
      'AHA/BHA exfoliating clay mask with kaolin and lactic acid. Clears congestion, refines pores, and restores luminosity in a 10-minute weekly treatment.',
    price: 55,
    category: 'masks',
    tags: ['aha', 'bha', 'pore-refining', 'weekly-treatment'],
    gradient: 'linear-gradient(145deg, #FFFBF4, #FFE8C8, #F5CFA0)',
    emoji: '🌟',
  },
];

export const ROUTINE_ORDER: Record<RoutineStep, number> = {
  prep: 1,
  treat: 2,
  hydrate: 3,
  protect: 4,
};

interface ScenarioMatchConfig {
  productId: string;
  matchReason: string;
  routineStep: RoutineStep;
  matchScore: number;
}

const SCENARIO_RECOMMENDATION_RULES: Record<string, ScenarioMatchConfig[]> = {
  'balanced-glow': [
    {
      productId: 'radiance-brightening-toner',
      routineStep: 'prep',
      matchScore: 95,
      matchReason:
        'Niacinamide and vitamin C preserve daily luminosity and refine cellular texture.',
    },
    {
      productId: 'lumiere-hydrating-serum',
      routineStep: 'treat',
      matchScore: 92,
      matchReason:
        'Triple hyaluronic acid maintains optimal 82% surface hydration without heaviness.',
    },
    {
      productId: 'petal-spf-50',
      routineStep: 'protect',
      matchScore: 96,
      matchReason:
        'Weightless mineral SPF 50 shields against environmental aging and preserves radiance.',
    },
  ],
  'dry-hydration-needed': [
    {
      productId: 'lumiere-hydrating-serum',
      routineStep: 'treat',
      matchScore: 96,
      matchReason:
        'Instantly recharges depleted moisture reservoirs and plumps dehydrated fine lines.',
    },
    {
      productId: 'velvet-repair-moisturiser',
      routineStep: 'hydrate',
      matchScore: 98,
      matchReason:
        'Ceramides and nourishing shea butter actively rebuild the impaired skin barrier.',
    },
    {
      productId: 'midnight-renewal-face-oil',
      routineStep: 'treat',
      matchScore: 90,
      matchReason:
        'Rosehip and bakuchiol lock in intensive overnight hydration and restore lipid elasticity.',
    },
    {
      productId: 'petal-spf-50',
      routineStep: 'protect',
      matchScore: 88,
      matchReason:
        'Moisture-infused mineral shield prevents UV-induced moisture loss.',
    },
  ],
  'oil-clarifying': [
    {
      productId: 'calm-soothe-cleanser',
      routineStep: 'prep',
      matchScore: 92,
      matchReason:
        'pH-balanced micellar gel clears excess sebum without triggering reactive oil rebound.',
    },
    {
      productId: 'glow-exfoliating-mask',
      routineStep: 'treat',
      matchScore: 97,
      matchReason:
        'AHA/BHA clears pore congestion and refines central T-zone texture in 10 minutes.',
    },
    {
      productId: 'radiance-brightening-toner',
      routineStep: 'prep',
      matchScore: 94,
      matchReason:
        'Balances sebum output and reduces visible follicular prominence.',
    },
    {
      productId: 'petal-spf-50',
      routineStep: 'protect',
      matchScore: 90,
      matchReason:
        'Invisible, weightless finish provides non-comedogenic daily UV protection.',
    },
  ],
  'sensitive-soothing': [
    {
      productId: 'calm-soothe-cleanser',
      routineStep: 'prep',
      matchScore: 98,
      matchReason:
        'Gentle oat extract cleanses without friction or reactive micro-vascular flushing.',
    },
    {
      productId: 'lumiere-hydrating-serum',
      routineStep: 'treat',
      matchScore: 94,
      matchReason:
        'Hypoallergenic, fragrance-free formula calms and hydrates tender skin.',
    },
    {
      productId: 'velvet-repair-moisturiser',
      routineStep: 'hydrate',
      matchScore: 95,
      matchReason:
        'Soothes delicate skin barrier with gentle restorative biomimetic ceramides.',
    },
    {
      productId: 'petal-spf-50',
      routineStep: 'protect',
      matchScore: 96,
      matchReason:
        '100% mineral sunscreen formula ideal for reactive skin prone to redness.',
    },
  ],
};

/**
 * Deterministically computes product recommendations based on analysis results
 * and an optional custom catalog.
 */
export function getRecommendations(
  analysisResult: AnalysisResult | null,
  catalog: Product[] = DEFAULT_PRODUCTS,
): RecommendedProduct[] {
  const scenarioKey = analysisResult?.scenarioId || 'balanced-glow';
  const rules =
    SCENARIO_RECOMMENDATION_RULES[scenarioKey] ||
    SCENARIO_RECOMMENDATION_RULES['balanced-glow'];

  const matched: RecommendedProduct[] = [];

  for (const rule of rules) {
    const product = catalog.find((p) => p.id === rule.productId);
    if (product) {
      matched.push({
        ...product,
        matchReason: rule.matchReason,
        routineStep: rule.routineStep,
        matchScore: rule.matchScore,
      });
    }
  }

  // Sort logically by routine step: prep -> treat -> hydrate -> protect
  matched.sort(
    (a, b) => ROUTINE_ORDER[a.routineStep] - ROUTINE_ORDER[b.routineStep],
  );

  return matched;
}
