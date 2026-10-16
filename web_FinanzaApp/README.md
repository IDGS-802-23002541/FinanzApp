# FinanzApp — Web

Front web de FinanzApp: **React + Vite** (JavaScript). Enrutado con
**react-router-dom** y **MUI** como única librería de UI (pendiente de agregar).

## Estructura

```
src/
├── main.jsx
├── app/            # App.jsx y router.jsx (todas las rutas en un solo lugar)
├── routes/         # ProtectedRoute y RoleRoute
├── layouts/        # PublicLayout, ClienteLayout, AdminLayout
├── features/       # un módulo por carpeta (pages, components, hooks, api.js)
├── components/ui/  # componentes compartidos
├── hooks/          # hooks compartidos
├── context/        # AuthContext y ThemeContext
├── services/       # apiClient.js (cliente HTTP con JWT)
├── utils/          # formato, validadores y constantes
└── styles/         # variables CSS del tema claro y oscuro
```

## Comandos

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
