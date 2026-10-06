# FinanzApp · Panel Web (prototipo con datos estáticos)

Frontend del panel analítico de **FinanzApp**, la plataforma de finanzas personales y
colaborativas por **carteras** (hogar, viajes y eventos) del proyecto integrador IDGS1002.

Construido con **Angular 21** (standalone + signals + zoneless), **Tailwind CSS v4** y un
conjunto de **datos estáticos determinista** (sin backend ni llamadas de red).

---

## Requisitos

* Node.js 20.19+ (probado con 20.19.2)
* npm 9+

## Ejecución

```bash
npm install
npm start        # http://localhost:4200
```

## Scripts

| Script | Descripción |
| --- | --- |
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producción (incluye manifest y service worker) |
| `npm run watch` | Build con observación de cambios |
| `npm test` | Pruebas unitarias (Karma/Jasmine) |

Para comprobar la PWA (service worker) hace falta servir el build:

```bash
npm run build
npx http-server dist/finanzapp-web/browser -p 8080
```

---

## Cuenta demo

| Correo | Contraseña |
| --- | --- |
| `diego@finanzapp.mx` | `demo123` |

En `/login` existe el botón **“Entrar con la cuenta demo”**. Cualquier correo del dataset
(`aidee@finanzapp.mx`, `vanessa@finanzapp.mx`, …) funciona con la misma contraseña.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Landing pública |
| `/login`, `/registro` | Autenticación (demo) |
| `/app/inicio` | Módulo bienvenida: mis carteras y carteras en las que participo |
| `/app/carteras` | Carteras propias (crear, editar, archivar, eliminar) |
| `/app/carteras/:id` | Detalle con pestañas: resumen, movimientos, contribuyentes, QR y cierre |
| `/app/transacciones` | Listado global con filtros y CRUD |
| `/app/contribuyentes` | Gestión global de participantes |
| `/app/colaboraciones` | Carteras de otros donde participo |
| `/app/inactivas` | Histórico y balance final |
| `/app/ajustes` | Perfil, preferencias, seguridad y sesión |

---

## Estructura del proyecto

```
src/app/
├── core/        # modelos, datos estáticos, servicios, guard y utilidades
├── shared/      # iconos, componentes de UI, gráficas SVG y notificaciones
├── layout/      # shell con sidebar, topbar y navegación móvil
└── features/    # landing, auth, dashboard, carteras, contribuyentes, transacciones, etc.
```

* Los datos viven en `src/app/core/data/mock-data.ts` (28 usuarios, 7 carteras, 391 movimientos
  generados de forma determinista con una semilla fija).
* El estado se modela con **signals** en servicios `providedIn: 'root'`; no hay NgRx.
* El cálculo financiero (series, desgloses, cuotas, saldos y liquidación) está en funciones puras
  en `src/app/core/utils/finanzas.ts`.

## Documentación

La propuesta técnica completa (stack, arquitectura, sistema de diseño, verificación y siguientes
pasos) está en [`../propuesta_frontend.md`](../propuesta_frontend.md).
