# FinanzApp — Propuesta de Frontend (Panel Web)

**Universidad Tecnológica de León**
**Ingeniería en Desarrollo y Gestión de Software · Grupo IDGS1002**

| Materia | Aplicaciones Web Progresivas / Desarrollo Móvil Integral |
| --- | --- |
| **Proyecto** | FinanzApp · Plataforma de finanzas personales y colaborativas por carteras |
| **Entregable** | Propuesta de frontend + prototipo funcional con datos estáticos |
| **Fecha** | Septiembre 2026 |
| **Lugar** | León, Guanajuato |

---

## 1. Resumen ejecutivo

Se propone y se implementa el **frontend del panel web de FinanzApp** como una aplicación
**Angular 21** de tipo *single page application* con arquitectura **PWA**, estilizada con
**Tailwind CSS v4** y alimentada por un **conjunto de datos estáticos determinista** que simula
la base de datos completa del proyecto (usuarios, carteras, miembros, categorías y transacciones).

El prototipo cubre el alcance solicitado:

* **Landing** pública de presentación.
* **Login y registro** con sesión persistida en el navegador y guard de rutas.
* **Panel completo** con los cuatro módulos base: *Landing/Login*, *Carteras*,
  *Contribuyentes* y *Transacciones/Gastos*, incluyendo estadísticas, generación de QR,
  cierre de cartera con **balance de gastos final** y ajustes de cuenta.

El resultado es navegable, responsivo (mobile-first), instalable como PWA y verificado con un
*smoke test* automatizado con navegador headless (**0 errores de consola** en los 19 flujos
evaluados).

---

## 2. Objetivos del frontend

| Objetivo | Cómo se cumple en el prototipo |
| --- | --- |
| Centralizar la información financiera de carteras compartidas | Panel analítico con métricas, gráficas y tablas por cartera |
| Permitir el registro rápido de ingresos y gastos | Formulario de movimiento accesible desde cualquier vista, con filtros y edición |
| Facilitar la incorporación de contribuyentes | Generación de **QR + clave única** por cartera y alta de miembros (usuarios existentes o nuevos) |
| Dar transparencia al grupo | Desglose de pagos por integrante, cuotas y **liquidación sugerida** al cierre |
| Ser usable desde cualquier dispositivo | Diseño *mobile-first* con navegación inferior, *drawer* lateral y vistas adaptativas |
| Ser demostrable sin backend | Datos estáticos deterministas + persistencia de sesión en `localStorage` |

---

## 3. Stack tecnológico y justificación

### 3.1 Decisiones principales

| Capa | Tecnología | Versión | Motivo |
| --- | --- | --- | --- |
| Framework | **Angular** (standalone + signals) | 21.2 | Framework completo con router, formularios reactivos, DI e i18n; ideal para un panel administrativo de varias vistas |
| Detección de cambios | **Zoneless** (por defecto en Angular 21) | — | Menor consumo y mejor rendimiento; todo el estado se modela con `signal`/`computed` |
| Estilos | **Tailwind CSS v4** | 4.x | Utilidades + *design tokens* en CSS, sin hojas gigantes ni conflictos de especificidad |
| Estado | **Signals + servicios `providedIn: 'root'`** | — | Estado derivado sin librerías externas (no se requiere NgRx para este alcance) |
| Formularios | **Reactive Forms** | — | Validación tipada y control de errores por campo |
| Gráficas | **SVG propio** (`BarChart`, `DonutChart`) | — | Cero dependencias, control total del diseño y del formato en MXN |
| Códigos QR | **`qrcode`** (render en canvas → data URL) | 1.5 | Generación local (sin API externa) del QR de invitación |
| PWA | **`@angular/service-worker` + manifest** | 21.2 | Instalabilidad, *caché* de assets y *lazy* de recursos |
| Idioma/formatos | **`LOCALE_ID = es-MX`** + `CurrencyPipe`/`DatePipe` | — | Montos en MXN y fechas en español sin utilidades externas |

### 3.2 ¿Por qué Angular y no otra opción?

