# Respaldo del backlog — Taiga (FinanzApp)

Respaldo del backlog cargado en el tablero Kanban de **FinanzApp** (proyecto `1808877`, slug `idgs-802-23002441-finanzapp`).

- **Fecha de carga:** 17/10/2026.
- **Contenido:** 43 historias de usuario y 122 tareas.
- **Estado inicial:** todas las historias y tareas en estado **New**.
- **Motivo del respaldo:** el MCP de Taiga dejó de responder tras la carga; este archivo permite revisar el backlog sin depender de la conexión y sirve de respaldo.

## Notas importantes

- **Sin épicas:** no se usan épicas. Las historias se agrupan por módulo con la etiqueta **`modulo-N`** y su módulo aparece también al inicio de la descripción.
- **Prioridad:** Taiga no la guarda en un campo nativo; se registró en la descripción y con las etiquetas `prioridad-alta`, `prioridad-media`, `prioridad-baja`.
- **Eliminación:** toda eliminación en el producto es **lógica** (cambio de estatus).

## Reparto por área (responsables)

| Área | Responsable | Usuario Taiga | id |
| :--- | :--- | :--- | :--- |
| Web (React + MUI) | Aideé Vanessa Casillas Tapia | `Catasi` | 964734 |
| Backend (Flask) | Antonio Damián Rodríguez Alarcón | `IDGS-902-23002221` | 960166 |
| Base de datos (SQL Server) | Vanessa Yassmin Rea Muñoz | `idgs-902-22000969` | 964933 |
| Móvil (Kotlin + Compose) | Diego Yair Borja Romero | `idgs-802-23002441` | 964716 |

> La app móvil es exclusiva del rol **cliente**: sin landing, sin registro y sin vistas de admin/trabajador. Por eso no hay tareas de móvil en los módulos 1, 10, 11 y 12.

## Archivos por área

- **Backend:** `Backend_FinanzaApp/app/blueprints/<dominio>/`, `Backend_FinanzaApp/openapi.yaml`.
- **Base de datos:** `Backend_FinanzaApp/SQL/`, `Backend_FinanzaApp/app/models/`.
- **Web:** `web_FinanzaApp/src/`.
- **Móvil:** `movil_FinanzaApp/`.

---

## Módulo 1: Landing Page

### HU-01.1 — Conocer el producto
- **Rol:** Visitante · **Quiero:** conocer el producto, las diferencias web vs móvil y ejemplos de carteras · **Para:** decidir si la plataforma me sirve. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Dado que entro a la landing, cuando carga la página, entonces veo la presentación del producto, la comparativa web vs móvil y ejemplos de carteras (personal, compartida, evento/viaje).
  - **CA2:** Dado que abro la landing desde un celular o una computadora, cuando se carga, entonces el contenido se adapta al tamaño de la pantalla.
  - **CA3:** Dado que no tengo sesión, cuando navego por la landing, entonces no se me solicita autenticación.
- **Tareas:**
  - **Web** (Aideé) — landing: presentación, comparativa web/móvil y ejemplos de carteras · _Qué resta:_ sección de presentación, comparativa web vs móvil, ejemplos de carteras, responsivo sin autenticación.

### HU-01.2 — Navegación de acceso
- **Rol:** Visitante · **Quiero:** acceder desde la landing a la descarga de la app o al inicio de sesión · **Para:** empezar a usar la plataforma rápidamente. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Clic en 'Iniciar sesión' → pantalla de login.
  - **CA2:** Clic en 'Registrarme' → formulario de registro.
  - **CA3:** Clic en enlace de descarga → abre la app móvil (si está instalada) o redirige al APK.
  - **CA4:** Con sesión activa → pantalla de inicio según rol.
- **Tareas:**
  - **Web** (Aideé) — landing: navegación de acceso (login, registro y descarga) · _Qué resta:_ botones login/registro, enlace de descarga del APK, redirección por rol.

### HU-01.3 — Enviar comentarios
- **Rol:** Visitante · **Quiero:** enviar un comentario mediante un formulario · **Para:** dar mi opinión sin necesidad de tener cuenta. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** Campos obligatorios (nombre, correo, mensaje) → se guarda y veo confirmación.
  - **CA2:** Campos vacíos o correo inválido → errores y no se guarda.
  - **CA3:** Guardado → el admin puede verlo (HU-10.2).
  - **CA4:** Muchos comentarios del mismo origen → bloqueo temporal anti-spam.
- **Tareas:**
  - **Web** (Aideé) — landing: formulario de comentarios con validación.
  - **Backend** (Damián) — comentarios: guardar con validación y anti-spam · _Qué resta:_ POST, validación, límite anti-spam, OpenAPI y Postman.
  - **BD** (Vanessa) — comentarios: tabla y modelo.

