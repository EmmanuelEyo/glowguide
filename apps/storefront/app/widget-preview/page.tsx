import type { Metadata } from 'next';
import { GlowGuideWidget } from '@glowguide/widget-ui';

export const metadata: Metadata = {
  title: 'Widget Preview — GlowGuide',
  description: 'Demonstration of floating and inline presentation modes for the GlowGuide widget.',
};

export default function WidgetPreviewPage() {
  return (
    <div className="py-16 bg-luma-page min-h-[80vh]">
      <div className="container max-w-4xl mx-auto px-4">
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
            <strong className="text-luma-ink font-semibold"> inline presentation mode</strong>.
            The <strong className="text-luma-ink font-semibold">floating presentation mode</strong> is active in the bottom-right corner.
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

        {/* Inline presentation container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-luma-surface border border-luma-border shadow-sm mb-12">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-luma-border">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-luma-accent">
                Mode: Inline
              </span>
              <h2 className="text-sm text-luma-secondary mt-0.5">
                Embedded directly into the merchant page flow
              </h2>
            </div>
            <span className="text-xs text-luma-ghost font-mono bg-luma-subtle px-2.5 py-1 rounded">
              &lt;GlowGuideWidget mode=&quot;inline&quot; /&gt;
            </span>
          </div>

          <div className="flex justify-center">
            <GlowGuideWidget
              mode="inline"
              config={{
                storeId: 'luma-beauty',
                brandName: 'Luma Beauty',
                mode: 'inline',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
