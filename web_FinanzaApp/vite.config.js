import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En desarrollo el front llama a rutas relativas y Vite las reenvía al backend,
  // así el navegador no bloquea la petición por CORS.
  server: {
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
