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
    // Optimización para producción
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        }
      }
    }
  },
  // Configuración base para producción - siempre desde raíz
  base: '/',
  // Configuración del servidor de desarrollo
  server: {
    host: '0.0.0.0', // Permite conexiones desde fuera del contenedor
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necesario para hot reload en Docker (Windows)
    },
    hmr: {
      host: 'localhost', // Para HMR en el navegador
    },
    // Proxy para las peticiones al backend
    proxy: {
      '/api': {
        target: 'http://back:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  // Configuración para preview (importante para SPA routing)
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  }
})
