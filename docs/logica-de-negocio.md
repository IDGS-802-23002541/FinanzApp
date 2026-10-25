# Lógica de negocio — FinanzApp

Documento maestro de reglas de negocio de la plataforma web y móvil.
Describe **qué debe hacer el sistema** (estados, validaciones, permisos y
transiciones) para los 12 módulos de la especificación, e incluye las
correcciones acordadas respecto al prototipo actual.

- **Modelo de datos:** [`modelo-datos.md`](./modelo-datos.md)
- **Permisos por rol:** [`rbac-permisos.md`](./rbac-permisos.md)
- **Delta contra el código actual:** [`plan-alineacion.md`](./plan-alineacion.md)
- **Backend:** [`backend.md`](./backend.md) · **Web:** [`web.md`](./web.md) · **Móvil:** [`movil.md`](./movil.md)

> Ubicación del front definitivo: `web_FinanzaApp/` (React + Vite + MUI, **JavaScript**),
> construido **desde cero**. El antiguo prototipo `plantilla_web/` quedó retirado.

---

## 1. Glosario y actores

| Término | Significado |
| --- | --- |
| **Cartera** | Espacio financiero colaborativo (Hogar, Viaje, Evento u Otro) con movimientos, miembros y presupuesto. |
| **Movimiento / Transacción** | Ingreso o gasto registrado en una cartera, con monto, categoría, fecha, descripción y comprobante opcional. |
| **Contribuyente** | Usuario que participa en una cartera aportando o registrando movimientos. |
| **Periodo** | División temporal de una cartera **Hogar** (frecuencia quincenal, mensual, etc.) con fecha de inicio y fin. |
| **Aportación** | Ingreso destinado al fondo de la cartera. |
| **Saldo** | `pagado − cuota` por integrante; puede ser deudor (negativo) o acreedor (positivo). |
| **Liquidación** | Transferencias mínimas sugeridas para cuadrar saldos entre integrantes. |

**Actores del sistema**

| Actor | Descripción |
| --- | --- |
| **Visitante** | Usuario no autenticado que navega la Landing Page. |
| **Usuario (cliente)** | Persona autenticada con cuenta; crea carteras y participa en las de otros. |
| **Administrador del sistema** | Rol global interno que administra clientes, comentarios, trabajadores y tickets. |
| **Trabajador / Dev** | Miembro del equipo técnico o de soporte, asignado a resolver tickets. |

### 1.1 Roles: sistema vs. cartera (cambio clave)

El prototipo actual usa **un solo campo `rol`** en el usuario (`admin`/`miembro`),
lo que mezcla permisos globales con permisos dentro de una cartera. Se separa en:

- **`rolSistema`** (global, en `Usuario`): `usuario` | `adminSistema` | `trabajador`.
- **`rolCartera`** (por membresía, en `MiembroCartera`): `administrador` | `contribuyente`.

Reglas:
- Todo registro nace con `rolSistema = usuario`. Nunca se asigna `admin` global en el registro.
- Dentro de una cartera hay **exactamente un administrador activo**.

---

## 2. Módulo 1 — Landing Page

- Presentación del producto, comparativa Web vs Móvil, casos de uso de carteras y enlaces de descarga/login.
- **Formulario de comentarios:** cualquier visitante puede enviar un comentario (nombre, correo, mensaje). Se persiste como `ComentarioLanding` y aparece en el **buzón de comentarios** del panel de administrador.
- No requiere autenticación.

---

## 3. Módulo 2 — Autenticación y cuenta

### 3.1 Registro
- Campos obligatorios: **nombre completo y correo electrónico y contraseña**.
- Validaciones: correo con formato válido y **no duplicado**; contraseña de mínimo 8 caracteres, con al menos una mayúscula y un número.
- El usuario nuevo queda con `rolSistema = usuario`, `estado = activo`.

### 3.2 Autenticación
- Sesiones mediante **JSON Web Token (JWT)**. El token se emite al iniciar sesión y viaja en las peticiones a la API.
- **Fin de sesión (logout)**: invalida el token en el cliente.

### 3.3 Restablecer contraseña (código de verificación)
1. `InputCorreo`: el usuario ingresa su correo y se genera un **código de verificación de 6 dígitos**. La respuesta es siempre el mismo mensaje neutro, exista o no la cuenta.
2. `InputCódigoVálido`: se verifica el código, que tiene **vigencia de 30 minutos** y es de **un solo uso**.
3. `InputNuevaContraseña`: nueva contraseña + confirmación (mínimo 8 caracteres, una mayúscula y un número). Al restablecer se invalidan los demás códigos y las sesiones activas.

