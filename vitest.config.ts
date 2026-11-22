import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./packages/widget-ui/src/test/setup.ts'],
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
});