| Alternativa | Ventajas | Por qué no se eligió |
| --- | --- | --- |
| React + Vite | Ecosistema enorme, flexibilidad | Requiere ensamblar router, formularios, DI y estructura; mayor variabilidad entre integrantes del equipo |
| Vue 3 | Curva de aprendizaje suave | Menor adopción en el entorno empresarial objetivo y menos *tooling* integrado para paneles grandes |
| HTML + JS *vanilla* | Sin *build step* | Insostenible para 9 rutas, CRUDs y estado compartido; sin PWA ni tipado |
| **Angular 21** | **Router, formularios, DI, PWA, i18n y tipado estricto en un solo marco; estructura impuesta por el framework** | **Seleccionado**: consistencia para el equipo, `strict` de TypeScript y CLI con *schematics* |

### 3.3 Justificación de Tailwind v4

* Los *tokens* de diseño viven en CSS (`@theme`) y no en configuración JavaScript.
* Se elimina el CSS muerto: solo se genera lo que se usa (≈ 50 kB sin comprimir / 7 kB comprimido).
* Permite *componentes* reutilizables (`.card`, `.btn`, `.input`, `.badge`, `.table-wrap`) definidos una
  sola vez con `@apply`, manteniendo los componentes Angular sin hojas de estilo propias.

---

## 4. Arquitectura del frontend

### 4.1 Organización por *features* (feature-first)

```
src/app/
├── core/                     # Sin UI: dominio y servicios
│   ├── models.ts             # Entidades del proyecto (Usuario, Cartera, Transaccion…)
│   ├── data/mock-data.ts     # Dataset estático determinista
│   ├── services/             # AuthService, CarterasService, TransaccionesService…
│   ├── guards/auth.guard.ts  # Protección de /app/**
│   └── utils/                # format.ts (moneda/fecha), finanzas.ts (balances, series)
├── shared/                   # UI reutilizable sin estado de dominio
│   ├── icon.ts               # +50 iconos SVG en un componente (<app-icon>)
│   ├── ui.ts                 # Avatar, StatCard, Modal, ConfirmModal, ProgressBar…
│   ├── charts.ts             # BarChart y DonutChart en SVG
│   └── toast-host.ts         # Notificaciones globales
├── layout/shell.ts           # Sidebar, topbar, nav inferior móvil y <router-outlet>
└── features/                 # Una carpeta por módulo funcional
    ├── landing/              # Página pública
    ├── auth/                 # login.ts · registro.ts
    ├── dashboard/            # inicio.ts (bienvenida: mis carteras y colaboraciones)
    ├── carteras/             # lista · detalle (5 pestañas) · formularios
    ├── contribuyentes/       # tabla global + alta de miembros
    ├── transacciones/        # listado global con filtros y CRUD
    ├── colaboraciones/       # carteras donde soy contribuyente
    ├── inactivas/            # histórico y balance final
    └── ajustes/              # perfil, preferencias, seguridad y sesión
```

Criterios aplicados:

* **`core` no importa de `features`** (regla de dependencia unidireccional).
* Componentes **standalone** en todas partes (sin `NgModule`), importando solo lo que usan.
* Funciones **puras** de cálculo financiero (`utils/finanzas.ts`) separadas de los servicios, lo que
  las hace testeables sin Angular y reutilizables entre web y móvil.

### 4.2 Estado y flujo de datos

```
mock-data.ts (seed)  →  Servicio (signal privado + asReadonly)
        →  computed en el servicio o en el componente
        →  template (sin suscripciones manuales)
```

* Los servicios exponen el estado como **`Signal` de solo lectura** y ofrecen métodos de mutación
  (`crear`, `actualizar`, `eliminar`, `archivar`, `crearMiembro`, `regenerarCodigo`…).
* Los totales, series mensuales, desgloses por categoría y balances se calculan con **`computed`**;
  no hay estado duplicado.
* Al ser una app **zoneless**, no existe `ChangeDetectorRef` manual: la reactividad proviene
  exclusivamente de los signals.

### 4.3 Enrutado y carga diferida

