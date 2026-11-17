import type { Metadata } from 'next';
import { WidgetPreviewClient } from './WidgetPreviewClient';

export const metadata: Metadata = {
  title: 'Widget Preview - GlowGuide',
  description: 'Demonstration of floating and inline presentation modes for the GlowGuide widget.',
};

export default function WidgetPreviewPage() {
  return (
    <div className="py-16 bg-luma-page min-h-[80vh]">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-luma-ghost mb-3">
            Developer Integration Preview
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-luma-ink mb-4">
            Widget Interface Modes
          </h1>
          <p className="text-base text-luma-secondary leading-relaxed max-w-xl mx-auto">
            GlowGuide adapts seamlessly to any retail layout. Below is an active demonstration of the
            <strong className="text-luma-ink font-semibold"> inline presentation mode </strong>
            with an interactive session state engine inspector. The
            <strong className="text-luma-ink font-semibold"> floating presentation mode </strong>
            is accessible from the bottom-right launcher.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              data-open-widget
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors"
            >
              <span>✦</span> Launch Floating Mode
            </button>
          </div>
        </div>

        {/* Inline presentation & session inspector */}
        <WidgetPreviewClient />
      </div>
    </div>
  );
}
