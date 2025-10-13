import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Generar sourcemaps para debugging en producción
    sourcemap: false,
    // Optimizar el bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        }
      }
    }
  },
  // Configuración del servidor de desarrollo
  server: {
    historyApiFallback: true,
  },
  // Configuración para preview (importante para SPA routing)
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  }
})
