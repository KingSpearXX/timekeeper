import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: 'all',
    cors: false, // Disable CORS handling in Vite
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: false, // Disable CORS handling in Vite
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          directus: ['@directus/sdk']
        }
      }
    }
  }
})
