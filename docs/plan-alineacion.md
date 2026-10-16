# Plan de alineación — del prototipo a la especificación

Delta entre el **código actual** (prototipo con datos mock en `plantilla_web/`)
y la **lógica de negocio documentada**, con el estado de cada module y el
impacto en archivos. Sirve de checklist de implementación.

> El front definitivo vive en **`web_FinanzaApp/`**. El módulo de reportes que
> hoy solo existe en `plantilla_web/` debe reubicarse ahí.

## 0. Riesgo previo: estructura de ramas

| Situación | Impacto |
| --- | --- |
| `main` tiene el front en `web_FinanzaApp/`; `diego` lo tiene en `plantilla_web/` | Divergencia estructural; alinear a `web_FinanzaApp/`. |
| `plantilla_web/` tiene el módulo `reportes/` y `utils/reportes.ts`, `utils/exportar.ts` que `main` no tiene | Migrar esos archivos a `web_FinanzaApp/` antes de ramificar más. |
| `Backend_FinanzaApp/` vacío (solo README + requirements) | No hay API real; toda la lógica es mock en el front y debe migrarse al backend. |

## 1. Tabla de estado por módulo

Estado: **Existe** (cumple) · **Parcial** (existe con desviaciones) · **Falta**.

| Módulo | Estado | Qué falta / cambiar |
| --- | --- | --- |
| 1. Landing Page | Parcial | Formulario de comentarios funcional y persistente (hoy no existe la lógica). |
| 2. Autenticación y cuenta | Parcial | JWT real; restablecer contraseña en 3 pasos; eliminar cuenta (lógico); bloquear edición de correo; tema Claro/Oscuro. |
| 3. Dashboard / Carteras | Parcial | Estado **Finalizada** separado de Inactiva; finalizar solo Viaje/Evento; **periodos Hogar**; filtro por Finalizadas. |
| 4. Detalle de cartera | Parcial | Delegación de rol; salir de cartera; baja/reactivación de miembros. |
| 5. Transacciones | Parcial | Comprobante (Cloudinary); editar/eliminar solo Admin o dueño; paginación; filtro por periodo. |
| 5b. Categorías | Parcial | Catálogo por tipo de cartera; personalizadas por cartera; tipo Gasto/Ingreso/Ambos; habilitar/ordenar. |
| 6. Reportes | Parcial | Filtros por tipo y montos; **exportación PDF formal** (hoy CSV e impresión). |
| 7. Pagos recurrentes | Falta | Módulo completo. |
| 8. Ajustes y notificaciones | Parcial | Tema Claro/Oscuro; motor de notificaciones real. |
| 9. Soporte (cliente) | Falta | Tickets, estados, respuestas, cancelar. |
| 10. Inicio Admin | Falta | Métricas de clientes, buzón de comentarios, conteos. |
| 11. Gestión de trabajadores | Falta | CRUD de trabajadores y sus tickets. |
| 12. Soporte Admin / Dev | Falta | Tablero, tomar/asignar, catalogar, delegar, responder, cerrar. |

## 2. Cambios de lógica por archivo (prototipo actual)

### `src/types/models.ts`
- Dividir `RolUsuario` en `rolSistema` (global) y `rolCartera` (membresía).
- `EstadoCartera`: agregar `finalizada`.
- `MiembroCartera`: añadir `estado`/`fechaBaja`; renombrar `rol`.
- `Transaccion`: añadir `idPeriodo` y `comprobanteUrl`; quitar `nombreGasto` duplicado.
- `CategoriaGasto`: añadir `idCartera?`, `idCategoriaCartera?`, `tipo`, `habilitada`, `orden`.
- `Usuario`: añadir `estado`, `fechaBaja`; quitar `rol`.
- Nuevos tipos: `Periodo`, `PagoRecurrente`, `TicketSoporte`, `RespuestaTicket`, `Trabajador`, `ComentarioLanding`, `Notificacion`.

### `src/stores/carteras.ts`
- `eliminar` y `eliminarMiembro`: pasar de borrado físico a **baja lógica**.
- `archivar`: no marcar como finalizada a todas; separar **inactivar** de **finalizar** (solo Viaje/Evento).
- `crearMiembro`: validar administrador único; añadir **delegar rol** y **salir de cartera**.
- `generarCodigo`: clave de **8 caracteres** (hoy `FZ-` + 6).

### `src/stores/auth.ts`
- Quitar `rol: 'admin'` automático en `registrar`.
- Sustituir la sesión en `localStorage` por **JWT**.
- Añadir restablecer contraseña y eliminar cuenta (lógico).

### `src/stores/usuarios.ts`
- Quitar contraseña fija `demo123`; usar hash provisto por el backend.
- Añadir `estado` de cuenta.

### `src/stores/transacciones.ts`
- Añadir reglas de autorización (Admin o dueño) y bloqueo por estado de cartera.
- Soporte de `idPeriodo` y `comprobanteUrl`.

### `src/utils/finanzas.ts` y `src/utils/reportes.ts`
- Balance y liquidación por **periodo** en carteras Hogar.
- Filtros por tipo de cartera y montos.

### `src/utils/exportar.ts`
- Añadir **exportación PDF** formal (además del CSV e impresión actuales).

### `src/pages/*`
- `Ajustes.tsx`: bloquear edición de correo; añadir switch de tema.
- `Detalle.tsx`: `puedeEditar` = activa **y** (admin o dueño), quitar permiso del autor contribuyente.
- `pages/reportes/*`, `Landing.tsx`, `Registro.tsx`, `Login.tsx`: ajustes según módulos 1, 2 y 6.

## 3. Módulos nuevos a crear (front)

| Módulo | Pantallas / componentes |
| --- | --- |
| Soporte cliente | Tabla "Mis reportes", Formulario crear/editar, Detalle de respuestas. |
| Inicio Admin | Portal, Dashboard de métricas, Buzón de comentarios. |
| Gestión trabajadores | Tabla, Formulario crear/editar, Modal confirmar eliminación, Vista de tickets asignados. |
| Soporte Admin / Dev | Tabla general de tickets, Detalle, Modal delegación, Formulario responder. |
| Pagos recurrentes | Lista, Formulario, Botón "Marcar como hecho". |
| Notificaciones | Panel de configuración y centro de notificaciones. |

## 4. Orden de implementación sugerido

1. **Alineación estructural**: consolidar el front en `web_FinanzaApp/` y migrar `reportes/`.
2. **Modelo y roles**: `models.ts`, `rolSistema`/`rolCartera`, RBAC base.
3. **Carteras**: estados, baja lógica, periodos Hogar, invitaciones de 8 caracteres.
4. **Transacciones y categorías**: autorización, comprobantes, paginación, periodos.
5. **Cuenta y auth**: JWT, restablecer contraseña, eliminación lógica, tema.
6. **Pagos recurrentes y notificaciones**.
7. **Reportes**: filtros ampliados y PDF.
8. **Soporte cliente → Admin → Trabajadores → Soporte admin**.
9. **Backend Flask** por blueprint, alineado con [`backend.md`](./backend.md).

## 5. Criterios de aceptación

- Compila sin errores y sin errores de consola.
- Se respeta la [matriz RBAC](./rbac-permisos.md) en cada pantalla.
- No hay borrados físicos de entidades de negocio.
- Montos en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- Cada módulo con sus criterios de aceptación propios validados en Taiga.
