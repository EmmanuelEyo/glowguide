import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCTS, getProductById, getRelatedProducts } from '@/lib/products';
import ProductCard from '@/components/ui/ProductCard';
import ProductTabs from './components/ProductTabs';
import AddToBagSection from './components/AddToBagSection';
import { cn } from '@/lib/cn';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} - Luma Beauty`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product, 3);

  const categoryLabel: Record<string, string> = {
    serums: 'Serums',
    moisturisers: 'Moisturisers',
    toners: 'Toners',
    spf: 'SPF',
    cleansers: 'Cleansers',
    'eye-care': 'Eye Care',
    masks: 'Masks',
  };

  return (
    <>
      <div className="container pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-luma-ghost tracking-[0.02em] list-none">
            <li>
              <Link href="/" className="text-luma-ghost hover:text-luma-secondary transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li>Skincare</li>
            <li aria-hidden="true" className="select-none">/</li>
            <li>
              <Link href={`/products?category=${product.category}`} className="text-luma-ghost hover:text-luma-secondary transition-colors">
                {categoryLabel[product.category] ?? product.category}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="text-luma-secondary">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container py-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,55%)_1fr] gap-16 items-start">

          <div>
            <div
              className="rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center text-[7.5rem] relative"
              style={{ background: product.gradient }}
              aria-hidden="true"
            >
              <span className="text-[7.5rem]">{product.emoji}</span>
            </div>

            <div className="flex gap-3 mt-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'flex-1 aspect-square rounded-lg flex items-center justify-center text-2xl transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-2',
                    i === 0
                      ? 'opacity-100 border-2 border-luma-accent'
                      : 'opacity-50 border-2 border-luma-border',
                  )}
                  style={{ background: product.gradient }}
                >
                  {product.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[0.6875rem] font-medium tracking-[0.12em] uppercase text-luma-ghost mb-3">
              {product.brand}
            </p>

            <h1 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.15] text-luma-ink mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-5">
              <span
                aria-label="4.9 out of 5 stars"
                className="text-luma-gold text-base tracking-[-0.02em]"
              >
                ★★★★★
              </span>
              <span className="text-sm text-luma-secondary">
                4.9{' '}
                <span className="text-luma-disabled">(248 reviews)</span>
              </span>
            </div>

            <p className="text-2xl font-medium text-luma-ink mb-5 tracking-[-0.01em]">
              ${product.price}.00
            </p>

            <p className="text-base text-luma-secondary leading-relaxed mb-6">
              {product.description}
            </p>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-luma-border text-[0.6875rem] font-medium tracking-[0.06em] uppercase text-luma-secondary bg-luma-surface"
                  >
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <AddToBagSection productId={product.id} productName={product.name} />

            <div className="rounded-lg bg-luma-blush-pale border border-luma-blush p-4 pl-5 flex items-start gap-3.5">
              <span className="text-xl shrink-0" aria-hidden="true">✦</span>
              <div>
                <p className="text-sm font-semibold text-luma-ink mb-1">
                  Not sure if this is right for your skin?
                </p>
                <p className="text-sm text-luma-secondary leading-relaxed mb-3">
                  Get a personalised skin analysis with GlowGuide and discover
                  products matched to your unique skin profile.
                </p>
                <button
                  type="button"
                  data-open-widget="glowguide"
                  aria-label="Open GlowGuide skin analysis"
                  className="px-4 py-2 bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse rounded-[4px] text-[0.6875rem] font-semibold tracking-[0.08em] uppercase transition-colors"
                >
                  Analyse My Skin
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProductTabs />
      </section>

      {related.length > 0 && (
        <section className="border-t border-luma-border">
          <div className="container py-12 pb-16">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-light text-luma-ink mb-8 tracking-[-0.01em]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
