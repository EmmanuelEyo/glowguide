import Link from 'next/link';

const FOOTER_LINKS = {
  Skincare: [
    { href: '/products?category=serums', label: 'Serums' },
    { href: '/products?category=moisturisers', label: 'Moisturisers' },
    { href: '/products?category=toners', label: 'Toners' },
    { href: '/products?category=spf', label: 'SPF' },
    { href: '/products?category=cleansers', label: 'Cleansers' },
    { href: '/products?category=eye-care', label: 'Eye Care' },
    { href: '/products?category=masks', label: 'Masks' },
  ],
  'GlowGuide': [
    { href: '/react-integration', label: 'React / Next.js Guide' },
    { href: '/widget-preview', label: 'Widget Preview' },
    { href: '#', label: 'How It Works' },
    { href: '#', label: 'For Developers' },
  ],
  Company: [
    { href: '#', label: 'About Luma' },
    { href: '#', label: 'Sustainability' },
    { href: '#', label: 'Press' },
    { href: '#', label: 'Contact' },
  ],
};

export default async function Footer() {
  'use cache';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-luma-canvas text-[rgba(253,250,247,0.6)] mt-32">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-sans text-[1.0625rem] font-light tracking-[0.14em] uppercase text-[rgba(253,250,247,0.9)]"
              aria-label="Luma Beauty — home"
            >
              <span className="font-display font-normal italic normal-case text-[1.25em] tracking-normal">
                Luma
              </span>{' '}
              Beauty
            </Link>
            <p className="mt-3 text-sm leading-relaxed max-w-[220px]">
              Premium skincare, understood. Powered by GlowGuide skin discovery technology.
            </p>
          </div>

          {/* Links grid */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {Object.entries(FOOTER_LINKS).map(([col, links]) => (
              <div key={col}>
                <h4 className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-inverse mb-4">
                  {col}
                </h4>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm mb-3 hover:text-luma-inverse transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(253,250,247,0.12)]">
        <div className="container flex flex-wrap justify-between items-center py-5 gap-4">
          <p className="text-[0.6875rem]">
            &copy; {year} Luma Beauty. All rights reserved. Portfolio demonstration — no real products or transactions.
          </p>
          <p className="text-[0.6875rem]">
            Powered by{' '}
            <span className="text-luma-blush font-medium">
              GlowGuide
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
