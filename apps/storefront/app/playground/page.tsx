import type { Metadata } from 'next';
import { PlaygroundClient } from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'Developer Integration Playground - GlowGuide',
  description:
    'Interactive developer workspace to configure widget branding, test live floating and inline presentations, inspect CustomEvents telemetry, and export production integration code.',
};

export default function PlaygroundPage() {
  return (
    <div className="py-12 bg-luma-page min-h-[90vh]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-[0.6875rem] font-semibold tracking-[0.16em] uppercase text-luma-accent mb-2">
            Developer Integration Playground
          </p>
          <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] font-light leading-tight text-luma-ink mb-3">
            Widget Configurator & Code Exporter
          </h1>
          <p className="text-sm sm:text-base text-luma-secondary leading-relaxed">
            Test and customize the GlowGuide skin analysis widget in real-time. Adjust merchant branding,
            simulate device environments and errors, monitor live CustomEvents, and copy production integration snippets for HTML, ES Modules, React, and Next.js.
          </p>
        </div>

        <PlaygroundClient />
      </div>
    </div>
  );
}
