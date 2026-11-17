'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/products?category=serums', label: 'Serums' },
  { href: '/products?category=moisturisers', label: 'Moisturisers' },
  { href: '/products?category=spf', label: 'SPF' },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((v) => !v);
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-[200] bg-[rgba(247,240,234,0.92)] backdrop-blur-md border-b border-luma-border h-[68px]">
      <div className="container flex items-center h-[68px] gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-sans text-[1.0625rem] font-light tracking-[0.14em] uppercase text-luma-ink shrink-0"
          aria-label="Luma Beauty — home"
        >
          <span className="font-display font-normal italic normal-case text-[1.25em] tracking-normal">
            Luma
          </span>{' '}
          Beauty
        </Link>

        {/* Desktop nav links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-8 ml-8"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.6875rem] tracking-[0.14em] uppercase text-luma-secondary py-2 border-b border-transparent hover:text-luma-ink hover:border-luma-border transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* GlowGuide launcher — wired in Feature 3 */}
          <button
            data-open-widget
            aria-label="Open GlowGuide skin analysis"
            className="flex items-center gap-1.5 px-3 py-2 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-[0.6875rem] font-medium tracking-[0.08em] uppercase transition-colors"
          >
            <span aria-hidden="true">✦</span> Analyse
          </button>

          {/* Cart — wired in Feature 2 */}
          <button
            onClick={openCart}
            aria-label={itemCount > 0 ? `Open cart — ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Open cart — empty'}
            className="flex items-center justify-center w-10 h-10 rounded-md text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle transition-colors relative"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2h2l2.4 10h9.2l1.6-7H6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8.5" cy="16.5" r="1.5" fill="currentColor" />
              <circle cx="14.5" cy="16.5" r="1.5" fill="currentColor" />
            </svg>
            {itemCount > 0 && (
              <span
                aria-live="polite"
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-luma-accent text-luma-inverse text-[0.5625rem] font-semibold leading-none px-1"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={toggle}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-md text-luma-ink"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <path
                    d="M3 5h14M3 10h14M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="absolute top-[68px] left-0 right-0 bg-luma-surface border-b border-luma-border p-6 flex flex-col gap-4 shadow-md z-[200]"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={toggle}
              className="text-[0.6875rem] tracking-[0.14em] uppercase text-luma-secondary py-2 border-b border-luma-border"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