| Ruta | Componente | Tipo |
| --- | --- | --- |
| `/` | `Landing` | Pública, *lazy* |
| `/login` · `/registro` | `Login` · `Registro` | Públicas, *lazy* |
| `/app/inicio` | `Inicio` | Protegida (guard), *lazy* |
| `/app/carteras` | `ListaCarteras` | Protegida |
| `/app/carteras/:id` | `DetalleCartera` (5 pestañas) | Protegida, parámetro enlazado a `input()` |
| `/app/contribuyentes` | `Contribuyentes` | Protegida |
| `/app/transacciones` | `Transacciones` | Protegida |
| `/app/colaboraciones` | `Colaboraciones` | Protegida |
| `/app/inactivas` | `Inactivas` | Protegida |
| `/app/ajustes` | `Ajustes` | Protegida |
| `**` | `NoEncontrado` (404) | Pública |

El **servicio de autenticación** persiste únicamente el `idUsuario` en `localStorage`; el objeto
`Usuario` se deriva del servicio de usuarios, de modo que al editar el perfil en *Ajustes* todas
las vistas (avatares, saludos, tablas) se actualizan solas.

### 4.4 Módulo **Inicio** (bienvenida)

Se mantiene deliberadamente libre de métricas agregadas: no mezcla los números de todas las
carteras en tarjetas ni gráficas globales. La pantalla presenta dos bloques de trabajo:

| Bloque | Contenido |
| --- | --- |
| **Mis carteras** | Tarjetas de las carteras activas que administro: categoría, rango de fechas, integrantes, avance del presupuesto, gasto, aportado, número de movimientos y acceso directo al detalle |
| **Carteras en las que participo** | Tarjetas de las carteras de otros usuarios donde soy contribuyente: administrador, mi pagado, mi cuota, mi saldo, avance y registro rápido de un gasto asignado |

Las gráficas y estadísticas se consultan en contexto, dentro de cada cartera
(pestaña *Resumen* y *Cierre y balance*), no en el inicio.

### 4.5 Diseño de la pestaña **Detalle de cartera**

Concentra los flujos más complejos del panel web:

| Pestaña | Contenido |
| --- | --- |
| **Resumen** | 4 tarjetas de KPI, gráfica de barras de 6 meses (ingresos vs. gastos), dona por categoría, ranking de pagos por contribuyente y últimos movimientos |
| **Movimientos** | Tabla con filtros (texto, tipo, categoría) y CRUD completo mediante modal |
| **Contribuyentes** | Alta de miembros (usuario existente o persona nueva), aporte comprometido, aportado, movimientos y saldo; baja con confirmación |
| **Invitación QR** | QR generado localmente, clave única, copiar al portapapeles, *Web Share API* con *fallback* a portapapeles y regeneración de código |
| **Cierre y balance** | Tabla de saldos por integrante, **liquidación sugerida** (algoritmo *greedy* de mínimo número de transferencias), impresión del balance y finalización de la cartera |

---

## 5. Modelo de datos estático

`core/data/mock-data.ts` reproduce las cuatro entidades del proyecto integrador:

| Entidad | Campos implementados |
| --- | --- |
| **Usuario** | `idUsuario`, `nombreUsuario`, `APaterno`, `AMaterno`, `correo`, `contrasena`, `rol`, `telefono`, `fechaCreacion`, `color` |
| **Cartera** | `idCartera`, `nombreCartera`, `descripcion`, `idCategoriaCartera` (FK), `presupuestoInicial`, `estado`, fechas (`creacion`/`inicio`/`fin`/`cierre`), `codigoInvitacion`, `color` |
| **CategoriaCartera** | `idCategoriaCartera`, `nombreCategoriaCartera`, `descripcion`, `icono`, `color` |
| **MiembroCartera** | `idMiembro`, `idCartera`, `idUsuario`, `rol`, `aporteComprometido`, `fechaUnion` |
| **CategoriaGasto** | `idCategoriaGasto`, `nombreGasto`, `icono`, `color` |
| **Transaccion** | `idTransaccion`, `idCartera`, `idUsuario`, `idCategoriaGasto`, `nombreGasto`, `tipo`, `monto`, `fecha`, `metodoPago`, `nota` |