---

## Módulo 2: Autenticación y Cuenta

### HU-02.1 — Registro de usuario
- **Rol:** Visitante · **Quiero:** registrarme con mis datos · **Para:** tener mi cuenta y acceder a la plataforma. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Nombre, correo y contraseña válidos → cuenta con rol 'cliente' y estatus activo.
  - **CA2:** Correo ya registrado → error y no se crea otra cuenta.
  - **CA3:** Contraseña que no cumple (mín. 8, una mayúscula, un número) → se indica qué requisito falta.
  - **CA4:** Al guardar → contraseña con hash, nunca en texto plano.
- **Tareas:**
  - **Web** (Aideé) — registro: pantalla y política de contraseña.
  - **Backend** (Damián) — registro: crear cuenta (rol cliente, hash, correo único).
  - **BD** (Vanessa) — usuarios: tabla e índices únicos.

### HU-02.2 — Inicio y cierre de sesión (JWT)
- **Rol:** Usuario (todos) · **Quiero:** iniciar y cerrar sesión de forma segura (JWT) · **Para:** acceder a mis funciones según mi rol. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Credenciales correctas y cuenta activa → token JWT con rol y soy dirigido a mi vista.
  - **CA2:** Credenciales incorrectas → mensaje genérico.
  - **CA3:** Cuenta inactiva → acceso rechazado.
  - **CA4:** Token expirado/inexistente → redirige al login.
  - **CA5:** Cerrar sesión → token descartado, no vuelvo con 'atrás'.
  - **CA6:** Trabajador con contraseña temporal → obligado a cambiarla al primer login.
- **Tareas:**
  - **Backend** (Damián) — sesión: login/logout JWT con rol y mensajes neutros.
  - **Web** (Aideé) — sesión: login, guardado de token y cierre.
  - **Móvil** (Diego) — sesión: login y persistencia de sesión.

### HU-02.3 — Recuperar contraseña
- **Rol:** Visitante · **Quiero:** recuperar mi contraseña si la olvidé · **Para:** volver a entrar a mi cuenta. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Correo registrado → enlace con vigencia limitada (ej. 30 min).
  - **CA2:** Correo no registrado → mismo mensaje neutro.
  - **CA3:** Enlace vigente + nueva contraseña válida → se actualiza y el enlace se invalida.
  - **CA4:** Enlace expirado/usado → error y opción de solicitar otro.
- **Tareas:**
  - **Web** (Aideé) — recuperación: pantallas de solicitud y restablecimiento.
  - **Backend** (Damián) — recuperación: token de vigencia limitada y mensaje neutro.
  - **BD** (Vanessa) — recuperación: tabla de tokens.

### HU-02.4 — Cambiar contraseña en sesión
- **Rol:** Usuario (todos) · **Quiero:** cambiar mi contraseña estando en sesión · **Para:** mantener segura mi cuenta. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Actual correcta + nueva válida distinta → se actualiza y veo confirmación (campos: actual, nueva, confirmar).
  - **CA2:** Actual incorrecta → error y no cambia nada.
  - **CA3:** Confirmación no coincide → error de validación.
- **Tareas:**
  - **Backend** (Damián) — contraseña: cambio en sesión.
  - **Web** (Aideé) — contraseña: pantalla de cambio.
  - **Móvil** (Diego) — contraseña: pantalla de cambio.

### HU-02.5a — Desactivar cuenta
- **Rol:** Cliente · **Quiero:** ver mi cuenta y desactivarla · **Para:** consultar mi información y desactivar mi cuenta cuando lo decida. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** 'Mi cuenta' → nombre, correo y fecha de registro.
  - **CA2:** Desactivar + confirmar con contraseña → inactiva, cierra sesión, no puedo iniciar (no se borra ningún registro).
  - **CA3:** Propietario de carteras → advertencia de que pasarán a inactivas y los colaboradores pierden acceso.
  - **CA4:** Al desactivar → carteras propias inactivas, retirado como colaborador, conservando las transacciones.
  - **CA5:** Admin/trabajador → no ven la opción de eliminar.
- **Tareas:**
  - **Web** (Aideé) — Mi cuenta: ver y desactivar con confirmación.
  - **Backend** (Damián) — cuenta: desactivación lógica y efectos.
  - **Móvil** (Diego) — Mi cuenta: desactivar cuenta.

### HU-02.5b — Darse de baja / Eliminar cuenta
- **Rol:** Cliente · **Quiero:** ver mi cuenta y darme de baja · **Para:** consultar mi información y darme de baja cuando lo decida. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** 'Mi cuenta' → nombre, correo y fecha de registro.
  - **CA2:** Eliminar + confirmar con contraseña → se elimina todo el registro, cierra sesión, no puedo iniciar.
  - **CA3:** Propietario de carteras → advertencia de que se perderán y los colaboradores pierden acceso.
  - **CA4:** Al eliminar → carteras propias eliminadas, retirado como colaborador, conservando las transacciones.
  - **CA5:** Admin/trabajador → no ven la opción de eliminar.
