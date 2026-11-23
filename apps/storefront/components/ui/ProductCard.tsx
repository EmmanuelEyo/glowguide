'use client';

import Link from 'next/link';
import type { Product } from '@/types/product';
import { cn } from '@/lib/cn';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { id, name, description, price, category, tags, gradient, emoji } = product;
  const { addItem, openCart } = useCart();

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(id, 1);
    openCart();
  }

  return (
    <article className="h-full">
      <Link
        href={`/products/${id}`}
        className="group flex flex-col h-full bg-luma-surface rounded-md border border-luma-border overflow-hidden transition-all duration-[240ms] hover:shadow-md hover:-translate-y-0.5"
      >
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden shrink-0',
            compact ? 'h-[180px]' : 'h-[220px]',
          )}
          style={{ background: gradient }}
          aria-hidden="true"
        >
          <span
            className={cn(
              'block transition-transform duration-[400ms] group-hover:scale-110',
              compact ? 'text-[48px]' : 'text-[60px]',
            )}
          >
            {emoji}
          </span>
        </div>

        <div className={cn('flex flex-col flex-1', compact ? 'p-3.5' : 'p-5')}>
          <p className="text-[0.6875rem] tracking-[0.14em] uppercase text-luma-ghost mb-2">
            {category.replace('-', ' ')}
          </p>

          <h3
            className={cn(
              'font-display font-light leading-snug text-luma-ink mb-2',
              compact ? 'text-base' : 'text-[1.15rem]',
            )}
          >
            {name}
          </h3>

          {!compact && (
            <p className="text-[0.6875rem] text-luma-secondary leading-relaxed mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {!compact && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium tracking-[0.06em] uppercase bg-luma-blush-pale text-luma-accent border border-luma-blush"
                >
                  {tag.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-luma-border">
            <span className="text-[1.0625rem] font-medium text-luma-ink">
              ${price}
            </span>

            <button
              aria-label={`Add ${name} to bag`}
              onClick={handleQuickAdd}
              className={cn(
                'inline-flex items-center justify-center rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.625rem] font-medium tracking-[0.08em] uppercase transition-colors hover:bg-luma-accent hover:border-luma-accent hover:text-luma-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-2',
                compact ? 'h-8 px-3' : 'h-9 px-4',
              )}
            >
              {compact ? 'Add' : 'Quick Add'}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
