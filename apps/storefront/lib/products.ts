import type { Product } from '@/types/product';

export type { Product };

export const PRODUCTS: Product[] = [
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

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const same = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...same, ...others].slice(0, limit);
}
