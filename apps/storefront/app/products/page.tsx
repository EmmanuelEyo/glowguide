import type { Metadata } from 'next';
import { PRODUCTS } from '@/lib/products';
import ProductGrid from './components/ProductGrid';

export const metadata: Metadata = {
  title: 'All Products - Luma Beauty',
  description: 'Explore our curated range of serums, moisturisers, toners, SPF, cleansers, eye care, and masks.',
};

export default function ProductsPage() {
  return (
    <>
      {/* Page header */}
      <section className="py-16 bg-luma-page border-b border-luma-border">
        <div className="container">
          <p className="font-sans text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-3">
            Our Collection
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-light leading-[1.1] tracking-[-0.025em] text-luma-ink mb-4">
            Skincare
          </h1>
          <p className="text-[1.0625rem] text-luma-secondary leading-relaxed max-w-[480px]">
            Premium formulas for every skin concern. Use GlowGuide to find your personalised recommendations.
          </p>
        </div>
      </section>

      {/* Client product grid with filter + sort */}
      <ProductGrid products={PRODUCTS} />
    </>
  );
}
