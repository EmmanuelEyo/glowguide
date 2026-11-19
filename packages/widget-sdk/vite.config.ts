import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GlowGuide',
      fileName: (format) => `glowguide.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
