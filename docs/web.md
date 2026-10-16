# Frontend Web — React + Vite + MUI

Mapeo de módulos, pantallas y estado para el front web. Ubicación definitiva:
**`web_FinanzaApp/`** (React + Vite, **UI únicamente MUI**). Basado en el
prototipo `plantilla_web/`, que debe migrarse.

> El prototipo `plantilla_web/` está escrito en TypeScript; al migrarlo a
> `web_FinanzaApp/` se convierte a **JavaScript** (`.jsx`/`.js`), que es el estándar del proyecto.

## Stack y reglas

- **React + Vite**; **única librería de UI: MUI**. Prohibido Tailwind, Bootstrap u otra.
- **Lenguaje: JavaScript** (no TypeScript): componentes y módulos en `.jsx`/`.js`.
- Estado global con **zustand** (stores por dominio).
- Enrutado con **react-router-dom**.
- Gráficas con los componentes propios (`components/charts.jsx`).
- Consumo de la API del [backend](./backend.md); sesión por **JWT**.

## Estructura propuesta

```
web_FinanzaApp/src/
├── components/          # ui.jsx, charts.jsx, Icon.jsx, RequireAuth.jsx, ToastHost.jsx
├── layout/Shell.jsx     # navbar + drawer + navegación
├── pages/
│   ├── Landing.jsx, Login.jsx, Registro.jsx, NoEncontrado.jsx
│   ├── carteras/        # Lista, Detalle, CarteraForm, TransaccionForm
│   ├── contribuyentes/  # MiembroForm
│   ├── reportes/        # Reportes, VentanaHogar, VentanaTemporales, componentes
│   ├── pagos/           # (nuevo)
│   ├── soporte/         # (nuevo)
│   └── admin/           # (nuevo) inicio, trabajadores, soporte admin
├── stores/              # auth, usuarios, carteras, transacciones, toast, + nuevos
├── types/models.js
└── utils/               # finanzas, reportes, exportar, format, cx
```

## Mapeo módulo → pantallas → store

| # | Módulo | Pantallas / componentes | Store / lógica |
| --- | --- | --- | --- |
| 1 | Landing | `Landing.jsx` (PBDT, botón de descargas, formulario de comentarios) | API `/comentarios` |
| 2 | Autenticación | `Login.jsx`, `Registro.jsx`, Restablecer contraseña (`InputCorreo`, `InputCódigoVálido`, `InputNuevaContraseña`) | `stores/auth.js` (JWT) |
| 3 | Dashboard / Carteras | `carteras/Lista.jsx`, `carteras/CarteraForm.jsx` | `stores/carteras.js` |
| 4 | Detalle de cartera | `carteras/Detalle.jsx`, `Invitación QR`, `Contribuyentes`, `Balance` | `stores/carteras.js`, `utils/finanzas.js` |
| 5 | Transacciones | `Transacciones.jsx`, `carteras/TransaccionForm.jsx`, `Nueva Categoría` | `stores/transacciones.js` |
| 6 | Reportes | `reportes/Reportes.jsx`, `VentanaHogar.jsx`, `VentanaTemporales.jsx` | `utils/reportes.js`, `utils/exportar.js` |
| 7 | Pagos recurrentes | `pagos/Lista.jsx`, `pagos/PagoForm.jsx` | `stores/pagos.js` (nuevo) |
| 8 | Ajustes y notificaciones | `Ajustes.jsx`, `Switch tema`, panel de notificaciones | `stores/preferencias.js`, `stores/notificaciones.js` |
| 9 | Soporte (cliente) | `soporte/MisReportes.jsx`, `soporte/TicketForm.jsx`, detalle de respuestas | `stores/soporte.js` |
| 10 | Inicio Admin | `admin/Inicio.jsx` (métricas, buzón de comentarios) | `stores/admin.js` |
| 11 | Gestión trabajadores | `admin/Trabajadores.jsx`, formulario, modal eliminar, tickets asignados | `stores/admin.js` |
| 12 | Soporte Admin / Dev | `admin/Tickets.jsx`, detalle, modal delegación, formulario responder | `stores/soporte.js` |

## Navegación (`layout/Shell.jsx`)

- **Principal:** Carteras, Transacciones, Reportes, Pagos recurrentes.
- **Colaboración:** Contribuyentes, Carteras inactivas.
- **Cuenta:** Ajustes, Notificaciones, Soporte.
- **Admin** (solo `adminSistema`/`trabajador`): Inicio Admin, Trabajadores, Soporte Admin.

## Reglas de UI derivadas del RBAC

- Ocultar/deshabilitar acciones que el rol no permite (editar, invitar, dar de baja, cerrar).
- En `Detalle.jsx`, `puedeEditar = cartera activa && (admin || dueño)`.
- En `Ajustes.jsx`, el campo correo se muestra **deshabilitado**.
- Las carteras **Finalizadas** se muestran en modo **solo lectura**.

## Tema

- Switch **Claro/Oscuro**; tokens de color desde `theme.js` (MUI `createTheme`).
- Mantener el idioma español y montos en MXN (`es-MX`).
