import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Project4/',      // repo name (for GitHub Pages)
  server: {
    port: 5173,            // force dev to 5173 so CORS matches backend
  },
})