- **Tareas:**
  - **Web** (Aideé) — Mi cuenta: eliminar cuenta (solo cliente).
  - **Backend** (Damián) — cuenta: eliminación de datos con conservación de transacciones.
  - **Móvil** (Diego) — Mi cuenta: eliminar cuenta.
  - **BD** (Vanessa) — cuenta: estrategia de borrado/anonimizado.

---

## Módulo 3: Dashboard / Carteras

### HU-03.1 — Crear cartera
- **Rol:** Cliente · **Quiero:** crear una cartera indicando su tipo · **Para:** organizar mis finanzas personales o compartidas. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Nombre y tipo (del catálogo) → cartera activa conmigo como propietario.
  - **CA2:** Faltan datos obligatorios → errores y no se crea.
  - **CA3:** Creada → aparece de inmediato en el dashboard.
  - **CA4:** Tipo evento/viaje → 'Cerrar cartera' disponible para el propietario (HU-04.6).
- **Tareas:**
  - **Web** (Aideé) — carteras: formulario de crear (nombre + tipo).
  - **Backend** (Damián) — carteras: crear con propietario y estatus activa.
  - **BD** (Vanessa) — carteras: tabla y catálogo de tipos.
  - **Móvil** (Diego) — carteras: crear cartera.

### HU-03.2 — Tarjetas de carteras
- **Rol:** Cliente · **Quiero:** ver mis carteras en tarjetas, incluyendo en las que contribuyo · **Para:** tener todo a la vista desde un solo lugar. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Tarjeta por cartera con nombre, tipo, estatus y mi rol.
  - **CA2:** Colaboraciones aparecen junto a las mías y se distinguen visualmente.
  - **CA3:** Sin carteras → mensaje vacío con 'Crear cartera'.
  - **CA4:** Clic en tarjeta → detalle (HU-04.1).
- **Tareas:**
  - **Web** (Aideé) — dashboard: tarjetas de carteras y estado vacío.
  - **Backend** (Damián) — carteras: listado del usuario (propias + colaboraciones).
  - **Móvil** (Diego) — carteras: home con tarjetas.

### HU-03.3 — Filtrar carteras
- **Rol:** Cliente · **Quiero:** ver y filtrar mis carteras · **Para:** encontrar rápidamente la que necesito. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Sin filtros → por defecto se muestran las activas.
  - **CA2:** Filtros estatus/tipo/'mis carteras'/'en las que contribuyo' → lista actualizada y combinables.
  - **CA3:** Sin resultados → mensaje 'sin resultados'.
  - **CA4:** 'Limpiar' → listado por defecto.
- **Tareas:**
  - **Web** (Aideé) — dashboard: filtros combinables y limpiar.
  - **Backend** (Damián) — carteras: filtros en el listado.

---

## Módulo 4: Ver Cartera

### HU-04.1 — Detalle de cartera
- **Rol:** Propietario / Colaborador · **Quiero:** ver el detalle de una cartera con sus gráficas · **Para:** entender el estado de mis finanzas. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Nombre, tipo, estatus, propietario, colaboradores, saldo y totales.
  - **CA2:** Periodo → gráficas de ingresos vs egresos y gasto por categoría.
  - **CA3:** Sin transacciones → estado vacío sin errores.
  - **CA4:** Colaborador → misma información sin editar/invitar/eliminar/cerrar/inactivar.
- **Tareas:**
  - **Web** (Aideé) — detalle: datos, saldo, totales y gráficas.
  - **Backend** (Damián) — detalle: resumen y series por periodo.
  - **Móvil** (Diego) — detalle: cartera con gráficas.

### HU-04.2 — Invitar miembros (vía QR)
- **Rol:** Propietario · **Quiero:** invitar miembros a mi cartera · **Para:** compartirla y que otros registren ingresos y gastos. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Generar QR → ver qué usuarios entraron y en qué fecha y hora.
  - **CA2:** Invitado entra con QR + confirma → colaborador activo con permisos limitados (ver y registrar).
  - **CA3:** Cartera inactiva/finalizada → opción no disponible.
  - **CA4:** Colaborador → no ve invitar; el servidor rechaza la petición.
- **Tareas:**
  - **Backend** (Damián) — invitación: QR y registro de ingresos.
  - **Web** (Aideé) — invitación: pantalla de QR y bitácora.
  - **BD** (Vanessa) — invitación: tabla de invitaciones y accesos.
  - **Móvil** (Diego) — invitación: unirse a cartera por QR.

