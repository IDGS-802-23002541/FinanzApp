import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND = process.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:5000'

// Las rutas del panel (/admin, /carteras, /soporte…) se llaman igual que los
// prefijos de la API. Al recargar el navegador pide HTML y se sirve el SPA;
// las llamadas fetch piden JSON y siguen al backend.
function alNavegar(req) {
  if (req.headers.accept?.includes('text/html')) return '/index.html'
}

const api = () => ({
  target: BACKEND,
  changeOrigin: true,
  bypass: alNavegar,
})

// En desarrollo el front llama a rutas relativas y Vite las reenvía al backend,
// así el navegador no bloquea la petición por CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': api(),
      '/carteras': api(),
      '/reportes': api(),
      '/comentarios': api(),
      '/transacciones': api(),
      '/pagos-recurrentes': api(),
      '/soporte': api(),
      '/admin': api(),
    },
  },
})
