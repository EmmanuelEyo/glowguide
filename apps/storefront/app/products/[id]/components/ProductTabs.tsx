'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const TABS = [
  {
    id: 'details',
    label: 'Details',
    content: `A concentrated formula designed to visibly improve skin texture and tone over 4-6 weeks of consistent use. Dermatologist-tested. Suitable for all skin types. Free from parabens, sulphates, and synthetic fragrance. Cruelty-free and vegan.`,
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    content: `Aqua, Glycerin, Sodium Hyaluronate (3 molecular weights), Niacinamide, Panthenol, Tocopherol (Vitamin E), Allantoin, Centella Asiatica Extract, Beta-Glucan, Ceramide NP, Phytosphingosine, Carbomer, Sodium Hydroxide, Ethylhexylglycerin, Phenoxyethanol.`,
  },
  {
    id: 'how-to-use',
    label: 'How to Use',
    content: `Apply 2-3 drops to cleansed skin morning and evening before moisturiser. Gently press into skin using fingertips. For best results, follow with Petal SPF 50 in the morning and Velvet Repair Moisturiser at night.`,
  },
];

export default function ProductTabs() {
  const [active, setActive] = useState('details');
  const current = TABS.find((t) => t.id === active)!;

  return (
    <div className="mt-12">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Product information"
        className="flex border-b border-luma-border"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-6 py-3 text-[0.6875rem] font-medium tracking-[0.08em] uppercase -mb-px transition-colors',
              active === tab.id
                ? 'text-luma-ink border-b-2 border-luma-accent'
                : 'text-luma-ghost border-b-2 border-transparent hover:text-luma-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="py-6 text-base text-luma-secondary leading-relaxed max-w-[640px]"
      >
        {current.content}
      </div>
    </div>
  );
}
