import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // IMPORTANT for GitHub Pages
  base: '/Project4/',

  // Dev server only (local development)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your Node/Express backend in dev
        changeOrigin: true,
        secure: false
      }
    }
  }
})
