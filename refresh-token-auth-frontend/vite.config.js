import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy all /api requests to the Spring Boot backend (avoids CORS in dev)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9096',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
