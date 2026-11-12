# Frontend Web — React + Vite + MUI

Estado y estructura real del front web. Ubicación: **`web_FinanzaApp/`** (React + Vite,
**JavaScript**, **UI únicamente MUI**).

> El antiguo prototipo `plantilla_web/` se retiró: sirvió como referencia de diseño,
> pero no se migra ni es la base del front.

## Stack y reglas

- **React 19 + Vite 8**; **única librería de UI: MUI** (`@mui/material` + Emotion).
  Prohibido Tailwind, Bootstrap u otra.
- **Lenguaje: JavaScript** (no TypeScript): componentes y módulos en `.jsx`/`.js`.
- **Estado global con React Context**: `AuthContext` (sesión) y `ThemeContext` (tema).
  El resto del estado es local a cada vista (`useState`/`useEffect`).
  **No se usa zustand** (no está instalado).
- Enrutado con **react-router-dom 7** (`createBrowserRouter`).
- Estilos: MUI + tokens CSS (`--color-*`) de `src/styles/tema.css`; el tema MUI se
  deriva de esos tokens en `src/styles/temaMui.js`.
- QR de invitaciones con **react-qr-code** (aprobada en Sprint 3, tarea #252).
- Gráficas con componentes propios en `src/features/carteras/components/`
  (`GraficaBarras.jsx`, `GraficaDona.jsx`).
- Consumo de la API centralizado en `src/services/apiClient.js` (adjunta el **JWT** y
  renueva la sesión con el refresh token). Cada módulo expone sus llamadas en
  `src/features/<módulo>/api.js`.
- Lint con **oxlint** (`npm run lint`).

## Estructura real

```
web_FinanzaApp/src/
├── main.jsx
├── app/                 # App.jsx y router.jsx (todas las rutas en un solo lugar)
├── routes/              # ProtectedRoute.jsx, RoleRoute.jsx
├── layouts/             # PublicLayout.jsx, PanelLayout.jsx
├── features/            # un módulo por carpeta
│   ├── landing/         # pages/Landing.jsx, api.js
│   ├── auth/            # pages/Login, Registro, RecuperarContrasena; components/
│   ├── carteras/        # pages/Lista, Detalle; components/TarjetaCartera, DialogoNuevaCartera
│   ├── transacciones/   # pages/Transacciones.jsx
│   ├── reportes/        # pages/Reportes.jsx
│   ├── pagos-recurrentes/ # pages/Lista.jsx
│   ├── ajustes/         # pages/Ajustes.jsx; components/FormularioPerfil, FormularioSeguridad,
│   │                    # Preferencias, ZonaRiesgo, Dato, Tarjeta
│   ├── soporte/         # pages/MisTickets.jsx
│   ├── admin/           # pages/Inicio, Trabajadores, Tickets
│   └── PaginaNoEncontrada.jsx
├── components/ui/       # Iconos.jsx, SideBar.jsx
├── context/             # AuthContext/AuthProvider, ThemeContext/ThemeProvider
├── hooks/               # useAuth.js, useTema.js
├── services/            # apiClient.js (cliente HTTP con JWT)
├── utils/               # constantes.js (ROLES, validadores), formato.js
└── styles/              # tema.css (variables CSS claro/oscuro), temaMui.js
```

Cada `features/<módulo>/` puede tener `pages/`, `components/`, `hooks/` y `api.js`.
No existe `src/pages/` ni `src/stores/`.

## Rutas

| Ruta | Vista | Acceso |
| --- | --- | --- |
| `/` | `landing/Landing.jsx` | Público |
| `/login` | `auth/Login.jsx` | Público |
| `/registro` | `auth/Registro.jsx` | Público |
| `/recuperar` | `auth/RecuperarContrasena.jsx` (3 pasos en una vista) | Público |
| `/carteras` | `carteras/Lista.jsx` | Cliente |
| `/carteras/:id` | `carteras/Detalle.jsx` | Cliente |
| `/transacciones` | `transacciones/Transacciones.jsx` | Cliente |
| `/reportes` | `reportes/Reportes.jsx` | Cliente |
| `/pagos-recurrentes` | `pagos-recurrentes/Lista.jsx` | Cliente |
| `/soporte` | `soporte/MisTickets.jsx` | Cliente |
| `/admin` | `admin/Inicio.jsx` | Admin |
| `/admin/trabajadores` | `admin/Trabajadores.jsx` | Admin |
| `/admin/tickets` | `admin/Tickets.jsx` | Admin y trabajador |
| `/ajustes` | `ajustes/Ajustes.jsx` | Cualquier sesión iniciada |
| `*` | `PaginaNoEncontrada.jsx` | Público |

`ProtectedRoute` exige sesión y `RoleRoute` exige rol (ver `utils/constantes.js`:
`cliente`, `trabajador`, `admin`).

## Mapeo módulo → pantallas → estado/API

| # | Módulo | Vistas y componentes | Estado / API | Estado actual |
| --- | --- | --- | --- | --- |
| 1 | Landing | `landing/pages/Landing.jsx` | `landing/api.js` (vacío) | Placeholder (título y enlace a login) |
| 2 | Autenticación | `auth/pages/Login.jsx`, `Registro.jsx`, `RecuperarContrasena.jsx`; `AuthLayout`, `CampoContrasena` | `AuthContext` + `auth/api.js` (login, registro, logout, recuperación) | Login y registro implementados |
| 3 | Carteras | `carteras/pages/Lista.jsx`; `TarjetaCartera`, `DialogoNuevaCartera` | `carteras/api.js` (listar/filtrar, crear); estado local | Implementado |
| 4 | Detalle de cartera | `carteras/pages/Detalle.jsx` | `carteras/api.js` | Placeholder |
| 5 | Transacciones | `transacciones/pages/Transacciones.jsx` | `transacciones/api.js` (vacío) | Placeholder |
| 6 | Reportes | `reportes/pages/Reportes.jsx` | `reportes/api.js` (vacío); sin librería de gráficas | Placeholder |
| 7 | Pagos recurrentes | `pagos-recurrentes/pages/Lista.jsx` | `pagos-recurrentes/api.js` (vacío) | Placeholder |
| 8 | Ajustes y tema | `ajustes/pages/Ajustes.jsx`; `FormularioPerfil`, `FormularioSeguridad`, `Preferencias`, `ZonaRiesgo` | `ajustes/api.js` (cambiar contraseña, desactivar cuenta); `ThemeContext` | Parcial (cambio de tema y contraseña) |
| 9 | Soporte (cliente) | `soporte/pages/MisTickets.jsx` | `soporte/api.js` (vacío) | Placeholder |
| 10 | Inicio Admin | `admin/pages/Inicio.jsx` | `admin/api.js` (vacío) | Placeholder |
| 11 | Gestión de trabajadores | `admin/pages/Trabajadores.jsx` | `admin/api.js` (vacío) | Placeholder |
| 12 | Soporte Admin | `admin/pages/Tickets.jsx` | `admin/api.js` (vacío) | Placeholder |

No hay módulo de notificaciones ni stores por dominio: lo que falte se implementa con
estado local del módulo y, si hace falta compartirlo, un Context nuevo.

## Navegación (`layouts/PanelLayout.jsx` + `components/ui/SideBar.jsx`)

El menú lateral se arma por rol; `SideBar` solo pinta los enlaces y agrupa por sección.

- **Admin:** Principal → Inicio, Trabajadores, Tickets; Cuenta → Ajustes.
- **Trabajador:** Principal → Tickets; Cuenta → Ajustes.
- **Cliente:** Principal → Carteras, Transacciones, Reportes, Pagos recurrentes, Soporte;
  Cuenta → Ajustes.

`PublicLayout` no pinta nada propio: landing y autenticación definen su layout visual.

## Reglas de UI derivadas del RBAC

- El acceso se controla en las rutas con `RoleRoute`; el menú solo muestra los enlaces
  del rol del usuario.
- Cada vista debe manejar **cargando, error y vacío** al consumir datos.
- Las acciones que el rol no permite no se muestran (la API también las valida).
- En `Ajustes.jsx` el formulario de perfil permite editar nombre, apellidos, teléfono y
  correo; el botón de guardar se habilita solo cuando hay cambios.

## Tema y paleta

- Switch **Claro/Oscuro** en `ThemeProvider`; se guarda en `localStorage` (`tema`) y se
  aplica con `document.documentElement.dataset.tema`.
- Tokens en `web_FinanzaApp/src/styles/tema.css`; el tema MUI los lee con
  `getComputedStyle` en `src/styles/temaMui.js`.
- **Paleta principal:** Petróleo `#173B45`, Terracota `#C65D45`, Coral `#E7A28E`,
  Fondo `#F8F3EF` y Blanco `#FFFFFF`.
- **Reglas de uso, contraste y equivalencia con Figma:** [paleta-colores.md](./paleta-colores.md).
- No escribir códigos hex en componentes: usar `var(--color-*)`.
- Mantener el idioma español y montos en MXN (`es-MX`).
