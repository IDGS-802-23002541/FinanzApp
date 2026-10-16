# Frontend Web — React + Vite + MUI

Mapeo de módulos, pantallas y estado para el front web. Ubicación definitiva:
**`web_FinanzaApp/`** (React + Vite, **UI únicamente MUI**). Basado en el
prototipo `plantilla_web/`, que debe migrarse.

## Stack y reglas

- **React + Vite**; **única librería de UI: MUI**. Prohibido Tailwind, Bootstrap u otra.
- Estado global con **zustand** (stores por dominio).
- Enrutado con **react-router-dom**.
- Gráficas con los componentes propios (`components/charts.tsx`).
- Consumo de la API del [backend](./backend.md); sesión por **JWT**.

## Estructura propuesta

```
web_FinanzaApp/src/
├── components/          # ui.tsx, charts.tsx, Icon.tsx, RequireAuth.tsx, ToastHost.tsx
├── layout/Shell.tsx     # navbar + drawer + navegación
├── pages/
│   ├── Landing.tsx, Login.tsx, Registro.tsx, NoEncontrado.tsx
│   ├── carteras/        # Lista, Detalle, CarteraForm, TransaccionForm
│   ├── contribuyentes/  # MiembroForm
│   ├── reportes/        # Reportes, VentanaHogar, VentanaTemporales, componentes
│   ├── pagos/           # (nuevo)
│   ├── soporte/         # (nuevo)
│   └── admin/           # (nuevo) inicio, trabajadores, soporte admin
├── stores/              # auth, usuarios, carteras, transacciones, toast, + nuevos
├── types/models.ts
└── utils/               # finanzas, reportes, exportar, format, cx
```

## Mapeo módulo → pantallas → store

| # | Módulo | Pantallas / componentes | Store / lógica |
| --- | --- | --- | --- |
| 1 | Landing | `Landing.tsx` (PBDT, botón de descargas, formulario de comentarios) | API `/comentarios` |
| 2 | Autenticación | `Login.tsx`, `Registro.tsx`, Restablecer contraseña (`InputCorreo`, `InputCódigoVálido`, `InputNuevaContraseña`) | `stores/auth.ts` (JWT) |
| 3 | Dashboard / Carteras | `carteras/Lista.tsx`, `carteras/CarteraForm.tsx` | `stores/carteras.ts` |
| 4 | Detalle de cartera | `carteras/Detalle.tsx`, `Invitación QR`, `Contribuyentes`, `Balance` | `stores/carteras.ts`, `utils/finanzas.ts` |
| 5 | Transacciones | `Transacciones.tsx`, `carteras/TransaccionForm.tsx`, `Nueva Categoría` | `stores/transacciones.ts` |
| 6 | Reportes | `reportes/Reportes.tsx`, `VentanaHogar.tsx`, `VentanaTemporales.tsx` | `utils/reportes.ts`, `utils/exportar.ts` |
| 7 | Pagos recurrentes | `pagos/Lista.tsx`, `pagos/PagoForm.tsx` | `stores/pagos.ts` (nuevo) |
| 8 | Ajustes y notificaciones | `Ajustes.tsx`, `Switch tema`, panel de notificaciones | `stores/preferencias.ts`, `stores/notificaciones.ts` |
| 9 | Soporte (cliente) | `soporte/MisReportes.tsx`, `soporte/TicketForm.tsx`, detalle de respuestas | `stores/soporte.ts` |
| 10 | Inicio Admin | `admin/Inicio.tsx` (métricas, buzón de comentarios) | `stores/admin.ts` |
| 11 | Gestión trabajadores | `admin/Trabajadores.tsx`, formulario, modal eliminar, tickets asignados | `stores/admin.ts` |
| 12 | Soporte Admin / Dev | `admin/Tickets.tsx`, detalle, modal delegación, formulario responder | `stores/soporte.ts` |

## Navegación (`layout/Shell.tsx`)

- **Principal:** Carteras, Transacciones, Reportes, Pagos recurrentes.
- **Colaboración:** Contribuyentes, Carteras inactivas.
- **Cuenta:** Ajustes, Notificaciones, Soporte.
- **Admin** (solo `adminSistema`/`trabajador`): Inicio Admin, Trabajadores, Soporte Admin.

## Reglas de UI derivadas del RBAC

- Ocultar/deshabilitar acciones que el rol no permite (editar, invitar, dar de baja, cerrar).
- En `Detalle.tsx`, `puedeEditar = cartera activa && (admin || dueño)`.
- En `Ajustes.tsx`, el campo correo se muestra **deshabilitado**.
- Las carteras **Finalizadas** se muestran en modo **solo lectura**.

## Tema

- Switch **Claro/Oscuro**; tokens de color desde `theme.ts` (MUI `createTheme`).
- Mantener el idioma español y montos en MXN (`es-MX`).