### HU-04.3 — Eliminar contribuyentes
- **Rol:** Propietario · **Quiero:** eliminar contribuyentes de mi cartera · **Para:** controlar quién tiene acceso a ella. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Eliminar + confirmar → estatus inactivo y pierde acceso (no se borra).
  - **CA2:** Sus transacciones se conservan y siguen mostrando su autor.
  - **CA3:** El propietario no puede eliminarse a sí mismo.
  - **CA4:** El removido deja de recibir notificaciones.
  - **CA5:** Reinvitado → puede volver a unirse.
- **Tareas:**
  - **Backend** (Damián) — colaboradores: eliminar (lógico) sin autoeliminación.
  - **Web** (Aideé) — colaboradores: lista y acción eliminar.

### HU-04.4 — Salir de una cartera compartida
- **Rol:** Colaborador · **Quiero:** salirme de una cartera compartida · **Para:** dejar de participar cuando ya no me corresponde. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** 'Salir' + confirmar → estatus inactivo y desaparece de mi dashboard.
  - **CA2:** Las transacciones que registré se conservan.
  - **CA3:** El propietario no ve la opción de salir.
- **Tareas:**
  - **Backend** (Damián) — colaborador: salir de la cartera.
  - **Web** (Aideé) — colaborador: acción 'Salir de la cartera'.
  - **Móvil** (Diego) — colaborador: salir de la cartera.

### HU-04.5 — Editar e inactivar cartera
- **Rol:** Propietario · **Quiero:** editar los datos de mi cartera e inactivarla · **Para:** mantenerla actualizada o retirarla cuando ya no la quiera. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Editar nombre/descripción → se refleja en detalle y dashboard.
  - **CA2:** Inactivar → estatus inactiva sin eliminar datos.
  - **CA3:** Inactiva no aparece por defecto pero sí al filtrar por 'inactiva'.
  - **CA4:** Inactiva → no disponible registrar/editar movimientos.
  - **CA5:** Colaborador no ve editar ni inactivar.
- **Tareas:**
  - **Backend** (Damián) — carteras: editar e inactivar (sin borrar datos).
  - **Web** (Aideé) — carteras: editar/inactivar y reflejo en dashboard.
  - **Móvil** (Diego) — carteras: editar/inactivar.

### HU-04.6 — Cerrar cartera (Evento/Viaje)
- **Rol:** Propietario · **Quiero:** cerrar una cartera de tipo evento/viaje y generar su balance · **Para:** conocer el balance total de gastos al terminar el evento. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Tipo evento/viaje activa → 'Cerrar cartera' solo para el propietario.
  - **CA2:** Confirmar → finalizada y balance (total, por categoría y por participante).
  - **CA3:** Finalizada → no registrar/editar/eliminar/invitar (solo lectura).
  - **CA4:** Finalizada → consultar detalle, gráficas y descargar reporte (HU-06.2).
  - **CA5:** Colaboradores con notificación activa → reciben aviso al cerrar.
- **Tareas:**
  - **Backend** (Damián) — cierre: finalizar cartera y calcular balance.
  - **Web** (Aideé) — cierre: 'Cerrar cartera' y vista de balance.
  - **Móvil** (Diego) — cierre: cerrar cartera y ver balance.
  - **BD** (Vanessa) — cierre: estatus finalizada y consultas de balance.

---

## Módulo 5: Transacciones

### HU-05.1 — Registrar transacción
- **Rol:** Propietario / Colaborador · **Quiero:** registrar un ingreso o un gasto en una cartera · **Para:** llevar el control de mis movimientos. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Tipo, monto > 0, fecha y categoría → se crea y el saldo y las gráficas se actualizan.
  - **CA2:** Faltan datos/monto inválido → errores y no se registra.
  - **CA3:** Colaborador registra → se guarda con su usuario como autor.
  - **CA4:** Cartera inactiva/finalizada → formulario no disponible.
  - **CA5:** Registrada → miembros con 'movimientos en cartera' activa reciben aviso (HU-08.3).
- **Tareas:**
  - **Web** (Aideé) — transacciones: registrar ingreso/gasto.
  - **Backend** (Damián) — transacciones: crear, recalcular saldo y emitir evento.
  - **Móvil** (Diego) — transacciones: registrar ingreso/gasto.
  - **BD** (Vanessa) — transacciones: tabla y modelo.

### HU-05.2 — Consultar transacciones
- **Rol:** Propietario / Colaborador · **Quiero:** consultar las transacciones con filtro por periodo y paginación · **Para:** revisar mi historial sin perderme entre muchos registros. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Fecha, tipo, categoría, monto, descripción y autor, de la más reciente a la más antigua.
  - **CA2:** Periodo → solo ese rango y totales ajustados.
  - **CA3:** Paginación avanzar/retroceder y total de páginas.
  - **CA4:** Eliminada lógicamente → no aparece.
  - **CA5:** Sin transacciones → 'sin resultados'.
  - **CA6:** Colaborador ve todas las transacciones.
