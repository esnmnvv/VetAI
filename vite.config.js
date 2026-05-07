import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VERCEL ? '/' : '/VetAI/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ferm-rho.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