### 5.1 Dataset de demostración

| Cartera | Categoría | Estado | Presupuesto | Gastos | Avance |
| --- | --- | --- | ---: | ---: | ---: |
| Casa Borja | Hogar | Activa | $86,000 | $68,770 | 80 % |
| Viaje a Cancún | Viaje | Activa | $108,000 | $85,800 | 79 % |
| Boda Ana & Luis | Evento | Activa | $170,000 | $136,040 | 80 % |
| Casa de la Abuela | Hogar | Activa | $70,000 | $56,000 | 80 % |
| Posada Equipo IDGS | Evento | Activa | $24,000 | $19,770 | 82 % |
| Departamento 301 | Hogar | Inactiva | $72,000 | $57,570 | 80 % |
| Viaje a Mazatlán | Viaje | Inactiva | $98,000 | $79,020 | 81 % |

* **28 contribuyentes** y **391 movimientos** distribuidos entre 2025-11 y 2026-09.
* Los movimientos se generan con un **PRNG con semilla fija** (mulberry32): el dataset es idéntico en
  cada carga, no hay llamadas de red y las gráficas se ven pobladas desde el primer arranque.
* Las aportaciones se derivan del gasto real de cada cartera (88 %–95 %), de modo que el
  **balance final siempre suma cero** y produce liquidaciones creíbles.

### 5.2 Cuentas de demostración

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `diego@finanzapp.mx` | `demo123` | Administrador (crea y colabora en carteras) |
| `aidee@finanzapp.mx` | `demo123` | Miembro / administradora de la boda |
| `vanessa@finanzapp.mx` | `demo123` | Participante en viajes y hogar |

Cualquier correo del dataset funciona con `demo123`. Las cuentas nuevas creadas desde `/registro`
o desde el alta de contribuyentes se agregan a la memoria de la aplicación.

---

## 6. Sistema de diseño

### 6.1 Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-brand-*` (50–950) | escala verde-teal, base `#108354` | Acción principal, estados positivos, gráfica de gastos |
| `slate` (Tailwind) | — | Neutrales: textos, bordes, fondos |
| `rose` / `amber` / `blue` / `violet` | Tailwind | Gastos, alertas, categorías, administración |
| `--font-sans` | Inter + *fallback* de sistema | Tipografía completa |
| Radios | `rounded-xl` / `rounded-2xl` | Tarjetas y controles |
| Animaciones | `aparecer`, `elevar` | Entrada de modales y tarjetas |

### 6.2 Componentes reutilizables

| Componente | Uso |
| --- | --- |
| `<app-icon>` | +50 iconos vectoriales *stroke* en un solo componente, sin librería externa |
| `<app-stat-card>` | KPI con icono, tono, formato (moneda/número/compacto) y tendencia |
| `<app-bar-chart>` | Barras con rejilla, *tooltip* y segunda serie (ingresos) |
| `<app-donut-chart>` | Dona con leyenda, montos y porcentajes |
| `<app-progress>` | Avance de presupuesto con color por cartera |
| `<app-modal>` / `<app-confirm-modal>` | Diálogos con cierre por *click*, botón o tecla `Esc` |
| `<app-avatar>` / `<app-avatar-stack>` | Iniciales de color por usuario y pila con contador |
| `<app-empty-state>` | Estado vacío con acción sugerida |
| `<app-toast-host>` | Notificaciones de éxito, error e información con autocierre |
| `<app-page-header>` | Encabezado homogéneo de módulo con acciones |

### 6.3 Responsividad y accesibilidad

* **Mobile-first**: una columna en móvil, grids de 2–4 columnas en tablet/escritorio.
* Navegación adaptada al dispositivo: *sidebar* fija en escritorio, *drawer* + **barra inferior** con
  acción central destacada en móvil (`pb-[env(safe-area-inset-bottom)]` para *notch*).
* Estados de foco visibles (`focus-visible:ring`), `aria-label` en botones de icono,
  `role="switch"` + `aria-checked` en preferencias, `aria-hidden` en iconos decorativos.
