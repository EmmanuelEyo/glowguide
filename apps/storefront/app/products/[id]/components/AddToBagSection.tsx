'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import QuantityStepper from './QuantityStepper';

interface AddToBagSectionProps {
  productId: string;
  productName: string;
}

export default function AddToBagSection({ productId, productName }: AddToBagSectionProps) {
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCart();

  function handleAddToBag() {
    addItem(productId, qty);
    openCart();
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <QuantityStepper value={qty} onChange={setQty} />
      <button
        type="button"
        onClick={handleAddToBag}
        aria-label={`Add ${productName} to bag`}
        className="flex-1 min-w-[180px] h-11 bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse rounded-[4px] text-[0.6875rem] font-semibold tracking-[0.1em] uppercase transition-colors"
      >
        Add to Bag
      </button>
    </div>
  );
}