La app móvil resuelve el paso 2 y 3 en una sola pantalla; la web puede separarlos.

**Envío del código por correo:** pendiente (tarea #219). Mientras no exista, solo el backend en modo `debug` devuelve el código, para pruebas.

### 3.4 Editar perfil
- Se pueden modificar datos personales (nombre, apellidos, teléfono...).
- **No se puede modificar**: correo electrónico, fecha de creación ni estado de la cuenta.

### 3.5 Eliminación lógica de cuenta
- El usuario puede eliminar su cuenta: **no se borra físicamente**; pasa a `estado = eliminado` con `fechaBaja`.
- Al quedar eliminado, no puede iniciar sesión y sus membresías se dan de baja lógica.

---

## 4. Módulo 3 — Dashboard / Carteras

### 4.1 Tipos de cartera
Catálogo global del sistema: **Hogar**, **Viaje**, **Evento**, **Otro**.

### 4.2 Atributos
Nombre, descripción, presupuesto inicial (opcional), fechas de vigencia y tipo.

### 4.3 Estados y ciclo de vida (cambio clave)

| Estado | Descripción | Quién |
| --- | --- | --- |
| **Activa** | Operable: admite movimientos, miembros e invitaciones. | Todas las carteras |
| **Inactiva** | Desactivada temporalmente. Reactivable por su administrador. | Todas las carteras |
| **Finalizada** | Cierre definitivo, **solo lectura** (balance congelado). | **Solo Viaje y Evento** |

Reglas:
- **No existen eliminaciones físicas** de carteras. Una baja deja `fechaBaja` y conserva el histórico.
- Pasar de **Activa → Inactiva** y **Inactiva → Activa** (reactivar) es libre para el administrador.
- **Activa → Finalizada** solo aplica a carteras Viaje/Evento; al finalizar se guarda `fechaCierre`.
- Una cartera **Finalizada** no admite movimientos, miembros, invitaciones ni edición.

### 4.4 Filtros y búsqueda
- Por **estado**: Activas, Inactivas, Finalizadas.
- Por **pertenencia**: *Mis carteras* (soy propietario/administrador) vs. *Carteras en las que participo* (soy contribuyente).
- Por **tipo** y búsqueda **por nombre**.

### 4.5 Periodos (exclusivo Cartera Hogar) — cambio clave
- Configuración de **frecuencia de ingreso/presupuesto** (ej. quincenal, mensual).
- La cartera se divide en **periodos** con `fechaInicio` y `fechaFin`; **se marca cuál está activo**.
- Los movimientos, transacciones y ahorros se **asocian a un periodo específico**.
- Solo las carteras **Hogar** tienen periodos; Viaje/Evento usan fecha de vigencia.

---

## 5. Módulo 4 — Detalle de cartera

- Resumen: presupuesto, gastado, disponible, avance y gráficas (Ingreso vs. Egreso, gastos por categoría).
- **Contribuyentes:** lista con roles, aporte comprometido, movimientos y saldo.
- **Invitación QR** (ver §6).
- **Cierre de cartera / balance:** saldos por integrante y **liquidación sugerida**.
- Solo el administrador/dueño puede editar la cartera, inactivarla, finalizarla (Viaje/Evento), invitar y dar de baja miembros.

---

## 6. Módulo 4 (cont.) — Contribuyentes e invitaciones

### 6.1 Roles en cartera
- **Administrador** (propietario/creador o delegado).
- **Contribuyente** (colaborador).

### 6.2 Regla del administrador único
- Debe existir **exactamente un administrador activo** por cartera.
- El administrador **no puede abandonar** la cartera sin antes **delegar** el rol a otro miembro activo **o** cerrar/desactivar la cartera.
- No se puede dar de baja al último administrador mientras la cartera siga activa.

### 6.3 Gestión de miembros
- Dar de **baja** y **reactivar** miembros (baja lógica; los movimientos se conservan).
- Si se intenta invitar a alguien que **ya forma parte**, se **notifica** en lugar de duplicarlo.
- El contribuyente puede **salirse** de una cartera compartida (excepto si es el único administrador; en ese caso debe delegar o cerrar antes).

### 6.4 Invitación por QR y clave
- Se genera un **código QR** que contiene una **clave única de 8 caracteres**.
- **Regenerar** el QR **invalida de inmediato** la clave anterior.
- Unión mediante **escaneo de QR** o **ingreso manual de la clave de 8 caracteres** si se deniega el permiso de cámara.
- La invitación no está disponible si la cartera está Inactiva o Finalizada.

---

## 7. Módulo 5 — Transacciones y movimientos

### 7.1 Atributos
Monto, categoría, fecha, descripción y **fotografía/comprobante** (opcional, según el tipo de gasto).

### 7.2 Valores por defecto
- Tipo por defecto: **Gasto**.
- Fecha por defecto: **fecha actual**.

### 7.3 Reglas de edición/eliminación (cambio clave)
- **Solo el Administrador o el dueño de la cartera** puede editar o eliminar movimientos.
- El **contribuyente** únicamente puede **registrar y consultar**.
- No se puede editar ni eliminar si la cartera está **desactivada (Inactiva) o en solo lectura (Finalizada)**.

### 7.4 Visualización
- **Paginación** de transacciones.
- **Filtrado dinámico por periodo presupuestal** (carteras Hogar), además de tipo, categoría y texto.

---

## 8. Módulo 5 (cont.) — Categorías

- **Catálogo global** definido por el sistema **según el tipo de cartera** (Hogar, Viaje, Evento...).
- **Categorías personalizadas** por cada cartera.
- **Tipo de categoría** configurable: *Gasto*, *Ingreso* o *Ambos*.
- **Gestión**: habilitar/deshabilitar y **ordenamiento personalizado**.
- Un movimiento **ingreso** usa siempre la categoría reservada **"Aportación"**.

---

## 9. Módulo 6 — Reportes y gráficas

- Analíticas con gráficas interactivas: distribución de ingresos, egresos, ahorro y **aportes por contribuyente**.
- Filtros por **tipo de cartera**, **montos** y **periodos**.
- Funcionalidades: **vista previa**, **generación** y **exportación formal en PDF**.
- Para carteras Hogar se usan **ventanas de periodo**; para Viaje/Evento, la línea de tiempo del proyecto.

---

## 10. Módulo 7 — Pagos recurrentes

- Registro y gestión de **compromisos financieros periódicos**.
- Acciones: **agregar**, **editar** datos fijos, **eliminar** y **marcar como "Hecho"**.
- Consulta del **estado** de los pagos (pendiente / hecho / próximo a vencer).

---

## 11. Módulo 8 — Ajustes, notificaciones y soporte

### 11.1 Ajustes
- Modificación de datos de cuenta (respetando §3.4: correo no editable).
- Cambio de **tema Claro/Oscuro**.
- Configuración de **notificaciones** del sistema y de pagos.

### 11.2 Notificaciones
- Avisos por **nuevos movimientos en carteras compartidas**.
- **Recordatorios** del sistema.
- **Alertas de pagos recurrentes próximos**.

### 11.3 Soporte (cliente)
- **Crear** ticket/reporte de ayuda.
- **Consultar** su estado: *pendiente*, *respondido*, *cerrado*.
- **Editar** la descripción y **cancelar** el ticket mientras esté pendiente.
- Ver las **respuestas** recibidas del equipo.

---

## 12. Módulo 9 — Panel Administrador del Sistema

- **Métricas de clientes**: totales, activos e inactivos.
- **Buzón de comentarios** procedentes de la Landing Page.
- **Conteo** de trabajadores y tickets globales.

---

## 13. Módulo 10 — Gestión de Trabajadores / Devs

- **CRUD completo** de colaboradores del equipo interno.
- Visualización de la **asignación de tickets** en los que trabaja cada uno.

---

## 14. Módulo 11 — Soporte Admin / Dev

- **Tablero de control** para tomar/asignar tickets.
- **Catalogar/clasificar** el problema.
- **Delegar** a otros trabajadores.
- **Responder** al cliente y **cerrar** el caso.
- Un trabajador solo puede cerrar los tickets **asignados a él**.

---

## 15. Reglas transversales

- **Montos** en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- **Sin borrados físicos**: usuarios, carteras, miembros y tickets usan baja lógica (`estado` + `fechaBaja`).
- **Archivos e imágenes** (comprobantes) se almacenan en **Cloudinary**, nunca en la BD ni en el repo.
- **Contraseñas** siempre con hash en el backend; nunca en texto plano.
- Los cálculos de saldos usan una **tolerancia de ±$1.00** para considerar cuentas cuadradas.
