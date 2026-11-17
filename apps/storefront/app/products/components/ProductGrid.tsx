'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/types/product';
import { cn } from '@/lib/cn';

type Category = Product['category'] | 'all';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'serums', label: 'Serums' },
  { value: 'moisturisers', label: 'Moisturisers' },
  { value: 'toners', label: 'Toners' },
  { value: 'spf', label: 'SPF' },
  { value: 'cleansers', label: 'Cleansers' },
  { value: 'eye-care', label: 'Eye Care' },
  { value: 'masks', label: 'Masks' },
];

type SortKey = 'featured' | 'price-asc' | 'price-desc';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<SortKey>('featured');

  const filtered = useMemo(() => {
    let result = category === 'all' ? [...products] : products.filter((p) => p.category === category);
    if (sort === 'price-asc') result = result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result = result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, category, sort]);

  return (
    <>
      {/* GlowGuide banner */}
      <div className="bg-luma-blush-pale border-b border-luma-accent/15 py-4">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-luma-secondary">
            <strong className="font-semibold text-luma-ink">Not sure where to start?</strong>{' '}
            Our GlowGuide skin analysis finds your perfect match.
          </p>
          <button
            data-open-widget
            aria-label="Open GlowGuide skin analysis"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.625rem] font-medium tracking-[0.08em] uppercase shrink-0 transition-colors"
          >
            <span aria-hidden="true">✦</span> Analyse My Skin
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[68px] z-[300] bg-luma-surface/95 backdrop-blur-md border-b border-luma-border py-4">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          {/* Category pills */}
          <div role="group" aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                aria-pressed={category === cat.value}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[0.6875rem] tracking-[0.14em] uppercase border transition-colors',
                  category === cat.value
                    ? 'bg-luma-accent border-luma-accent text-luma-inverse'
                    : 'border-luma-border-mid text-luma-secondary hover:border-luma-accent hover:text-luma-accent',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center gap-4">
            <span
              className="text-[0.6875rem] tracking-[0.14em] uppercase text-luma-ghost whitespace-nowrap"
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="text-[0.6875rem] border border-luma-border-mid rounded-md px-3 py-1.5 bg-luma-surface text-luma-secondary cursor-pointer focus:outline-none focus:border-luma-accent"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section className="py-10 pb-24" aria-label="Product catalogue">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-luma-ghost" role="status">
              <p className="font-display text-[1.1rem] mb-3">No products found</p>
              <p className="text-sm">Try a different category filter.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filtered.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