- **Tareas:**
  - **Web** (Aideé) — transacciones: lista con filtro por periodo y paginación.
  - **Backend** (Damián) — transacciones: listado paginado con filtro por periodo.
  - **Móvil** (Diego) — transacciones: lista con filtro y paginación.

### HU-05.3 — Editar y eliminar transacciones
- **Rol:** Propietario · **Quiero:** editar y eliminar transacciones · **Para:** corregir errores o quitar movimientos que ya no aplican. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Editar → mismas validaciones del registro y recálculo de saldo/gráficas.
  - **CA2:** Eliminar → estatus eliminada, no aparece en listas/saldo/gráficas; el registro se conserva.
  - **CA3:** Colaborador no ve editar/eliminar; el servidor rechaza.
  - **CA4:** Cartera inactiva/finalizada → no disponible.
- **Tareas:**
  - **Backend** (Damián) — transacciones: editar y eliminar (lógico).
  - **Web** (Aideé) — transacciones: editar/eliminar (propietario).
  - **Móvil** (Diego) — transacciones: editar/eliminar.

### HU-05.4 — Crear categoría
- **Rol:** Propietario · **Quiero:** crear una categoría nueva · **Para:** clasificar mis movimientos a mi manera. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Nombre válido (sin caracteres raros) → disponible en el selector.
  - **Nota:** en el desplegable con búsqueda, si escribes un nombre inexistente se guarda y se registra como nueva categoría.
- **Tareas:**
  - **Backend** (Damián) — categorías: alta desde el selector.
  - **Web** (Aideé) — categorías: selector con búsqueda y creación al vuelo.
  - **BD** (Vanessa) — categorías: tabla y modelo.
  - **Móvil** (Diego) — categorías: selector con creación al vuelo.

---

## Módulo 6: Reportes

### HU-06.1 — Vista previa de reporte
- **Rol:** Propietario · **Quiero:** filtrar la información y ver una vista previa del reporte · **Para:** revisar los datos antes de generarlo. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Filtros por cartera/tipo, cantidad y periodo, combinables.
  - **CA2:** Vista previa con indicadores y gráficas (contenido exacto por definir).
  - **CA3:** Sin datos → mensaje y no se permite generar.
  - **CA4:** Propietario → solo carteras donde es propietario.
  - **CA5:** Indicadores pendientes → se ajustará sin cambiar el flujo.
- **Tareas:**
  - **Web** (Aideé) — reportes: filtros y vista previa.
  - **Backend** (Damián) — reportes: endpoint de datos filtrados.
  - **Móvil** (Diego) — reportes: vista previa.

### HU-06.2 — Generar y descargar reporte
- **Rol:** Propietario · **Quiero:** generar y descargar el reporte · **Para:** conservar o compartir mi información financiera. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** 'Generar reporte' → archivo con los filtros aplicados.
  - **CA2:** 'Descargar' → archivo con los mismos datos de la vista previa (formato por definir: PDF/Excel).
  - **CA3:** Incluye nombre de cartera, periodo y fecha de generación.
  - **CA4:** Excluye las transacciones eliminadas lógicamente.
  - **CA5:** Si falla → mensaje claro y reintento.
- **Tareas:**
  - **Backend** (Damián) — reportes: generar y descargar archivo.
  - **Web** (Aideé) — reportes: generar y descargar.
  - **Móvil** (Diego) — reportes: generar y descargar.

---

## Módulo 7: Pagos Recurrentes

### HU-07.1 — Registrar pago recurrente
- **Rol:** Propietario · **Quiero:** registrar un pago recurrente · **Para:** no olvidar mis pagos fijos. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Nombre, monto, categoría, frecuencia y fecha de inicio → pago activo.
  - **CA2:** Faltan datos/monto inválido → errores.
  - **CA3:** En la lista se muestra su próxima fecha de vencimiento.
  - **CA4:** Con notificación de pagos recurrentes activa → recibo el recordatorio (HU-08.3).
- **Tareas:**
  - **Web** (Aideé) — pagos: registrar pago recurrente.
  - **Backend** (Damián) — pagos: crear y calcular próximo vencimiento.
  - **Móvil** (Diego) — pagos: registrar pago recurrente.
  - **BD** (Vanessa) — pagos: tablas de pagos y periodos.

