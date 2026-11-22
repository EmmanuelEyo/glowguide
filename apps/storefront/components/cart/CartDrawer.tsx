'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { PRODUCTS } from '@/lib/products';
import { cn } from '@/lib/cn';

export default function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={cn(
          'fixed inset-0 bg-luma-canvas/40 z-[399] transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-[400px] bg-luma-surface z-[400] flex flex-col shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-luma-border">
          <h2 className="font-display text-[1.25rem] font-light text-luma-ink tracking-[-0.01em]">
            Your Bag
            {itemCount > 0 && (
              <span className="ml-2 font-sans text-sm font-normal text-luma-ghost">
                ({itemCount} item{itemCount === 1 ? '' : 's'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            className="flex items-center justify-center w-9 h-9 rounded-md text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <span className="text-[56px]" aria-hidden="true">🛍️</span>
              <div>
                <p className="font-display text-[1.1rem] font-light text-luma-ink mb-2">
                  Your bag is empty
                </p>
                <p className="text-sm text-luma-secondary leading-relaxed">
                  Discover products perfectly matched to your skin.
                </p>
              </div>
              <Link
                href="/products"
                onClick={closeCart}
                className="inline-flex items-center justify-center h-10 px-6 rounded-[3px] border border-luma-border-strong text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase hover:bg-luma-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-2"
              >
                Shop Products
              </Link>
            </div>
          ) : (
            /* Item list */
            <ul className="divide-y divide-luma-border">
              {items.map((item) => {
                const product = PRODUCTS.find((p) => p.id === item.productId);
                if (!product) return null;
                const lineTotal = product.price * item.quantity;

                return (
                  <li key={item.productId} className="flex gap-4 px-6 py-5">
                    {/* Gradient swatch — dynamic per-product, inline style required */}
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden"
                      style={{ background: product.gradient }}
                      aria-hidden="true"
                    >
                      {product.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.625rem] tracking-[0.1em] uppercase text-luma-ghost mb-0.5">
                        {product.category.replace('-', ' ')}
                      </p>
                      <p className="text-sm font-medium text-luma-ink leading-snug mb-3 truncate">
                        {product.name}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center border border-luma-border rounded-[4px] overflow-hidden h-8">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={cn(
                              'w-8 h-8 flex items-center justify-center text-base font-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-1',
                              item.quantity <= 1
                                ? 'text-luma-disabled cursor-not-allowed'
                                : 'text-luma-ink hover:bg-luma-subtle cursor-pointer',
                            )}
                          >
                            &minus;
                          </button>
                          <span
                            aria-live="polite"
                            aria-label={`Quantity: ${item.quantity}`}
                            className="min-w-[32px] text-center text-sm font-medium text-luma-ink select-none"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-base font-light text-luma-ink hover:bg-luma-subtle transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-1"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-luma-ink">
                            ${lineTotal}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${product.name} from bag`}
                            onClick={() => removeItem(item.productId)}
                            className="text-luma-ghost hover:text-luma-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-accent focus-visible:ring-offset-1 rounded-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-luma-border px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-luma-secondary">Subtotal</span>
              <span className="text-base font-medium text-luma-ink">${subtotal}</span>
            </div>
            <p className="text-[0.625rem] text-luma-ghost tracking-[0.06em]">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full h-12 rounded-[3px] bg-luma-accent/50 text-luma-inverse text-[0.6875rem] font-semibold tracking-[0.1em] uppercase cursor-not-allowed"
            >
              Checkout — coming soon
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
