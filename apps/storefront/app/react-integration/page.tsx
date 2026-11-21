import type { Metadata } from 'next';
import { ReactIntegrationClient } from './ReactIntegrationClient';

export const metadata: Metadata = {
  title: 'React & Next.js Integration Guide - GlowGuide',
  description:
    'Architecture guide and interactive demonstration for integrating GlowGuide into React and Next.js applications with zero SSR hydration mismatches.',
};

export default function ReactIntegrationPage() {
  return (
    <div className="py-16 bg-luma-page min-h-[85vh]">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-3">
            Developer Integration Guide
          </p>
          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-light leading-tight text-luma-ink mb-4">
            React & Next.js Architecture
          </h1>
          <p className="text-base text-luma-secondary leading-relaxed max-w-2xl mx-auto">
            GlowGuide is architected for modern full-stack React frameworks. Seamlessly integrate the skin discovery experience into Next.js App Router, Pages Router, or Vite with safe client-side hydration, idiomatic React hooks, and full programmatic control.
          </p>
        </div>

        {/* Client Interactive Showcase */}
        <ReactIntegrationClient />
      </div>
    </div>
  );
}