### HU-07.2 — Gestionar pagos recurrentes
- **Rol:** Propietario (colaborador consulta) · **Quiero:** ver, editar y eliminar mis pagos recurrentes · **Para:** mantener al día la lista de pagos fijos. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Nombre, monto, frecuencia, próximo vencimiento y estatus (pendiente, hecho, vencido).
  - **CA2:** Editar los datos fijos → aplica a periodos futuros, no altera los hechos.
  - **CA3:** Eliminar → inactivo, deja de generar recordatorios y conserva su historial.
  - **CA4:** Colaborador → solo consulta.
- **Tareas:**
  - **Backend** (Damián) — pagos: listar, editar y eliminar.
  - **Web** (Aideé) — pagos: lista y gestión (colaborador solo consulta).
  - **Móvil** (Diego) — pagos: lista (colaborador solo consulta).

### HU-07.3 — Marcar pago como 'Hecho'
- **Rol:** Propietario · **Quiero:** marcar un pago recurrente como 'Hecho' · **Para:** llevar el seguimiento de lo que ya pagué. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Pendiente → hecho con la fecha en que lo marqué.
  - **CA2:** Se calcula el siguiente vencimiento según la frecuencia.
  - **CA3:** Periodo ya marcado → no se permite de nuevo.
  - **CA4:** Dejan de enviarse recordatorios de ese periodo.
  - **CA5:** Se define si genera automáticamente un gasto en transacciones (decisión pendiente).
- **Tareas:**
  - **Backend** (Damián) — pagos: marcar periodo como hecho.
  - **Web** (Aideé) — pagos: marcar como 'Hecho'.
  - **Móvil** (Diego) — pagos: marcar como 'Hecho'.

---

## Módulo 8: Ajustes

### HU-08.1 — Editar cuenta
- **Rol:** Usuario (todos) · **Quiero:** editar los datos de mi cuenta · **Para:** mantener mi información al día. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Modificar nombre o correo → se guardan y se reflejan en la app.
  - **CA2:** Nuevo correo de otra cuenta → error y no se cambia.
  - **CA3:** Datos inválidos → validaciones por campo.
  - **CA4:** Cliente, admin o trabajador → pueden editar sus datos.
- **Tareas:**
  - **Backend** (Damián) — ajustes: editar cuenta (correo único).
  - **Web** (Aideé) — ajustes: editar datos de cuenta.
  - **Móvil** (Diego) — ajustes: editar datos de cuenta.

### HU-08.2 — Tema claro/oscuro
- **Rol:** Usuario (todos) · **Quiero:** cambiar el tema claro/oscuro · **Para:** usar la app con la apariencia que me resulte más cómoda. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** Seleccionar tema → la interfaz cambia de inmediato.
  - **CA2:** Preferencia guardada → se aplica al volver a iniciar sesión, en web y móvil.
  - **CA3:** Sin elegir → tema por defecto.
- **Tareas:**
  - **Web** (Aideé) — ajustes: tema claro/oscuro persistido (MUI).
  - **Móvil** (Diego) — ajustes: tema claro/oscuro (Compose).
  - **Backend** (Damián) — ajustes: guardar preferencia de tema.

### HU-08.3 — Configurar notificaciones
- **Rol:** Cliente (propietario / colaborador) · **Quiero:** configurar mis notificaciones · **Para:** recibir solo los avisos que me interesan. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Interruptor independiente para movimientos en cartera, recordatorios del sistema y recordatorios de pagos recurrentes.
  - **CA2:** Activado → recibo la notificación al dispararse el evento.
  - **CA3:** Desactivado → no la recibo.
  - **CA4:** La verificación se hace en un solo servicio central; los demás módulos solo emiten el evento.
  - **CA5:** Guardado → aplica de inmediato y se conserva entre sesiones.
  - **CA6:** Cliente nuevo → todas activadas por defecto.
- **Tareas:**
  - **Backend** (Damián) — notificaciones: servicio central de preferencias.
  - **Web** (Aideé) — notificaciones: interruptores.
  - **Móvil** (Diego) — notificaciones: interruptores.
  - **BD** (Vanessa) — notificaciones: tabla de preferencias.

---

## Módulo 9: Soporte (Cliente)

### HU-09.1 — Crear reporte de ayuda
- **Rol:** Cliente · **Quiero:** crear un reporte de ayuda · **Para:** recibir soporte cuando tengo un problema o duda. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Asunto y descripción → ticket 'pendiente' con fecha y mi usuario como autor.
  - **CA2:** Faltan datos → errores y no se crea.
  - **CA3:** Confirmación con su identificador.
- **Tareas:**
  - **Web** (Aideé) — soporte: crear reporte de ayuda.
  - **Backend** (Damián) — soporte: crear ticket (pendiente, autor).
  - **Móvil** (Diego) — soporte: crear reporte de ayuda.
  - **BD** (Vanessa) — soporte: tablas de tickets y respuestas.

