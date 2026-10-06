# react-front — Aplicación web (React + Vite + MUI)

Frontend oficial del proyecto (**reemplaza al prototipo Angular `finanzapp-web/`**).

## Stack obligatorio

- **React + Vite** (TypeScript recomendado).
- **MUI como única librería de UI**: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
- Frameworks ligeros permitidos: `react-router-dom` (rutas), `zustand` (estado global si hace falta), `react-hook-form` (formularios, opcional).
- Prohibido: Tailwind, Bootstrap, Ant Design u otra librería de componentes.

## Estructura sugerida

```
src/
├── pages/          # una carpeta por módulo: auth, carteras, movimientos, contribuyentes, ajustes…
├── components/     # componentes reutilizables (StatCard, ProgressBar, Modal…)
├── services/       # llamadas a la API Flask (una función por endpoint)
├── hooks/
├── theme/          # tema global de MUI (colores, tipografía)
├── utils/          # formato de moneda/fechas y cálculos
└── App.tsx / main.tsx
```

## Primeros pasos

```bash
cd react-front
npm create vite@latest . -- --template react-ts   # cuando se genere el esqueleto
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm run dev
```

## Reglas

Ver `AGENTS.md` de esta carpeta y el `AGENTS.md` raíz (ramas y commits).