* Contraste AA: textos `slate-500/600/900` sobre blanco, acciones en `brand-600/700`.
* Formularios con `label` asociado, mensajes de error junto al campo y `novalidate` + validación
  explícita para controlar el mensaje mostrado.

---

## 7. PWA y rendimiento

* **Manifest** (`public/manifest.webmanifest`) con nombre, descripción, colores, iconos 72–512 px y
  `display: standalone`.
* **Service Worker** (`@angular/service-worker` + `ngsw-config.json`): *prefetch* del *shell* de la
  aplicación (HTML, CSS y JS) y *lazy caching* de imágenes e iconos.
* **Metadatos**: `lang="es"`, `theme-color`, `description`, favicon SVG propio.
* **Carga diferida** de las 9 rutas, por lo que el *bundle* inicial se mantiene pequeño:

| Métrica (build de producción) | Valor |
| --- | --- |
| JS + CSS inicial | ≈ 344 kB sin comprimir / ≈ 90 kB comprimido |
| Chunk más grande (`detalle`) | ≈ 58 kB / 17 kB comprimido |
| Estilos globales | ≈ 50 kB / 7 kB comprimido |

* Las gráficas se dibujan con SVG/CSS (sin librerías de ~100 kB), y los iconos viven en un único
  componente, lo que evita dependencias de iconografía.

---

## 8. Verificación realizada

| Prueba | Resultado |
| --- | --- |
| `ng build` (producción, `strict` de TypeScript, `strictTemplates`) | ✅ Sin errores ni advertencias |
| Landing, login, registro, 404 | ✅ Renderizan correctamente |
| Login demo, sesión persistida tras recargar | ✅ |
| Guard de rutas: acceso a `/app/**` sin sesión | ✅ Redirige a `/login?destino=…` |
| Validación de credenciales incorrectas | ✅ Mensaje de error en línea |
| CRUD de carteras (crear, editar, archivar, eliminar con confirmación) | ✅ |
| CRUD de transacciones (crear, editar, eliminar) | ✅ |
| Alta y baja de contribuyentes (usuario existente y persona nueva) | ✅ |
| Generación de QR y enlace de invitación | ✅ Imagen `data:image/png` válida |
| Balance final y liquidación sugerida | ✅ Los saldos suman cero |
| Vistas móviles (390 × 844) | ✅ |
| Consola del navegador en todos los flujos | ✅ **0 errores** |

La verificación se realizó con un *smoke test* automatizado (Chromium headless + Puppeteer) que
recorre los flujos, valida la presencia del contenido y captura pantallas de cada módulo.

---

## 9. Ejecución del prototipo

```bash
cd finanzapp-web
npm install
npm start            # http://localhost:4200  (datos estáticos, sin backend)
npm run build        # build de producción + service worker
npx http-server dist/finanzapp-web/browser -p 8080   # opcional: probar la PWA
```

---

## 10. Alcance entregado y siguientes pasos

### Entregado

* Landing, autenticación simulada, panel completo de 9 rutas y 5 pestañas de detalle de cartera.
* CRUDs de carteras, contribuyentes y transacciones; invitación con QR; cierre y balance final.
* Sistema de diseño reutilizable, notificaciones, validaciones y estados vacíos.
* PWA instalable con *service worker*.

### Siguientes pasos sugeridos

1. **API real**: reemplazar `mock-data` por un backend REST (ASP.NET Core + MongoDB) conservando las
   firmas de los servicios (`crear`, `actualizar`, `eliminar`) para que el cambio sea mínimo.
2. **Autenticación con JWT** e interceptor HTTP; hash de contraseñas en el servidor.
3. **Subida de fotos** de comprobantes (campo `foto` ya previsto en el modelo).
4. **Tiempo real** para carteras compartidas (SignalR/WebSocket).
5. **Pruebas automatizadas**: unitarias de `utils/finanzas.ts` y *end-to-end* de los flujos críticos.
6. **Sincronización con la app móvil**: el QR (`finanzapp.mx/unirse?codigo=…`) ya define el contrato
   de incorporación desde el escaneo.
