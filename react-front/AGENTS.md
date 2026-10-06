# Reglas de `react-front` (web)

- Stack: **React + Vite**; UI **solo MUI**. No agregar Tailwind, Bootstrap ni otras librerías de UI.
- Frameworks ligeros permitidos: `react-router-dom`, `zustand`, `react-hook-form`. Consulta antes de añadir cualquier otra dependencia.
- Organiza por módulos en `src/pages/` y componentes reutilizables en `src/components/`; **todo consumo de API pasa por `src/services/`** (nada de `fetch` suelto en componentes).
- Estados de UI obligatorios en cada vista que consume datos: cargando, error y vacío.
- Montos en MXN (`es-MX`) y fechas `dd/MM/aaaa`; usa las utilidades compartidas de `src/utils/`.
- Antes de terminar: `npm run build` sin errores y consola limpia en el flujo tocado.
- Commits con el estándar del `AGENTS.md` raíz en tu rama (`DB/VR/AC/DR <tipo>: …`).
