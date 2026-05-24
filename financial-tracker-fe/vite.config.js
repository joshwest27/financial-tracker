import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/categories': 'http://localhost:3000',
      '/transactions': 'http://localhost:3000',
      '/reports': 'http://localhost:3000',
    },
  },
});
