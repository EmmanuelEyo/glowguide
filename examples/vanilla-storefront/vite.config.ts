import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function syncSdkToPublic() {
  const distDir = resolve(__dirname, '../../packages/widget-sdk/dist');
  const publicDir = resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const files = ['glowguide.umd.js', 'glowguide.es.js'];
  for (const file of files) {
    const src = resolve(distDir, file);
    const dest = resolve(publicDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}

// Sync SDK assets on config load
syncSdkToPublic();

export default defineConfig({
  server: {
    port: 3001,
  },
  publicDir: 'public',
});