### HU-09.2 — Ver reportes y respuestas
- **Rol:** Cliente · **Quiero:** ver mis reportes por estatus y sus respuestas · **Para:** dar seguimiento a mis solicitudes. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Solo mis reportes, filtrables por estatus (pendientes, respondidos, cerrados).
  - **CA2:** Detalle con respuestas del personal en orden cronológico con autor y fecha.
  - **CA3:** Al recibir respuesta → notificación de recordatorios del sistema (si está activa).
  - **CA4:** Reporte cerrado → solo lectura.
- **Tareas:**
  - **Web** (Aideé) — soporte: mis reportes y respuestas.
  - **Backend** (Damián) — soporte: listar mis tickets y detalle.
  - **Móvil** (Diego) — soporte: mis reportes y respuestas.

### HU-09.3 — Editar y eliminar reporte
- **Rol:** Cliente · **Quiero:** editar y eliminar mi reporte mientras esté pendiente · **Para:** corregir o retirar una solicitud que ya no necesito. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** Pendiente → editar asunto/descripción; se refleja para el personal.
  - **CA2:** Pendiente → eliminar (lógico, estatus eliminado); deja de aparecer para mí y para el personal.
  - **CA3:** Respondido/cerrado → no disponible.
- **Tareas:**
  - **Backend** (Damián) — soporte: editar/eliminar ticket propio pendiente.
  - **Web** (Aideé) — soporte: editar/eliminar reporte pendiente.
  - **Móvil** (Diego) — soporte: editar/eliminar reporte pendiente.

---

## Módulo 10: Inicio Admin

### HU-10.1 — Métricas de clientes
- **Rol:** Admin · **Quiero:** ver el total de clientes, activos e inactivos · **Para:** conocer el uso de la plataforma. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Total de clientes, activos e inactivos.
  - **CA2:** Solo cuentas con rol 'cliente' (no admins ni trabajadores).
  - **CA3:** Solo datos agregados; sin acceso a carteras/transacciones.
  - **CA4:** No admin → acceso denegado.
- **Tareas:**
  - **Backend** (Damián) — admin: métricas de clientes.
  - **Web** (Aideé) — admin: Inicio con métricas de clientes.

### HU-10.2 — Buzón de comentarios
- **Rol:** Admin · **Quiero:** ver el buzón de comentarios enviados desde la landing · **Para:** conocer la opinión de los visitantes. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** Nombre, correo, mensaje y fecha, paginados y del más reciente al más antiguo.
  - **CA2:** Clic en un comentario → mensaje completo.
  - **CA3:** Eliminar o archivar → cambia estatus sin borrar el registro (opción por definir).
  - **CA4:** No admin → acceso denegado.
- **Tareas:**
  - **Backend** (Damián) — admin: buzón de comentarios.
  - **Web** (Aideé) — admin: buzón de comentarios.

### HU-10.3 — Métricas de soporte
- **Rol:** Admin · **Quiero:** ver el total de trabajadores y de tickets · **Para:** supervisar la capacidad de soporte. · **Prioridad:** Baja
- **Criterios de aceptación:**
  - **CA1:** Total de trabajadores activos y de tickets por estatus (pendiente, respondido, cerrado).
  - **CA2:** Clic en un total → voy al módulo de Trabajadores o de Soporte.
  - **CA3:** Al recargar Inicio → los totales se actualizan.
- **Tareas:**
  - **Backend** (Damián) — admin: métricas de soporte.
  - **Web** (Aideé) — admin: tarjetas de métricas con navegación.

---

## Módulo 11: Trabajadores (Admin)

### HU-11.1 — Crear trabajador
- **Rol:** Admin · **Quiero:** crear un trabajador · **Para:** dar acceso al personal que atiende los tickets. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Nombre y correo → usuario con rol 'trabajador', activo y contraseña temporal.
  - **CA2:** Correo ya existente → error y no se crea.
  - **CA3:** Primer login con la temporal → obligado a cambiarla.
  - **CA4:** Medio de entrega de la temporal por definir (correo o mostrada al admin).
- **Tareas:**
  - **Backend** (Damián) — trabajadores: crear (rol trabajador y contraseña temporal).
  - **Web** (Aideé) — trabajadores: crear trabajador.

### HU-11.2 — Ver trabajadores y asignación
- **Rol:** Admin · **Quiero:** ver los trabajadores y el ticket en el que trabajan · **Para:** supervisar la carga de trabajo del equipo. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Nombre, correo, estatus y tickets asignados (ID, asunto y estatus).
  - **CA2:** Sin tickets → 'Sin ticket asignado'.
  - **CA3:** Lista paginada.
- **Tareas:**
  - **Backend** (Damián) — trabajadores: listar con tickets asignados.
  - **Web** (Aideé) — trabajadores: lista y tickets asignados.

