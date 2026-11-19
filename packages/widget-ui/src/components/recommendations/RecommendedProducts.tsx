'use client';

import { useState } from 'react';
import type { RecommendedProduct, RoutineStep } from '../../types/widget';

interface RecommendedProductsProps {
  recommendations: RecommendedProduct[];
  className?: string;
  onAddToCart?: (product: RecommendedProduct) => void;
}

const ROUTINE_STEP_LABELS: Record<RoutineStep, { stepNum: number; label: string; badge: string }> = {
  prep: {
    stepNum: 1,
    label: 'Cleanse & Prep',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  treat: {
    stepNum: 2,
    label: 'Target & Treat',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  hydrate: {
    stepNum: 3,
    label: 'Nourish & Hydrate',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  protect: {
    stepNum: 4,
    label: 'Daily Shield',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

export function RecommendedProducts({
  recommendations,
  className = '',
  onAddToCart,
}: RecommendedProductsProps) {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (product: RecommendedProduct) => {
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    onAddToCart?.(product);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  if (recommendations.length === 0) {
    return (
      <div className={`p-6 rounded-2xl bg-luma-subtle border border-luma-border text-center ${className}`}>
        <p className="text-xs text-luma-secondary leading-relaxed">
          No product recommendations matched yet. Complete your skin assessment to generate your tailored regimen.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} id="recommended-routine">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[0.6875rem] uppercase tracking-wider text-luma-accent font-semibold block">
            Targeted Regimen
          </span>
          <h4 className="font-display text-lg font-light text-luma-ink mt-0.5">
            Recommended Products
          </h4>
        </div>
        <span className="text-[0.625rem] font-medium text-luma-secondary bg-luma-subtle px-2.5 py-1 rounded-full border border-luma-border uppercase tracking-wider">
          {recommendations.length}-Step Routine
        </span>
      </div>

      <p className="text-xs text-luma-secondary leading-relaxed">
        Curated active formulations selected to address your diagnosed skin focus and moisture balance.
      </p>

      {/* Product List */}
      <div className="space-y-3 pt-1">
        {recommendations.map((product) => {
          const stepMeta = ROUTINE_STEP_LABELS[product.routineStep] || {
            stepNum: 1,
            label: product.routineStep,
            badge: 'bg-luma-subtle text-luma-secondary border-luma-border',
          };
          const isAdded = !!addedIds[product.id];

          return (
            <div
              key={product.id}
              className="p-3.5 rounded-xl bg-luma-subtle border border-luma-border flex flex-col gap-3 transition-colors hover:border-luma-border-strong"
            >
              {/* Card Header: Routine Step & Score */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[0.5625rem] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${stepMeta.badge}`}
                >
                  Step {stepMeta.stepNum}: {stepMeta.label}
                </span>

                <span className="text-[0.625rem] font-mono text-luma-accent font-medium">
                  {product.matchScore}% Match
                </span>
              </div>

              {/* Main Product Info */}
              <div className="flex items-start gap-3">
                {/* Visual Avatar */}
                <div
                  className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl shadow-inner border border-luma-border overflow-hidden"
                  style={{ background: product.gradient || 'linear-gradient(145deg, #F5E6D8, #C9A880)' }}
                >
                  <span aria-hidden="true">{product.emoji || '✦'}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block text-[0.625rem] uppercase tracking-wider text-luma-ghost">
                    {product.brand}
                  </span>
                  <h5 className="text-xs font-semibold text-luma-ink truncate">
                    {product.name}
                  </h5>
                  <p className="text-xs font-medium text-luma-ink mt-0.5">
                    £{product.price.toFixed(2)}
                  </p>
                </div>

                {/* Add to Bag Action */}
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className={`h-8 px-3 rounded-[3px] text-[0.625rem] font-medium tracking-[0.08em] uppercase transition-all shrink-0 flex items-center justify-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-luma-ink hover:bg-luma-accent text-luma-inverse'
                  }`}
                  aria-label={`Add ${product.name} to shopping bag`}
                >
                  {isAdded ? (
                    <>
                      <span aria-hidden="true">✓</span>
                      <span>Added</span>
                    </>
                  ) : (
                    <span>Add to Bag</span>
                  )}
                </button>
              </div>

              {/* Personalized Match Reason */}
              <div className="p-2.5 rounded-lg bg-luma-surface border border-luma-border text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-luma-accent text-xs" aria-hidden="true">✦</span>
                  <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-luma-accent">
                    Why It Matches Your Profile
                  </span>
                </div>
                <p className="text-[0.6875rem] text-luma-secondary leading-relaxed">
                  {product.matchReason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
