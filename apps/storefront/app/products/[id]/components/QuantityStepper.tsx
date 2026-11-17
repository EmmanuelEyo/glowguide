'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value?: number;
  onChange?: (qty: number) => void;
  min?: number;
}

export default function QuantityStepper({ value, onChange, min = 1 }: QuantityStepperProps) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalQty, setInternalQty] = useState(min);
  const qty = isControlled ? value : internalQty;

  function decrement() {
    const next = Math.max(min, qty - 1);
    if (isControlled) onChange(next);
    else setInternalQty(next);
  }

  function increment() {
    const next = qty + 1;
    if (isControlled) onChange(next);
    else setInternalQty(next);
  }

  return (
    <div className="inline-flex items-center border border-luma-border rounded-[4px] overflow-hidden h-11">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={qty <= min}
        className={cn(
          'w-11 h-11 flex items-center justify-center text-xl font-light transition-colors',
          qty <= min
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
        onClick={increment}
        className="w-11 h-11 flex items-center justify-center text-xl font-light text-luma-ink hover:bg-luma-subtle transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  );
}

