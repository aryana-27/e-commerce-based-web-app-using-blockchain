import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    commonjsOptions: {
      include: [],
    },
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', 'framer-motion'],
  },
  json: {
    stringify: true,
  },
})
