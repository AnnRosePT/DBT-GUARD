/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/textbee': {
        target: 'https://api.textbee.dev/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/textbee/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
