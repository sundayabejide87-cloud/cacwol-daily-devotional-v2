import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths work both at a GoDaddy domain root and GitHub Pages subpaths.
  base: './',
});
