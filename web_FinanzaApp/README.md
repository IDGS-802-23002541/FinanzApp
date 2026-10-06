# web_FinanzaApp — Aplicación web (React + Vite + MUI)

Frontend oficial del proyecto.

## Stack

- **React 19 + Vite** (TypeScript, modo `strict`).
- **MUI como única librería de UI** (`@mui/material`, `@mui/icons-material`, `@emotion/*`).
- Estado global con **zustand**; rutas con **react-router-dom**; gráficas SVG propias.
- QR de invitación con **qrcode** (render local, sin servicios externos).

## Comandos

```bash
cd web_FinanzaApp
npm install          # solo la primera vez
npm run dev          # desarrollo en http://localhost:4200
npm run build        # verificación de tipos + build de producción (dist/)
npm run preview      # sirve el build para probarlo
```

## Estructura

```
src/
├── components/      # Icon, ui (Avatar, StatCard, Modal, ConfirmModal…), charts, ToastHost, RequireAuth
├── data/            # mock-data.ts: dataset determinista (carteras, usuarios, 391 movimientos)
├── layout/          # Shell: sidebar escritorio, drawer + barra inferior móvil y FAB
├── pages/           # Landing, Login, Registro, NoEncontrado, carteras/ (lista, detalle, formularios),
│                    # contribuyentes/, Transacciones, Inactivas, Ajustes
├── stores/          # zustand: auth, usuarios, carteras, transacciones, toast
├── types/           # modelos del dominio (mismos campos que la API prevista)
├── utils/           # format.ts (moneda/fechas es-MX), finanzas.ts (saldos, liquidación, series)
├── theme.ts         # tema MUI con la paleta de marca
└── main.tsx / App.tsx
```

## Funcionalidad portada

- Landing informativa, login/registro con validaciones y sesión persistida (`localStorage.finanzapp.sesion`).
- Carteras: crear/editar/archivar/eliminar, filtros por categoría y búsqueda, vista de colaboraciones.
- Detalle de cartera con 5 pestañas: **Resumen** (KPIs + gráficas + ranking), **Movimientos** (filtros + CRUD),
  **Contribuyentes** (alta/baja), **Invitación QR** (copiar/compartir/regenerar) y **Cierre y balance**
  (saldos, liquidación sugerida, imprimir y finalizar).
- Transacciones globales con filtros combinables; carteras inactivas (histórico) con reactivación.
- Ajustes: perfil, contraseña, preferencias y cierre de sesión.

Las cuentas demo (`diego@finanzapp.mx` / `demo123`) están listas para probar la app.

## Convenciones

Ver `AGENTS.md` de esta carpeta y el `AGENTS.md` raíz (ramas y commits). No se usa Tailwind ni otras
librerías de UI; los datos viven en `src/data/mock-data.ts` hasta que exista la API en `Backend_FinanzaApp/`.
