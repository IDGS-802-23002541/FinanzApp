# FinanzApp — Backlog técnico y reparto entre 4 desarrolladores

> **Qué es este documento.** Una reorganización del backlog (`historias_de_usuario.md` + tablero Taiga) para que cada historia sea **(a) técnica** —contrato, criterios verificables y pruebas— y **(b) independiente** —ningún desarrollador espera a que otro termine una historia para empezar la suya—. Se conserva el alcance funcional; cambia la forma de trocearlo.
>
> **Cómo usarlo.** Cada ficha es una tarjeta de Taiga lista para copiar (asunto sugerido en el título). El tablero queda organizado en **4 carriles**, uno por desarrollador, más una **Iteración 0 de cimientos** común.

---

## 0. Resumen para decidir en 5 minutos

**Los 4 carriles (uno por desarrollador, en paralelo):**

| Carril | Titular | Foco | Historias | Puntos |
| :---: | --- | --- | --- | :---: |
| **1** | Diego | Identidad y usuarios (web + móvil) | I1–I5 | 16 + 2 cimientos |
| **2** | Aideé | Carteras, invitación y unión | K1–K5 | 16 + 2 cimientos |
| **3** | Vanessa | Movimientos y panel | M1–M5 | 14 + 5 cimientos |
| **4** | Damián | Analítica y cierre | A1–A5 | 16 + 2 cimientos |
| **Flotante** | — | Chat de cartera (#19) | F1 | 5 (opcional) |

**Los 3 acuerdos que hacen posible el reparto:**

1. **Contrato congelado primero** (Iteración 0): entidades, endpoints, códigos de error y códigos de invitación de prueba. Nadie programa contra supuestos.
2. **Fixtures y mocks por interfaz**: cada historia se desarrolla y se prueba con datos semilla, aunque la historia vecina no exista todavía. Las dependencias entre carriles son **contratos**, nunca pantallas.
3. **Ninguna historia pasa de 5 puntos**; las de 5 traen palanca de corte definida (se dividen al iniciarlas si el WIP se satura).

**Diferencia con el plan anterior:** el total sube de 50 a **73 puntos** (62 de funcionalidad + 11 de cimientos) porque ahora cada historia incluye su capa de datos, estados y pruebas, y se añadieron los cimientos que el prototipo estático no necesitaba. **El alcance funcional es el mismo.**

---

## 1. Diagnóstico: por qué el backlog actual no se puede repartir

| # | Síntoma en el backlog actual | Por qué bloquea el reparto | Corrección aplicada |
| :---: | --- | --- | --- |
| 1 | Historias "de pantalla completa" que mezclan capas y plataformas. Ej.: *"Unirme por QR"* = escáner + permisos + deep link + validación + registro + membresía + errores | Una sola tarjeta toca móvil, backend y web; no cabe en el WIP de un dev ni se puede revisar sola | Rebanadas verticales por comportamiento (K3, K4, K5), cada una con una capa dominante y ~3 puntos |
| 2 | Dependencias en cadena ("#11 depende de #12 que depende de #5") | Nadie empieza hasta que otro termina; el tablero se vuelve una cascada disfrazada de Kanban | Toda dependencia se convierte en **contrato + fixture**: códigos de invitación sembrados, DTOs congelados, repositorio mock conmutable |
| 3 | Criterios "de usuario" sin verificación técnica ("ve un QR válido") | No hay forma objetiva de marcar la historia como terminada | Criterios técnicos: contrato, validaciones, estados de UI, rendimiento, pruebas, a11y |
| 4 | Estimaciones hechas sobre un prototipo estático (solo web, sin backend) | Al construir móvil y capa de datos real, todo sube y el plan de 3 iteraciones se rompe | Se estima por capa entregable y se añade la Iteración 0 (contratos, fixtures, núcleo, repositorios) |
| 5 | Historias de 8 puntos marcadas "dividir al iniciar" pero sin división escrita | La división se decide con la historia ya en progreso; se pierde el flujo | Todas las historias quedan ≤ 3 puntos, salvo tres de 5 con corte definido |

**Regla de oro del nuevo backlog:** *una historia no puede depender de que otra historia esté terminada; solo puede depender del contrato congelado y de los fixtures.*

---

## 2. Estrategia: contrato primero + rebanadas verticales

### 2.1 Los 4 mecanismos de independencia

| Mecanismo | Qué es | Cómo se ve en la práctica |
| --- | --- | --- |
| **Contrato congelado** (C0.1) | Entidades, endpoints, DTOs y códigos de error aprobados por el equipo antes de programar | Cada historia cita el endpoint y el DTO que usa; un cambio de contrato es un PR al contrato, no una decisión local |
| **Fixtures deterministas** (C0.2) | Datos semilla idénticos en cada carga, con casos borde sembrados a propósito | Códigos `FZ-K7M2PD` (válido), `FZ-J5N8QW` (ya es miembro), `FZ-C3R6TY` (cartera cerrada), `FZ-V9B4XS` (regenerado); carteras sin presupuesto, movimientos con centavos, usuario sin carteras |
| **Repositorio conmutable** (C0.4) | La UI consume interfaces; hay implementación **mock** (fixtures) y luego **API** real, sin tocar las pantallas | Web: `AuthRepo`, `CarterasRepo`, `TransaccionesRepo`; Móvil: repositorios con Hilt que eligen implementación |
| **Rebanada vertical** | Cada historia entrega UI + estado + datos + pruebas **de su parte**, no "solo la vista" o "solo el servicio" | "Registrar gasto móvil" (M1) incluye ViewModel, validaciones, guardado en mock y pruebas JUnit; no espera a la API real |

### 2.2 Definition of Ready técnico (aplica a todas las historias)

- [ ] Formato Como/Quiero/Para con resultado observable.
- [ ] Endpoint(s) y DTO citados del **contrato congelado** (o "sin contrato: solo UI con fixture").
- [ ] Fixture o mock disponible para probarla sin depender de otra historia.
- [ ] Criterios de aceptación técnicos escritos (estados, validaciones, errores, rendimiento).
- [ ] Wireframe o pantalla identificada (web y/o móvil).
- [ ] ≤ 3 puntos (las de 5 traen división definida).

### 2.3 Definition of Done técnico (aplica a todas las historias)

- [ ] Código en `develop` con PR revisado por **otro** desarrollador (revisor rotativo).
- [ ] Criterios de aceptación marcados en la tarjeta + evidencia (captura o GIF corto).
- [ ] `ng build` sin errores y consola del navegador sin errores en el flujo (web).
- [ ] Pruebas: unitarias de lo puro (funciones, ViewModels) y checklist de *smoke test* de la vista.
- [ ] Responsive 390 px / 1440 px y accesibilidad básica (etiquetas, foco visible, `role="switch"` donde aplique, contraste AA).
- [ ] Montos en MXN `es-MX`, fechas `dd/MM/aaaa`.
- [ ] Si tocó contrato o fixtures: actualizados con PR propio y aviso al equipo.
- [ ] Documentación mínima actualizada (nota técnica en la tarjeta o README).

---

## 3. Iteración 0 — Cimientos (11 pts · 3 días · todo el equipo)

Sin esto, los carriles no pueden correr en paralelo. **Criterio de salida:** contrato firmado por los 4, fixtures en el repo, mocks operando y vectores dorados en verde.

| ID | Entregable | Titular | Pts | Criterio de aceptación técnica |
| --- | --- | :---: | :---: | --- |
| **C0.1** | **Contrato de dominio y API v1** en `docs/contrato-v1.md`: entidades con tipos exactos (espejo de `core/models.ts` y de la app móvil), endpoints con request/response/errores, catálogo de códigos, ejemplos JSON | Carril 1 | 2 | Los 4 desarrolladores revisan y firman; cada historia del backlog cita un endpoint/DTO existente; cambio posterior = PR con versión |
| **C0.2** | **Semilla determinista + fixtures compartidos**: JSON con los IDs de `mock-data.ts` (7 carteras, 28 usuarios, 391 movimientos) y tabla de casos borde | Carril 2 | 2 | Dataset idéntico en cada carga (semilla fija); incluye: cartera sin presupuesto, cartera cerrada, miembro con saldo 0, movimientos con centavos, usuario sin carteras, códigos de invitación de prueba |
| **C0.3** | **Núcleo de cálculo financiero congelado** (`core/utils/finanzas.ts` + `finanzas.spec.ts`) y publicación de "vectores dorados" para móvil | Carril 4 | 2 | Pasan los vectores V1–V4 de `liquidar()`, tolerancia ±$1.00, suma de saldos = $0; casos de cuota con centavos |
| **C0.4** | **Capa de datos conmutable (mock ⇄ API)**: interfaces `AuthRepo`, `UsuariosRepo`, `CarterasRepo`, `TransaccionesRepo`, `InvitacionesRepo` + implementación mock; mismo patrón en móvil (Hilt + flavor) | Carril 3 | 3 | Cambiar de mock a API es cambiar un provider/flavor; los componentes no conocen la fuente; pruebas inyectan fakes |
| **C0.5** | **Esqueleto de navegación y deep links**: rutas `/app/inicio` y `/app/colaboraciones` reales, contrato de URL `finanzapp.mx/unirse?codigo=`, barra inferior móvil con acción central | Carril 3 | 2 | El deep link abre la pantalla de unión con el código precargado (contra mock); la URL de retorno post-login respeta `?destino=` |

---

## 4. Contratos congelados (v1) — resumen

### 4.1 Entidades

Se reutilizan las de `finanzapp-web/src/app/core/models.ts` sin renombrar campos: `Usuario`, `Cartera`, `MiembroCartera`, `CategoriaCartera`, `CategoriaGasto`, `Transaccion`, `BalanceMiembro`, `Liquidacion`, `ResumenCartera`, `FiltroTransacciones`. En móvil se replica la misma nomenclatura (Kotlin data classes).

### 4.2 Endpoints previstos (fase API; en Iteración 1–3 se consumen vía mock)

| Endpoint | Método | Historias que lo usan |
| --- | --- | --- |
| `/auth/login` · `/auth/registro` · `/auth/me` · `/auth/logout` | POST/GET | I1, I2, I3 |
| `/usuarios` · `/usuarios/{id}` · `/usuarios/{id}/contrasena` | GET/POST/PUT | I2, I4, I5 |
| `/carteras` · `/carteras/{id}` · `/carteras/{id}/archivar` | GET/POST/PUT/PATCH | K1, M4, M5, A5 |
| `/carteras/{id}/invitacion/regenerar` | POST | K2 |
| `/carteras/unirse` · `/carteras/unirse/{codigo}/vista-previa` | POST/GET | K4 |
| `/carteras/{id}/miembros` · `/carteras/{id}/miembros/{idMiembro}` | GET/POST/PUT/DELETE | I5 |
| `/transacciones` | GET/POST/PUT/DELETE | M1, M2, M3 |
| `/carteras/{id}/resumen` | GET | A1–A4, M4, M5 |
| `/carteras/{id}/cerrar` | POST | A4 |
| `/carteras/{id}/mensajes` | GET/POST | F1 (chat) |

### 4.3 Formato de error y catálogo

```json
{ "codigo": "INVITACION_INVALIDA", "mensaje": "La invitación ya no es válida; pide un nuevo código al administrador", "detalle": {} }
```

Catálogo: `CREDENCIALES_INVALIDAS` (401) · `NO_AUTENTICADO` (401) · `SIN_PERMISO` (403) · `NO_ENCONTRADO` (404) · `INVITACION_INVALIDA` (404) · `CORREO_DUPLICADO` (409) · `YA_ES_MIEMBRO` (409) · `CARTERA_CERRADA` (409) · `ULTIMO_ADMIN` (409) · `MONTO_INVALIDO` (422) · `VALIDACION` (422).

### 4.4 Interfaces entre carriles (lo único que se comparte)

| Interfaz | Dueño | Consumidores | Qué congela |
| --- | :---: | --- | --- |
| `UsuarioDTO` (campos, roles `admin`/`miembro`) | Carril 1 | Todos | Nombres de campos y rol global vs. rol en cartera |
| Claves de almacenamiento: `finanzapp.sesion`, `finanzapp.invitacionPendiente`, `finanzapp.preferencias` (móvil: `sesion`, `invitacion_pendiente`) | Carril 1 | I2, I3, K5, I4 | Formato y momento de escritura |
| `InvitacionDTO` `{ codigo, idCartera, estado }` + resultados del canje | Carril 2 | I2, I3, K5 | Formato `FZ-XXXXXX` sin caracteres ambiguos y los 4 resultados posibles (válido, ya miembro, cerrada, regenerada) |
| `TransaccionDTO` (campos, tipos, decimales) | Carril 3 | Carriles 2, 4, M4/M5 | Payload de registro y edición |
| `ResumenCarteraDTO` (saldos, cuota, liquidaciones) | Carril 4 | M4, M5, A3 | Fórmulas y tolerancias (±$1.00) |
| URL de unión `finanzapp.mx/unirse?codigo=` y ruta de retorno post-login | Carril 3 (C0.5) | Carriles 1, 2 | Deep link y `?destino=` |

---

## 5. Carril 1 — Identidad y usuarios · Diego

> **Titular: Diego.** Carril de formularios y Angular; alimenta a todos: entrega `UsuarioDTO`, la sesión y la gestión de contribuyentes.

### I1 · Sesión web: login, guard y retorno al destino — **3 pts** · Iter 1 · [web]
*Reemplaza a la historia de login del prototipo (probable #1–#3).*

**Alcance.** `features/auth/login.ts`, `core/services/auth.service.ts`, `core/guards/auth.guard.ts`; consumo vía `AuthRepo` (mock C0.4); persistencia de `idUsuario` en `localStorage.finanzapp.sesion`.

**Aceptación técnica.**
- Credenciales de fixture → redirige a carteras (o a `?destino=`) y la barra superior muestra el nombre.
- Credenciales malas → mensaje genérico (`CREDENCIALES_INVALIDAS`), sin distinguir correo/contraseña; el correo escrito se conserva.
- Recargar o reabrir conserva la sesión; cerrar sesión limpia la clave y va a la landing.
- Ruta `/app/**` sin sesión → `/login?destino=…` y, tras entrar, vuelve a esa ruta.
- El correo se normaliza (`trim` + minúsculas); el botón se habilita solo con formato válido.
- Bloqueo del botón mientras "entrando" (evita doble envío).

**Pruebas mínimas.** Unit del guard y de la normalización; smoke de los 5 casos.

**Independencia.** Solo usa `AuthRepo` mock y fixtures de usuarios. No necesita registro ni carteras.

### I2 · Registro web con conservación del código de invitación — **3 pts** · Iter 1 · [web]
*Reemplaza a "Crear una cuenta nueva" + parte de #7.*

**Alcance.** `features/auth/registro.ts`, `usuarios.service.registrarNuevo` (vía `UsuariosRepo`); auto-login al terminar; si la URL trae `?codigo=`, se guarda en `sessionStorage.finanzapp.invitacionPendiente` y se navega a la ruta de unión **sin volver a capturarlo**.

**Aceptación técnica.**
- Formulario válido → cuenta creada (contra fixture), sesión iniciada y destino original.
- Correo existente → `CORREO_DUPLICADO` + enlace directo a login; no se crea la cuenta.
- Contraseña < 6 o sin letra y número → error junto al campo; no se envía.
- Teléfono opcional con formato 10 dígitos MX; error aclarado si es inválido.
- Viniendo con `?codigo=FZ-…`, el código sobrevive al registro (misma clave de `sessionStorage` que usa K5).
- Doble tap en "Crear cuenta" no duplica la petición.

**Pruebas mínimas.** Unit de validadores; smoke: registro normal y registro con código.

**Independencia.** El código se prueba con el fixture `FZ-K7M2PD`; no depende del escáner móvil ni de la pantalla de unión.

### I3 · Autenticación móvil: Login y Registro con MVVM — **5 pts** · Iter 2 · [móvil]
*Reemplaza a la parte móvil de login/registro. Palanca de corte: login (3) / registro (2).*

**Alcance.** `LoginFragment` + `LoginViewModel`, `RegistroFragment` + `RegistroViewModel` con `StateFlow` (`correo`, `contrasena`, `cargando`, `error`); sesión en `DataStore`; `SavedStateHandle` para el código pendiente; navegación con Navigation Component; `AuthRepository` con implementación fake.

**Aceptación técnica.**
- Login y registro completan el flujo con los mismos DTOs/errores que I1/I2 (contrato compartido).
- Errores de red simulados muestran mensaje accionable y no pieren el formulario.
- Rotación y muerte del proceso conservan el estado y el código pendiente.
- Validaciones en el ViewModel (no en el Fragment) y cubiertas con JUnit.
- Sesión persistida en `DataStore`; cerrar sesión limpia token y vuelve al inicio.

**Pruebas mínimas.** JUnit de ambos ViewModels (éxito, credenciales malas, doble submit, rotación); smoke en emulador.

**Independencia.** Trabaja contra `AuthRepository` fake y fixtures; no requiere que la API real ni el escáner existan.

### I4 · Perfil, contraseña y preferencias — **2 pts** · Iter 3 · [web; espejo móvil fase 2]
*Reemplaza a #18 "Ajustar el perfil y las preferencias".*

**Alcance.** `features/ajustes/ajustes.ts`; `AuthService.usuario` es `computed`, así que el cambio se propaga solo; preferencias en `localStorage.finanzapp.preferencias`.

**Aceptación técnica.**
- Guardar perfil actualiza saludo/avatares al instante, sin recargar.
- Correo ya usado por otra cuenta → error `CORREO_DUPLICADO`; no se guarda.
- Cambio de contraseña exige la actual correcta; la nueva cumple la política; se confirma con toast.
- Los switches persisten al recargar y se anuncian con `role="switch"` + `aria-checked`.
- "Cerrar sesión" con confirmación y regreso a la landing.

**Pruebas mínimas.** Unit de persistencia de preferencias; smoke de cambio de contraseña fallido y exitoso.

**Independencia.** Solo necesita sesión activa y fixtures de usuarios.

### I5 · Contribuyentes: alta, consulta y baja — **3 pts** · Iter 3 · [web]
*Reemplaza a #8 "Administrar los contribuyentes de una cartera".*

**Alcance.** `features/contribuyentes/contribuyentes.ts` + `miembro-form.ts`; vínculo usuario–cartera vía `CarterasRepo` (mock): buscar usuario existente o crear persona nueva (`origen=admin`), editar aporte comprometido, baja con confirmación.

**Aceptación técnica.**
- Buscar por nombre o correo (case-insensitive), agregar existente → aparece como miembro; duplicado → `YA_ES_MIEMBRO` sin alterar la lista.
- Crear persona nueva reutiliza el contrato de I2 con `origen=admin` (cuenta queda registrada y vinculada).
- Filtro por nombre reduce la tabla en línea; el estado vacío ofrece "Limpiar filtros".
- Baja muestra advertencia con el saldo del miembro; sus movimientos **no se eliminan** y los totales se recalculan.
- No se puede dar de baja al último administrador (`ULTIMO_ADMIN`).
- Los miembros solo consultan; las acciones de escritura se ocultan con el helper `puedeAdministrar(cartera, usuario)`.

**Pruebas mínimas.** Unit del helper de permisos; smoke de alta existente, alta nueva, duplicado y baja.

**Independencia.** Trabaja con cartera y usuarios de fixtures; no depende de que exista el QR (K2) ni la vista de colaboraciones (M4).

---

## 6. Carril 2 — Carteras, invitación y unión · Aideé

> **Titular: Aideé.** Carril web + móvil de la incorporación de personas (el diferenciador del producto).

### K1 · Carteras: crear, editar, archivar y eliminar — **5 pts** · Iter 1 · [web]
*Reemplaza a "Crear y administrar carteras". Palanca de corte: crear/editar (3) / ciclo de vida y permisos (2).*

**Alcance.** `features/carteras/lista.ts`, `cartera-form.ts`; `CarterasRepo`; modelo `Cartera` + `CategoriaCartera`; confirmaciones con `ConfirmModal`.

**Aceptación técnica.**
- Crear: nombre 3–60 chars, descripción ≤ 200, presupuesto > 0 o vacío; quien crea queda como `admin` + miembro y la cartera nace con `codigoInvitacion`.
- Categoría Viaje/Evento exige fecha inicio y fin; fin ≥ inicio (si no, error y no guarda). Hogar no las pide.
- Presupuesto vacío → la cartera se crea sin presupuesto y la UI oculta el avance.
- Editar/archivar/eliminar solo disponibles para propietario o admin (`puedeAdministrar`); el miembro no ve las acciones.
- Eliminar cartera con movimientos → se advierte y se sugiere archivar; nunca sin confirmación.
- Archivar pasa a `inactiva` + `fechaCierre` y desaparece de las activas.
- Nombres duplicados del mismo dueño: aviso, no bloqueo.

**Pruebas mínimas.** Unit de reglas por categoría; smoke de los 7 casos; verificación de recálculo del listado.

**Independencia.** Funciona con fixtures; el QR (K2) solo lee `codigoInvitacion`.

### K2 · Invitación QR: generar, copiar, compartir y regenerar — **3 pts** · Iter 1 · [web]
*Reemplaza a #4.*

**Alcance.** Pestaña Invitación de `detalle.ts`; librería `qrcode` a *data URL*; `navigator.share` con *fallback* a `navigator.clipboard`; contrato `POST /carteras/{id}/invitacion/regenerar`.

**Aceptación técnica.**
- QR renderizado localmente (sin llamadas externas) y clave en texto grande, formato `FZ-XXXXXX` sin `O/0/I/1`.
- "Copiar clave" → portapapeles + toast; en navegadores sin permiso, mensaje para copiar a mano.
- "Compartir" → Web Share API; sin soporte → copia el enlace y avisa.
- "Regenerar" (solo admin) invalida el código anterior de inmediato: el fixture `FZ-V9B4XS` deja de servir y los enlaces viejos muestran `INVITACION_INVALIDA`.
- No administrador → modo lectura, sin botón de regenerar.
- QR legible impreso en blanco y negro (prueba impresa o captura).

**Pruebas mínimas.** Smoke de copiar/compartir/regenerar; verificación de que el código viejo falla.

**Independencia.** Solo necesita la cartera de fixture; la validación del código pertenece a K4.

### K3 · Escáner QR móvil con captura manual — **3 pts** · Iter 2 · [móvil]
*Reemplaza a #5. Incluye la interfaz `EscanerCodigo` con implementación fake para pruebas.*

**Alcance.** `UnirseFragment` (paso 1) + `UnirseViewModel` con estados `escaneando/capturando`; CameraX + ML Kit tras la interfaz `EscanerCodigo` (alternativa ZXing); campo de captura manual conectado al mismo ViewModel.

**Aceptación técnica.**
- Un QR válido frente a la cámara se lee una sola vez y avanza al estado de validación.
- La captura manual está visible desde el día 1 y recorre el mismo camino que el escaneo.
- Permiso denegado o emulador sin cámara → explicación + captura manual habilitada, sin bloquear el flujo.
- Un QR de otra app se ignora y se sigue escaneando.
- `EscanerCodigo` se sustituye por un fake en pruebas automatizadas (flujo completo sin cámara).

**Pruebas mínimas.** JUnit del ViewModel con fake (estados y transiciones); smoke en al menos 1 dispositivo físico.

**Independencia.** Se prueba con el fixture `FZ-K7M2PD`; no requiere que K2 (QR real) ni K4 (canje) estén terminadas.

### K4 · Validación del código, vista previa y unión — **3 pts** · Iter 2 · [móvil]
*Reemplaza a #6.*

**Alcance.** `POST /carteras/unirse` vía `InvitacionesRepo` mock; pantalla de confirmación con nombre de cartera, administrador, categoría y fechas; persistencia de la membresía; navegación al inicio.

**Aceptación técnica.**
- Código válido → vista previa con datos de la cartera y confirmación; al confirmar, la cartera aparece en el inicio con rol de miembro.
- `INVITACION_INVALIDA` (no existe o regenerado) → mensaje "La invitación ya no es válida; pide un nuevo código".
- `YA_ES_MIEMBRO` → aviso; no se duplica la membresía (clave `idCartera + idUsuario`).
- `CARTERA_CERRADA` → "La cartera ya finalizó y no admite nuevos miembros".
- Doble confirmación por doble tap no crea dos membresías.
- La validación se ejecuta del lado del repositorio (simulando servidor), no solo en la vista.

**Pruebas mínimas.** Unit del repositorio con los 4 fixtures de código (`FZ-K7M2PD`, `FZ-J5N8QW`, `FZ-C3R6TY`, `FZ-V9B4XS`).

**Independencia.** Consume fixtures y mock; no depende del escáner real (K3) — se puede probar con captura manual.

### K5 · Conservar el código durante registro o inicio de sesión — **2 pts** · Iter 3 · [móvil + web]
*Reemplaza a #7.*

**Alcance.** Interfaz `InvitacionPendienteRepo` (dueño: Carril 2) sobre `SavedStateHandle`/`DataStore` (móvil) y `sessionStorage` (web). I2/I3 escriben; K4 lee al terminar la autenticación.

**Aceptación técnica.**
- Llegar por enlace con código → si no hay sesión, se pide registrarse/entrar y al terminar **el flujo continúa con el mismo código**, sin volver a capturarlo.
- Muerte del proceso a mitad del registro → el código sobrevive.
- Sin código pendiente, el flujo de autenticación termina normal (no hay pasos fantasma).
- El código se limpia una vez consumido o si la invitación falla definitivamente.

**Pruebas mínimas.** Unit del repositorio (guardar, leer, limpiar) en ambos clientes; prueba manual matando la app.

**Independencia.** Se integra contra las interfaces de I2/I3 y K4, pero se prueba con un código fixture y una pantalla de autenticación fake.

---

## 7. Carril 3 — Movimientos y panel · Vanessa

> **Titular: Vanessa.** Registro en campo y tablas; produce los datos que consumen todos los carriles.

### M1 · Registro rápido de un movimiento (móvil) — **3 pts** · Iter 1 · [móvil]
*Reemplaza a #9.*

**Alcance.** `MovimientoFragment` + `MovimientoViewModel` (`StateFlow`: `monto`, `tipo`, `categoria`, `fecha`, `nota`, `guardando`); `TransaccionDao.insert` detrás de `TransaccionesRepo`; teclado `numberDecimal`; snackbar con "Registrar otro".

**Aceptación técnica.**
- Defaults al abrir: tipo `gasto`, fecha hoy, cartera de contexto, método `efectivo`.
- Monto obligatorio > 0 y ≤ $1,000,000, hasta 2 decimales; error claro si no cumple; botón deshabilitado sin monto válido.
- Nota opcional ≤ 120 caracteres con contador visible.
- Guardar → aparece en la cartera y actualiza totales; "Registrar otro" limpia monto/nota y conserva cartera/tipo/categoría.
- Doble tap en Guardar bloqueado; sin conexión (simulada) mensaje claro (offline queda diferido a fase 2).
- Cada movimiento guarda `idUsuario` (necesario para saldos de A1).
- Validaciones en el ViewModel, cubiertas con JUnit.

**Pruebas mínimas.** JUnit (válido, monto 0, monto límite, doble submit, "registrar otro"); smoke en emulador.

**Independencia.** Guarda contra el repo mock con la cartera de fixture; no requiere lista web ni analítica.

### M2 · Lista y filtros de movimientos (web) — **3 pts** · Iter 2 · [web]
*Parte de #10.*

**Alcance.** `features/transacciones/transacciones.ts`; filtros como `signal` + `computed`; función pura `filtrar()` ya existente en `finanzas.ts`; estado vacío con `EmptyState`.

**Aceptación técnica.**
- Tabla por fecha descendente con fecha, descripción, categoría, cartera, responsable, método y monto (ingreso verde / gasto rojo).
- Filtros combinables AND: texto (nombre+nota), tipo, cartera, categoría y mes; contador y **suma de los filtrados** visibles.
- Filtros sin resultados → estado vacío con "Limpiar filtros".
- Filtrado O(n) sobre 391 fixtures sin bloquear la UI (percepción < 200 ms).
- Responsive: en 390 px se convierte en tarjetas sin scroll horizontal.

**Pruebas mínimas.** Unit de `filtrar()` con combinaciones y texto con acentos; smoke de la tabla en ambas resoluciones.

**Independencia.** Lee fixtures de transacciones; no depende de la edición (M3) ni del resumen (A3).

### M3 · Edición y eliminación de movimientos (web) — **2 pts** · Iter 2 · [web]
*Parte de #10.*

**Alcance.** Modal reutilizable (`transaccion-form.ts`) desde la tabla global y desde el detalle de cartera; `TransaccionesRepo.actualizar/eliminar`.

**Aceptación técnica.**
- Editar abre el modal precargado y guarda con las mismas validaciones de M1 (monto, fecha, categoría, nota).
- Eliminar pide confirmación; al aceptar, desaparece y se recalculan los totales de la vista.
- Cartera finalizada → acciones deshabilitadas con mensaje "Cartera finalizada".
- Un miembro solo puede editar/eliminar movimientos propios; el admin de la cartera, cualquiera.
- Cambios se reflejan al volver a la lista sin recargar la página.

**Pruebas mínimas.** Unit de permisos de edición; smoke editar/eliminar/confirmación.

**Independencia.** Usa fixtures y el modal existente; no depende de A3 ni del móvil.

### M4 · Colaboraciones: contribuir en carteras de otras personas — **3 pts** · Iter 3 · [web; espejo móvil fase 2]
*Reemplaza a #16.*

**Alcance.** Pestaña "Compartidas" (`lista.ts`) y detalle en modo lectura con `puedeAdministrar`; tarjetas con administrador, mi pagado, mi cuota, mi saldo; botón "Registrar mi gasto" que abre el formulario con cartera y usuario preseleccionados.

**Aceptación técnica.**
- Cada tarjeta muestra mis números personales calculados con `ResumenCarteraDTO` (C0.3): pagado, cuota, saldo; saldo negativo en rojo con leyenda "Debes aportar".
- Detalle en modo lectura: sin editar cartera, sin invitar, sin cerrar, sin eliminar movimientos ajenos.
- "Registrar mi gasto" abre el formulario preseleccionado y al guardar actualiza "mi pagado" al instante.
- En la lista de participantes se ve nombre y montos, nunca correo ni teléfono.
- Miembro dado de baja → error claro al abrir el enlace; cartera cerrada → solo lectura absoluta.

**Pruebas mínimas.** Unit del helper de permisos y del cálculo de saldo personal; smoke con las cuentas demo.

**Independencia.** Consume `ResumenCartera` de C0.3 y fixtures; no espera a que A3 (gráficas) exista.

### M5 · Panel de inicio: mis carteras y colaboraciones — **3 pts** · Iter 3 · [web]
*Reemplaza al "Panel de bienvenida".*

**Alcance.** `features/dashboard/inicio.ts` (o la pestaña equivalente de `/app/carteras` como está hoy); `StatCard`, `ProgressBar`, `Avatar`; `avancePresupuesto` de C0.3.

**Aceptación técnica.**
- Bloque "Mis carteras": activas que administro, orden por fecha de creación descendente, tarjeta con categoría, fechas, integrantes, avance, gasto y nº de movimientos.
- Bloque "Carteras en las que participo": tarjetas de carteras ajenas con administrador, mi pagado, mi cuota, mi saldo y "Registrar gasto".
- Usuario sin carteras → estado vacío con "Nueva cartera" y "Unirse con QR".
- Carteras archivadas no aparecen (solo en Inactivas).
- 390 px: columnas apiladas + barra inferior; los cálculos provienen de C0.3, no se duplican en la vista.

**Pruebas mínimas.** Unit de los `computed` de agrupación; smoke con la cuenta de un contribuyente sin carteras propias (Damián).

**Independencia.** Se maqueta y prueba con fixtures; no requiere auth real ni datos de otros carriles.

---

## 8. Carril 4 — Analítica y cierre · Damián

> **Titular: Damián.** Dinero y reglas de negocio (algoritmos y redondeos); es el carril con la lógica más delicada.

### A1 · Saldos por integrante — **3 pts** · Iter 1 · [web, lógica compartida]
*Reemplaza a #11.*

**Alcance.** `calcularResumen()` de `finanzas.ts` ya existente: `cuota = totalGastos / nº miembros`, `pagado` = gastos propios, `aportado` = ingresos propios, `saldo = pagado − cuota`; tabla por integrante en el detalle de cartera.

**Aceptación técnica.**
- La tabla muestra pagado, aportado, cuota y saldo por integrante, ordenada por pagado descendente.
- Verificación automática: la suma de saldos = $0 con tolerancia ±$1.00; si no, la vista advierte.
- Cartera sin movimientos → cuota $0 y saldos $0 sin errores.
- Montos redondeados a centavos al mostrar; los valores intermedios no se redondean dos veces.
- Unitarias de casos límite: 3 miembros con centavos impares, miembro dado de baja con movimientos vivos, un solo miembro.

**Pruebas mínimas.** Unit de vectores con centavos; smoke de la tabla.

**Independencia.** Consume transacciones y miembros de fixtures; no requiere gráficas ni cierre.

### A2 · Liquidación sugerida con el mínimo de transferencias — **3 pts** · Iter 2 · [lógica compartida]
*Reemplaza a #12.*

**Alcance.** `liquidar()` (algoritmo *greedy* ya existente): ordena deudores y acreedores por monto y empareja el mayor con el mayor; omite saldos dentro de ±$1.00.

**Aceptación técnica.**
- Con saldos ≠ 0 produce transferencias "X le transfiere $N a Y" que, aplicadas, dejan todos los saldos dentro de ±$1.00.
- Invariantes probadas: (1) `|saldo| ≤ $1.00` no genera transferencias; (2) ninguna deuda > $1.00 queda pendiente; (3) nº de transferencias ≤ n − 1; (4) suma de transferencias coincide ±$0.01 con lo esperado.
- Vectores obligatorios: V1 `+33.34, −16.67, −16.67` → 2 transferencias de $16.67; V2 con residuo `−0.01`; V3 `+1.00/−1.00` → 0 transferencias; V4 `+1.01/−1.01` → 1 transferencia de $1.01.
- Comparaciones con `Math.round(x * 100) / 100` ante flotantes (`33.34 − 16.67 − 16.67 ≠ 0` en binario).

**Pruebas mínimas.** `core/utils/finanzas.spec.ts` con V1–V4 (obligatorio para el DoD).

**Independencia.** Función pura; se prueba con vectores sin UI ni fixtures.

### A3 · Resumen y estadísticas de una cartera — **5 pts** · Iter 2–3 · [web]
*Reemplaza a #15. Palanca de corte: KPIs + barras (3) / dona + ranking + estados (2).*

**Alcance.** Pestaña Resumen de `detalle.ts`; `StatCard`, `BarChart`, `DonutChart`; `serieMensual`, `gastosPorCategoria`, `avancePresupuesto` de C0.3.

**Aceptación técnica.**
- 4 KPI (presupuesto, gastado, disponible, movimientos) que coinciden con la suma de los movimientos.
- Avance del presupuesto con color; alerta a partir del 90 %; cartera sin presupuesto → KPI "disponible" se oculta y se usa total de ingresos como base.
- Barras de 6 meses (gastos vs. ingresos) en formato compacto k/M; meses sin datos en cero.
- Dona de gasto: top 6 con porcentajes que suman 100 % (redondeo a 1 decimal y ajuste del residuo).
- Ranking de pagos por contribuyente y últimos movimientos; cartera sin movimientos → KPIs en cero + estado vacío que invita a registrar.
- Gráficas y tarjetas se reorganizan sin desbordarse entre 390 y 1440 px.

**Pruebas mínimas.** Unit de `serieMensual` (meses vacíos, cambio de año), dona (porcentajes suman 100) y `avancePresupuesto` (sin presupuesto); smoke visual.

**Independencia.** Se maqueta con fixtures; no requiere que el cierre (A4) exista.

### A4 · Finalizar cartera e imprimir el balance — **3 pts** · Iter 2 · [web]
*Reemplaza a #13.*

**Alcance.** Pestaña "Cierre y balance"; `ConfirmModal`; `@media print`; `CarterasRepo.finalizar(id)`; validación de `CARTERA_CERRADA` en todas las escrituras (mock con el mismo contrato del servidor).

**Aceptación técnica.**
- "Imprimir" abre la impresión con tabla de saldos y liquidación legibles, sin encabezados/sidebar de la app.
- "Finalizar cartera" pide confirmación y deja `estado=inactiva` + `fechaCierre`; aparece en Inactivas.
- Tras el cierre quedan bloqueados: registrar/editar movimientos, alta/baja de miembros y regenerar el código, con mensaje "Cartera finalizada".
- El cierre es irreversible en el MVP (reapertura = fase 2 con bitácora).
- No administrador → ve el balance, pero no el botón Finalizar.
- La barra de acciones (imprimir/finalizar) no rompe el layout en 390 px.

**Pruebas mínimas.** Unit de bloqueo de escrituras en cartera cerrada; smoke imprimir con vista previa de impresión del navegador.

**Independencia.** Usa A1/A2 de su mismo carril y fixtures; no espera a A5.

### A5 · Histórico de carteras finalizadas — **2 pts** · Iter 2 · [web]
*Reemplaza a #17.*

**Alcance.** `features/inactivas/inactivas.ts`; `CarterasRepo.inactivasDe(idUsuario)`; detalle en solo lectura absoluta.

**Aceptación técnica.**
- Lista ordenada por `fechaCierre` descendente con categoría, fecha de cierre y total gastado.
- Buscador por nombre en línea y filtro por categoría; cartera activa no aparece.
- Detalle: balance final y liquidación congelados (no se recalculan), sin acciones de escritura.
- Un miembro ve solo carteras finalizadas donde participó; miembro eliminado tras el cierre conserva lectura.
- Cartera finalizada sin movimientos se muestra con total $0 sin errores.

**Pruebas mínimas.** Smoke con las 2 carteras inactivas del fixture; unit del filtro.

**Independencia.** Prueba con fixtures ya inactivas; no requiere que A4 esté terminada.

---

## 9. Historia flotante — F1 · Chat de cartera (Taiga #19)

> Se queda **sin carril fijo**: la toma quien libere capacidad (Iter 3 hay hueco en el Carril 2) o se divide si el equipo decide priorizarla. Puntos: **5** (corte: web 3 / móvil 2). Prioridad media.

**Alcance.** Pestaña *Chat* en el detalle de cartera (web) y pantalla de chat en móvil; modelo `Mensaje { idMensaje, idCartera, idUsuario, texto, fecha }`; endpoints `GET /carteras/{id}/mensajes?desde=…` y `POST /carteras/{id}/mensajes`; en el MVP el refresco es **polling cada 5 s** (WebSocket = fase 2).

**Aceptación técnica.**
- Mensajes en orden cronológico con avatar y nombre del autor; máximo 500 caracteres con contador.
- Estado vacío ("Aún no hay mensajes"), estados de carga y error con reintento.
- Solo miembros de la cartera leen y escriben; cartera finalizada → solo lectura.
- Envío optimista con estado "enviando/error" y sin duplicados al reenviar; rate limit 1 mensaje/segundo simulado en el repositorio.
- Sin edición ni borrado de mensajes en el MVP; sin notificaciones push.
- Pruebas: unit del repositorio (paginación, límite, orden) y smoke de envío y recepción con dos cuentas demo.

---

## 10. Resumen del reparto

| Carril | Titular | Historias | Funcionalidad | Cimientos | **Total** |
| :---: | --- | --- | :---: | :---: | :---: |
| 1 · Identidad y usuarios | Diego | I1–I5 | 16 | 2 (C0.1) | **18** |
| 2 · Carteras y unión | Aideé | K1–K5 | 16 | 2 (C0.2) | **18** |
| 3 · Movimientos y panel | Vanessa | M1–M5 | 14 | 5 (C0.4, C0.5) | **19** |
| 4 · Analítica y cierre | Damián | A1–A5 | 16 | 2 (C0.3) | **18** |
| | | | **62** | **11** | **73** |
| Flotante | — | F1 · Chat | 5 | — | **5** (opcional) |

**Balance:** 18–19 puntos por desarrollador, con la Iteración 0 compartida. Si un carril se satura a mitad de iteración, las piezas para mover son K5 (2), M3 (2) y A5 (2), que no rompen contexto.

---

## 11. Plan de iteraciones en paralelo

> Referencia de flujo para controlar el WIP (límite sugerido: 2 historias en progreso por dev). Ajusten según su velocidad real; lo importante es que **cada carril avanza en cada iteración sin bloquearse**.

| Iteración | Carril 1 · Diego | Carril 2 · Aideé | Carril 3 · Vanessa | Carril 4 · Damián | Demo del incremento |
| :---: | --- | --- | --- | --- | --- |
| **0** (3 días) | C0.1 | C0.2 | C0.4 + C0.5 | C0.3 | Contrato firmado, fixtures en repo, mocks operando, vectores dorados en verde |
| **1** (2 sem) | I1, I2 | K1, K2 | M1 | A1, A2 | Login/registro web, crear cartera y ver QR, gasto registrado desde el mock móvil, saldos y liquidación probados |
| **2** (2 sem) | I3 | K3, K4 | M2, M3 | A3 | Auth móvil, escanear y unirse (o capturar el código), lista y edición de movimientos, resumen con gráficas |
| **3** (2 sem) | I4, I5 | K5 | M4, M5 | A4, A5 | Perfil y contribuyentes, conservar código al entrar, colaboraciones, finalizar + imprimir, histórico |
| **Colchón** | F1 (chat) · deuda técnica · integración · pruebas de usuario | | | | |

**Demo obligatoria al cierre de cada iteración**, con la misma historia contada de punta a punta (no capturas sueltas por carril).

---

## 12. Integración y trabajo en equipo

| Regla | Detalle |
| --- | --- |
| **Ramas** | `main` (demo estable) ← PR de `develop`; cada historia vive en `hu/<id>-slug` y entra a `develop` con PR revisado por otro dev |
| **Contrato** | Vive en `docs/contrato-v1.md`; cualquier cambio se hace **primero** en el contrato (PR corto), se avisa en el chat del equipo y después se toca el código |
| **Fixtures** | `finanzapp-web/src/app/core/data/fixtures/` y su espejo móvil; nadie edita fixtures ajenos sin PR sobre C0.2 |
| **Mocks** | Las pantallas siempre consumen repositorios; prohibido importar `mock-data` directamente en componentes |
| **Cadencia** | Lunes: 15 min de planeación de WIP por carril. Miércoles: 10 min de integración (contrato + bloqueos). Viernes: demo interna y tablero al día |
| **Revisor rotativo** | Ningún PR se aprueba por su autor; rotar pareja semanal (1↔3, 2↔4 y luego cruzar) |
| **Cierre de historia** | Solo con criterios marcados, pruebas verdes y evidencia en la tarjeta |

---

## 13. Remapeo del tablero Taiga

| Tarjeta actual | Acción | Nueva historia |
| --- | --- | --- |
| #4 Invitar contribuyentes con QR y clave única | Editar: título + CA técnicos | **K2** |
| #5 Obtener el código: escanear / enlace / escribirlo | Editar | **K3** |
| #6 Validar el código y confirmar la reunión | Editar | **K4** |
| #7 Conservar el código al registrarme o iniciar sesión | Editar | **K5** |
| #8 Administrar los contribuyentes de una cartera | Editar | **I5** |
| #9 Registrar un gasto o un ingreso en segundos | Editar | **M1** |
| #10 Consultar, filtrar y editar movimientos | **Dividir** | **M2** + **M3** |
| #11 Consultar los saldos por integrante | Editar | **A1** |
| #12 Liquidación sugerida con el mínimo de transferencias | Editar | **A2** |
| #13 Finalizar la cartera e imprimir el balance | Editar | **A4** |
| #15 Consultar el resumen y las estadísticas de una cartera | Editar | **A3** |
| #16 Contribuir en carteras de otras personas | Editar | **M4** |
| #17 Consultar carteras finalizadas (histórico) | Editar | **A5** |
| #18 Ajustar el perfil y las preferencias | Editar | **I4** |
| #19 CHAT | Estimar (5) y mover a flotante | **F1** |
| #1–#3 (no visibles en la captura) | Revisar: si cubren acceso/registro/carteras | **I1, I2, K1** (ajustar) |
| — | **Crear nuevas** | **C0.1–C0.5**, **I3**, **M5** |

**Etiquetas sugeridas en Taiga:** `carril-1`, `carril-2`, `carril-3`, `carril-4`, `cimientos`, `bloqueada-por-contrato` (solo se usa si falta un DTO; a las 48 h se escala).

---

## 14. Riesgos y mitigación

| Riesgo | Historias | Mitigación |
| --- | --- | --- |
| Cámara/permisos en Android heterogéneo; emuladores sin cámara | K3, K4 | Captura manual desde el día 1 y `EscanerCodigo` con implementación fake; pruebas en 2 dispositivos físicos |
| Sensación de "cuentas descuadradas" por redondeos | A1–A4, M4 | Tolerancia ±$1.00 documentada, suma de saldos verificada y vectores de centavos impares en CI |
| Web Share API no disponible | K2 | *Fallback* a portapapeles + descarga del QR |
| Privacidad entre miembros | I5, M4 | Matriz de permisos validada con las 4 cuentas demo antes de programar; contacto nunca visible |
| El contrato cambia a mitad de iteración | Todos | Cambio solo por PR al contrato + aviso; los mocks absorben el cambio sin romper pantallas |
| Historia de 5 pts que no cabe | I3, K1, A3 | Palanca de corte escrita (login/registro · crear-editar/ciclo de vida · KPIs/dona) |
| Carril saturado | Cualquiera | Mover piezas sueltas (K5, M3, A5) o la historia flotante F1 |

---

## 15. Checklist de arranque

- [ ] Reunión de 1 h: revisar y **firmar** el contrato v1 (C0.1) y confirmar titulares en Taiga (Diego → 1, Aideé → 2, Vanessa → 3, Damián → 4).
- [ ] Crear las tarjetas `C0.1–C0.5` con su DoD y abrir la Iteración 0 (3 días).
- [ ] Publicar fixtures (C0.2) y confirmar que web y móvil leen los mismos IDs.
- [ ] Verificar que `finanzas.spec.ts` corre en CI local (`npm test`) con los vectores V1–V4.
- [ ] Reetiquetar/mover las tarjetas existentes según la tabla de la sección 13.
- [ ] Arrancar la Iteración 1 con demo ya agendada al cierre.

---

*Documento de trabajo vivo: si el contrato o los fixtures cambian, este backlog se actualiza en el mismo PR.*
