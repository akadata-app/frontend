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
    // Asegurar que los assets se resuelvan correctamente
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        }
      }
    }
  },
  // Configuración base para producción - usar ruta absoluta
  base: '/',
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
