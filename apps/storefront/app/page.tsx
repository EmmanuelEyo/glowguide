import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/lib/products';

export const instant = false;

const BESTSELLERS = ['lumiere-hydrating-serum', 'velvet-repair-moisturiser', 'petal-spf-50', 'calm-soothe-cleanser'];
const bestsellers = PRODUCTS.filter((p) => BESTSELLERS.includes(p.id));

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="min-h-[85vh] flex items-center py-24 bg-gradient-to-b from-luma-page to-luma-surface"
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div>
              <p className="font-sans text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-4">
                Luma Beauty - Powered by GlowGuide
              </p>

              <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1.1] tracking-[-0.025em] text-luma-ink mb-6">
                Beauty That
                <br />
                <em className="italic text-luma-accent">
                  Understands
                </em>
                <br />
                You.
              </h1>

              <p className="text-[1.0625rem] text-luma-secondary leading-relaxed max-w-[420px] mb-10">
                Discover your personalised skincare routine through our guided skin-discovery experience. Curated formulas for your unique skin profile.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.14em] uppercase transition-colors whitespace-nowrap"
                >
                  Shop All Products
                </Link>
                <button
                  data-open-widget
                  aria-label="Open GlowGuide skin analysis"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.14em] uppercase hover:bg-luma-subtle transition-colors whitespace-nowrap"
                >
                  <span aria-hidden="true">✦</span> Analyse My Skin
                </button>
              </div>
            </div>

            {/* Hero art */}
            <div
              className="flex justify-center items-center"
              aria-hidden="true"
            >
              <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-[32px] bg-[linear-gradient(145deg,#E8C9C0_0%,#D5A898_40%,#A7685E_100%)] relative overflow-hidden shadow-xl">
                {/* Decorative circles */}
                <div className="absolute w-[260px] h-[260px] rounded-full bg-white/10 -top-[60px] -right-[60px]" />
                <div className="absolute w-[180px] h-[180px] rounded-full bg-white/[0.08] bottom-5 -left-[40px]" />
                {/* GlowGuide mark */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
                  <span className="text-[64px] leading-none">✦</span>
                  <span className="text-[11px] tracking-[0.14em] uppercase font-medium">
                    GlowGuide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bestsellers ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 pb-24 bg-luma-page"
        aria-labelledby="bestsellers-heading"
      >
        <div className="container">
          <div className="mb-12">
            <p className="font-sans text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-3">
              Most Loved
            </p>
            <h2
              id="bestsellers-heading"
              className="font-display text-[clamp(2.25rem,4vw,3rem)] font-light leading-[1.1] tracking-[-0.025em] text-luma-ink"
            >
              Bestsellers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.14em] uppercase hover:bg-luma-subtle transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── GlowGuide Discovery ──────────────────────────────────────────────── */}
      <section
        className="bg-luma-blush-pale border-y border-luma-accent/15 py-20"
        aria-labelledby="glowguide-heading"
      >
        <div className="container">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="font-sans text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-accent mb-4">
              ✦ GlowGuide Technology
            </p>
            <h2
              id="glowguide-heading"
              className="font-display text-[clamp(2.25rem,4vw,3rem)] font-light leading-[1.1] tracking-[-0.025em] text-luma-ink mb-6"
            >
              Your Skin,{' '}
              <em className="italic text-luma-accent">
                Understood.
              </em>
            </h2>
            <p className="text-[1.0625rem] text-luma-secondary leading-relaxed mb-10">
              Take a guided 60-second skin analysis to receive personalised product recommendations tailored to your unique skin profile. Illustrative results for demonstration.
            </p>
            <button
              data-open-widget
              aria-label="Open GlowGuide skin analysis"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.14em] uppercase transition-colors"
            >
              <span aria-hidden="true">✦</span> Analyse My Skin
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
