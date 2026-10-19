# Plan de implementación — de la especificación al código

Checklist para construir el front **desde cero** en **`web_FinanzaApp/`** (JavaScript),
alineado con la **lógica de negocio documentada**. El antiguo prototipo `plantilla_web/`
se retiró y no es la base: solo sirvió de referencia de diseño.

## 0. Punto de partida

| Situación | Acción |
| --- | --- |
| Front: `web_FinanzaApp/` (solo el esqueleto base) | Construir cada módulo desde cero en JavaScript. |
| `Backend_FinanzaApp/` vacío (solo README + requirements) | No hay API real: implementar los blueprints y consumirlos desde el front. |

## 1. Alcance por módulo

El front se construye **completo desde cero**: todos los módulos parten de «Por hacer».

| Módulo | Qué construir |
| --- | --- |
| 1. Landing Page | Formulario de comentarios funcional y persistente. |
| 2. Autenticación y cuenta | JWT real; restablecer contraseña en 3 pasos; eliminar cuenta (lógico); correo no editable; tema Claro/Oscuro. |
| 3. Dashboard / Carteras | Estado **Finalizada** separado de Inactiva; finalizar solo Viaje/Evento; **periodos Hogar**; filtro por Finalizadas. |
| 4. Detalle de cartera | Delegación de rol; salir de cartera; baja/reactivación de miembros. |
| 5. Transacciones | Comprobante (Cloudinary); editar/eliminar solo Admin o dueño; paginación; filtro por periodo. |
| 5b. Categorías | Catálogo por tipo de cartera; personalizadas por cartera; tipo Gasto/Ingreso/Ambos; habilitar/ordenar. |
| 6. Reportes | Filtros por tipo y montos; **exportación PDF formal** (además de CSV e impresión). |
| 7. Pagos recurrentes | Módulo completo. |
| 8. Ajustes y notificaciones | Tema Claro/Oscuro; motor de notificaciones real. |
| 9. Soporte (cliente) | Tickets, estados, respuestas, cancelar. |
| 10. Inicio Admin | Métricas de clientes, buzón de comentarios, conteos. |
| 11. Gestión de trabajadores | CRUD de trabajadores y sus tickets. |
| 12. Soporte Admin / Dev | Tablero, tomar/asignar, catalogar, delegar, responder, cerrar. |

## 2. Reglas por archivo del front nuevo

> Los archivos viven en `web_FinanzaApp/src/` en **JavaScript** (`.jsx`/`.js`).

### `src/types/models.js`
- `RolUsuario` se divide en `rolSistema` (global) y `rolCartera` (membresía).
- `EstadoCartera` incluye `finalizada`.
- `MiembroCartera` lleva `estado`/`fechaBaja` y el campo `rol`.
- `Transaccion` lleva `idPeriodo` y `comprobanteUrl` (sin `nombreGasto` duplicado).
- `CategoriaGasto` lleva `idCartera?`, `idCategoriaCartera?`, `tipo`, `habilitada`, `orden`.
- `Usuario` lleva `estado`, `fechaBaja`.
- Tipos nuevos: `Periodo`, `PagoRecurrente`, `TicketSoporte`, `RespuestaTicket`, `Trabajador`, `ComentarioLanding`, `Notificacion`.

### `src/stores/carteras.js`
- `eliminar` y `eliminarMiembro`: **baja lógica** (nunca borrado físico).
- Separar **inactivar** de **finalizar** (finalizar solo Viaje/Evento).
- `crearMiembro`: validar administrador único; permitir **delegar rol** y **salir de cartera**.
- `generarCodigo`: clave de **8 caracteres**.

### `src/stores/auth.js`
- `registrar`: sin `rol: 'admin'` automático.
- Sesión por **JWT** (no `localStorage`).
- Restablecer contraseña y eliminar cuenta (lógico).

### `src/stores/usuarios.js`
- Sin contraseña fija; hash provisto por el backend.
- Campo `estado` de cuenta.

### `src/stores/transacciones.js`
- Reglas de autorización (Admin o dueño) y bloqueo por estado de cartera.
- Soporte de `idPeriodo` y `comprobanteUrl`.

### `src/utils/finanzas.js` y `src/utils/reportes.js`
- Balance y liquidación por **periodo** en carteras Hogar.
- Filtros por tipo de cartera y montos.

### `src/utils/exportar.js`
- **Exportación PDF** formal (además de CSV e impresión).

### `src/pages/*`
- `Ajustes.jsx`: correo no editable; switch de tema.
- `Detalle.jsx`: `puedeEditar` = activa **y** (admin o dueño).
- `pages/reportes/*`, `Landing.jsx`, `Registro.jsx`, `Login.jsx`: según módulos 1, 2 y 6.

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

1. **Base del front**: estructura en `web_FinanzaApp/` y utilidades compartidas.
2. **Modelo y roles**: `models.js`, `rolSistema`/`rolCartera`, RBAC base.
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
