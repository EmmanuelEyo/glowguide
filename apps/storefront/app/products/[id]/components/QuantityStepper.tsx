'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export default function QuantityStepper() {
  const [qty, setQty] = useState(1);

  return (
    <div className="inline-flex items-center border border-luma-border rounded-[4px] overflow-hidden h-11">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        disabled={qty <= 1}
        className={cn(
          'w-11 h-11 flex items-center justify-center text-xl font-light transition-colors',
          qty <= 1
            ? 'text-luma-disabled cursor-not-allowed'
            : 'text-luma-ink hover:bg-luma-subtle cursor-pointer',
        )}
      >
        &minus;
      </button>
      <span
        aria-live="polite"
        aria-label={`Quantity: ${qty}`}
        className="min-w-[40px] text-center text-base font-medium text-luma-ink select-none"
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty((q) => q + 1)}
        className="w-11 h-11 flex items-center justify-center text-xl font-light text-luma-ink hover:bg-luma-subtle transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