### HU-11.3 — Editar y eliminar trabajador
- **Rol:** Admin · **Quiero:** editar y eliminar un trabajador · **Para:** mantener actualizado al equipo de soporte. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Editar nombre/correo → se refleja y se aplican las mismas validaciones que al crear.
  - **CA2:** Eliminar → inactivo, ya no puede iniciar sesión (no se borra).
  - **CA3:** Con tickets abiertos → advertencia y esos tickets quedan sin asignar (por confirmar).
  - **CA4:** Historial → los tickets que cerró siguen mostrando su nombre.
- **Tareas:**
  - **Backend** (Damián) — trabajadores: editar/eliminar y liberar tickets.
  - **Web** (Aideé) — trabajadores: editar/eliminar.

---

## Módulo 12: Soporte (Admin / Trabajador)

### HU-12.1 — Ver y filtrar tickets
- **Rol:** Admin / Trabajador · **Quiero:** ver y filtrar los tickets · **Para:** encontrar rápidamente los que debo atender. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** ID, asunto, cliente, estatus, categoría, responsable y fecha, paginados.
  - **CA2:** Filtros por estatus, categoría, responsable o fecha, combinables.
  - **CA3:** Detalle con la descripción del cliente y toda la conversación.
  - **CA4:** Trabajador → solo ve el módulo de tickets (sin Inicio ni Trabajadores).
  - **CA5:** Cliente → acceso denegado.
- **Tareas:**
  - **Backend** (Damián) — soporte admin: listado de tickets con filtros.
  - **Web** (Aideé) — soporte admin: lista de tickets con filtros y detalle.

### HU-12.2 — Tomar o asignar ticket
- **Rol:** Admin / Trabajador · **Quiero:** tomar o asignar un ticket · **Para:** que cada solicitud tenga un responsable. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Sin responsable → el trabajador lo toma y queda asignado a él.
  - **CA2:** Admin asigna o reasigna a cualquier trabajador activo.
  - **CA3:** Ya con responsable → otro no puede tomarlo.
  - **CA4:** Asignado → aparece en los tickets de ese trabajador (HU-11.2).
- **Tareas:**
  - **Backend** (Damián) — soporte admin: tomar y asignar/reasignar ticket.
  - **Web** (Aideé) — soporte admin: tomar/asignar ticket.

### HU-12.3 — Responder ticket
- **Rol:** Admin / Trabajador · **Quiero:** responder un ticket · **Para:** resolver la duda o problema del cliente. · **Prioridad:** Alta
- **Criterios de aceptación:**
  - **CA1:** Responsable o admin → respuesta con autor y fecha; estatus 'respondido'.
  - **CA2:** Respuesta vacía → error.
  - **CA3:** El cliente la ve (HU-09.2) y recibe notificación si la tiene activa.
  - **CA4:** Ticket cerrado → no disponible.
- **Tareas:**
  - **Backend** (Damián) — soporte admin: responder ticket.
  - **Web** (Aideé) — soporte admin: caja de respuesta.

### HU-12.4 — Catalogar y cerrar ticket
- **Rol:** Admin / Trabajador · **Quiero:** catalogar y cerrar un ticket · **Para:** organizar las solicitudes y dar por terminada la atención. · **Prioridad:** Media
- **Criterios de aceptación:**
  - **CA1:** Categoría del catálogo → se guarda y se puede filtrar por ella.
  - **CA2:** Cerrar → cerrado con fecha y usuario que lo cerró; solo lectura.
  - **CA3:** Trabajador solo puede cerrar los asignados a él; el admin cualquiera (por confirmar).
  - **CA4:** El cliente lo ve como cerrado.
- **Tareas:**
  - **Backend** (Damián) — soporte admin: catalogar y cerrar ticket.
  - **Web** (Aideé) — soporte admin: catalogar y cerrar ticket.

---

## Resumen de asignaciones

| Área | Tareas | Responsable |
| :--- | :--- | :--- |
| Backend (Flask) | 41 | Damián |
| Web (React + MUI) | 43 | Aideé |
| Móvil (Kotlin + Compose) | 26 | Diego |
| Base de datos (SQL Server) | 12 | Vanessa |
| **Total** | **122** | |

## Pendientes de definición (marcados en los criterios)

- Formato del reporte (PDF/Excel) y contenido exacto de los indicadores — HU-06.1/06.2.
- Si marcar un pago como 'Hecho' genera automáticamente un gasto en transacciones — HU-07.3.
- Medio de entrega de la contraseña temporal del trabajador — HU-11.1.
- Regla exacta de "tomar" un ticket y si el trabajador puede cerrar solo los suyos — HU-12.2/12.4.
- Comportamiento al eliminar un trabajador con tickets abiertos — HU-11.3.
- Acción de archivar/eliminar comentarios del buzón — HU-10.2.
