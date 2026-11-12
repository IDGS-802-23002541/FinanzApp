# Modelo de datos — FinanzApp

Entidades, campos y relaciones que sustentan la [lógica de negocio](./logica-de-negocio.md),
incluidas las **entidades nuevas** de los módulos que aún no existen.

> Convenciones: `PK` = clave primaria, `FK` = clave foránea, `?` = campo opcional.
> Los borrados son **lógicos** (`estado` + `fechaBaja`), salvo que se indique lo contrario.

---

## 1. Entidades existentes (con cambios)

### 1.1 `Usuario`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idUsuario | int PK | |
| nombreUsuario | string | |
| APaterno | string | |
| AMaterno | string? | |
| correo | string | **Único**, **no editable** tras el registro |
| contrasenaHash | string | Reemplaza `contrasena` en texto plano |
| telefono | string? | |
| **rolSistema** | enum | `usuario` \| `adminSistema` \| `trabajador`. **Nuevo** (reemplaza `rol` global) |
| **estado** | enum | `activo` \| `inactivo` \| `eliminado`. **Nuevo** |
| **fechaBaja** | datetime? | **Nuevo** (baja lógica) |
| fechaCreacion | datetime | Inmutable |
| color | string | Preferencia de avatar |

> Cambio: se **elimina `rol`** global; el rol dentro de cartera pasa a `MiembroCartera`.

### 1.2 `Tipo de cartera` — no es tabla propia
> Se usa `Cartera.tipo` (`HOGAR` \| `VIAJE` \| `EVENTO` \| `OTRA`) y `CATEGORIAS.tipoCartera` para el catálogo global por tipo.

### 1.3 `Cartera` (tabla `CARTERA`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idCartera | int PK | |
| nombre | string(100) | NOT NULL |
| descripcion | string(500)? | |
| presupuestoInicial | decimal(12,2) | NOT NULL, default 0; no aplica a Hogar |
| tipo | string(10) | NOT NULL, default `OTRA`; `HOGAR` \| `VIAJE` \| `EVENTO` \| `OTRO` |
| fechaCreacion | datetime | NOT NULL, default `sysutcdatetime()` |
| fechaInicio | date? | Vigencia (Viaje/Evento/Otro) |
| fechaFin | date? | Vigencia (Viaje/Evento/Otro) |
| estado | string(12) | NOT NULL, default `ACTIVA`; `ACTIVA` \| `ARCHIVADA` \| `FINALIZADA` |
| versionFila | rowversion | NOT NULL, control de concurrencia |

> `FINALIZADA` solo aplica a carteras de tipo Viaje/Evento (HU-04.6).

> La invitación vive en `Invitacion` (ver §1.7): el QR muestra una clave de 8 caracteres que se almacena hasheada en `codigoHash`.

### 1.4 `MiembroCartera`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idMiembro | int PK | |
| idCartera | int FK | |
| idUsuario | int FK | |
| **rolCartera** | enum | `administrador` \| `contribuyente`. **Renombra `rol`** |
| aporteComprometido | decimal? | Informativo |
| **estado** | enum | `activo` \| `baja`. **Nuevo** (baja/reactivación) |
| **fechaBaja** | datetime? | **Nuevo** |
| fechaUnion | datetime | |

> Regla: **un solo `administrador` activo** por cartera.

### 1.5 `Transaccion` (tabla real: `TRANSACCIONES`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idTransaccion | int PK | |
| carteraId | int FK | |
| usuarioId | int FK | Responsable (debe ser miembro activo de la cartera) |
| categoriaId | int FK? | Ver §1.6 |
| **periodoId** | int FK? | Periodo del movimiento (carteras Hogar) |
| tipo | enum | `INGRESO` \| `GASTO` |
| monto | decimal | Mayor a 0 (`CK_TRANSACCIONES_monto`) |
| fechaTransaccion | datetime | Fecha del movimiento |
| descripcion | string? | Descripción |
| metodoPago | enum? | `EFECTIVO` \| `TARJETA` \| `TRANSFERENCIA` |
| **comprobanteUrl** | string? | Imagen en Cloudinary |
| **estado** | enum | `ACTIVO` \| `ELIMINADO` (baja lógica) |
| fechaCreacion | datetime | Inmutable |
| fechaActualizacion | datetime? | |

> Cambio: se elimina `nombreGasto` duplicado; el nombre se obtiene de la categoría.

### 1.6 `Categoria` (tabla real: `CATEGORIAS`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idCategoria | int PK | |
| nombre | string | |
| **carteraId** | int FK? | `null` = categoría global; con valor = personalizada de esa cartera |
| **tipoCartera** | enum? | `HOGAR` \| `VIAJE` \| `EVENTO` \| `OTRA`; `null` = aplica a todos los tipos. Solo en globales |
| **tipo** | enum | `GASTO` \| `INGRESO` \| `AMBOS` |
| **orden** | int | Orden del selector (default 0) |
| **estado** | enum | `ACTIVA` \| `INACTIVA` (baja lógica; equivale a habilitar/deshabilitar) |
| esPredeterminada | bool calculado | `1` cuando `carteraId IS NULL` |

> Unicidad: globales por `(nombre, tipoCartera)`; personalizadas por `(carteraId, nombre)`.
> Sin `icono` ni `color` por ahora: la HU-05.4 solo pide crear por nombre y mostrar en el selector.
> Si una pantalla futura los pide, se agregan con migración.

### 1.7 `Invitacion` (tabla real: `INVITACION`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idInvitacion | int PK | |
| carteraId | int FK | Debe ser miembro activo quien invita |
| usuarioId | int FK | Creador de la invitación |
| codigoHash | string | Hash de la clave de 8 caracteres que muestra el QR |
| fechaCreacion | datetime | Inmutable |
| fechaExpiracion | datetime | Posterior a la creación |
| estado | enum | `ACTIVA` \| `REVOCADA` |
| fechaRevocacion | datetime? | Solo cuando está revocada |

> Regenerar el QR revoca la invitación anterior (`REVOCADA` + fecha) y crea una nueva.
> Los ingresos quedan registrados en `MiembroCartera.fechaUnion` (bitácora de accesos).

---

## 2. Entidades nuevas

### 2.1 `Periodo` (exclusivo Cartera Hogar)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idPeriodo | int PK | |
| carteraId | int FK | Debe ser tipo Hogar |
| nombre | string | Nombre visible del periodo |
| fechaInicio | date | |
| fechaFin | date | `fechaFin >= fechaInicio` (`CK_PERIODO_fechas`) |
| estado | enum | `ACTIVO` \| `CERRADO` |
| fechaCreacion | datetime | Inmutable |

> La migración `SQL/migracion_t232_periodo.sql` crea `PERIODO` y homologa los
> constraints e índices de `CARTERA` y `MIEMBROS_CARTERA`. Las FK se mantienen
> sin `CASCADE` porque la baja de carteras es lógica.

### 2.2 `PagoRecurrente` (tabla real: `PAGOS_RECURRENTES`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idPagoRecurrente | int PK | |
| carteraId | int FK | Debe ser miembro activo |
| usuarioId | int FK | Autor del pago |
| categoriaId | int FK? | |
| nombre | string | |
| descripcion | string? | |
| monto | decimal | Mayor a 0 (`CK_PAGOS_RECURRENTES_monto`) |
| frecuencia | enum | `DIARIO` \| `SEMANAL` \| `MENSUAL` \| `ANUAL` |
| fechaInicio | date | |
| fechaFin | date? | `null` o posterior a `fechaInicio` |
| proximaEjecucion | date | Próximo vencimiento |
| estado | enum | `ACTIVO` \| `PAUSADO` \| `CANCELADO` |
| fechaCreacion | datetime | Inmutable |

### 2.2.1 `PagoRecEjecucion` (tabla real: `PAGOS_REC_EJECUCIONES`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idEjecucion | int PK | |
| pagoRecurrenteId | int FK | |
| transaccionId | int FK? | Gasto generado al marcar 'Hecho' |
| fechaProgramada | date | Única por pago (`UQ_PAGOS_REC_EJECUCIONES_fecha`) |
| fechaEjecucion | datetime? | |
| monto | decimal | Mayor a 0 |
| estado | enum | `PENDIENTE` \| `EJECUTADO` \| `FALLIDO` \| `OMITIDO` |
| mensajeError | string? | |

> Migración `SQL/migracion_t169_pagos.sql`; las FK no usan `CASCADE` porque las
> bajas son lógicas.

### 2.3 `Ticket` (tabla real: `TICKET`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idTicket | int PK | |
| usuarioId | int FK | Cliente que reporta |
| asunto | string | No vacío |
| descripcion | text | Editable mientras esté abierto |
| categoria | enum | `GENERAL` \| `CUENTA` \| `CARTERA` \| `PAGOS` \| `ERROR` \| `OTRO` |
| prioridad | enum | `BAJA` \| `MEDIA` \| `ALTA` \| `URGENTE` |
| estado | enum | `ABIERTO` \| `EN_PROCESO` \| `ESPERA` \| `RESUELTO` \| `CERRADO` |
| fechaCreacion | datetime | |
| fechaActualizacion | datetime? | |
| fechaCierre | datetime? | Posterior a la creación |

### 2.4 `RespuestaTicket` (tabla real: `RESPUESTA_TICKET`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idRespuesta | int PK | |
| ticketId | int FK | |
| usuarioId | int FK | Autor |
| mensaje | text | No vacío |
| fechaCreacion | datetime | |
| esInterna | bool | Nota interna del equipo |

### 2.4.1 `AsignacionTicket` (tabla real: `ASIGNACION_TICKET`)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idAsignacion | int PK | |
| ticketId | int FK | |
| trabajadorId | int FK | Responsable asignado |
| fechaInicio | datetime | |
| fechaFin | datetime? | |
| esActual | bool | Un solo registro actual por ticket (índice único filtrado) |
| observaciones | string? | |

> Migración `SQL/migracion_t211_soporte.sql`; las FK no usan `CASCADE` porque
> las bajas de tickets son lógicas.

### 2.5 `Trabajador` (equipo interno)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idTrabajador | int PK | |
| idUsuario | int FK? | Si tiene cuenta de acceso |
| nombre | string | |
| correo | string | |
| rolEquipo | enum | `dev` \| `soporte` \| ... |
| estado | enum | `activo` \| `baja` |

### 2.6 `ComentarioLanding`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idComentario | int PK | |
| nombre | string | Obligatorio, no vacío |
| correo | string? | |
| comentario | text | Mensaje del visitante, no vacío |
| fechaCreacion | datetime | Inmutable |
| estado | enum | `PENDIENTE` \| `PUBLICADO` \| `OCULTO` |

> Migración `SQL/migracion_t93_comentarios.sql`; el buzón del administrador usa
> `estado` para ocultar o publicar comentarios sin borrarlos.

### 2.7 `Notificacion`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idNotificacion | bigint PK | |
| usuarioId | int FK | Destinatario |
| titulo | string | No vacío |
| mensaje | string | No vacío |
| tipo | enum? | `MOVIMIENTO` \| `CIERRE` \| `RECORDATORIO` \| `PAGO` |
| fechaCreacion | datetime | Inmutable |
| fechaLectura | datetime? | `null` = no leída |

> Migración `SQL/migracion_t184_notificaciones.sql`.

### 2.8 `PreferenciaUsuario`
| Campo | Tipo | Notas |
| --- | --- | --- |
| usuarioId | int PK/FK | |
| tema | enum | `CLARO` \| `OSCURO` \| `SISTEMA` |
| notificacionesCorreo | bool | |
| notificacionesApp | bool | Interruptor general |
| notificacionesMovimientos | bool | Avisos de movimientos en cartera |
| notificacionesSistema | bool | Recordatorios del sistema |
| notificacionesPagos | bool | Recordatorios de pagos recurrentes |
| moneda | string | `MXN` por defecto |
| fechaActualizacion | datetime | |

> Los tres interruptores nuevos se agregan en `migracion_t184_notificaciones.sql`.

---

## 3. Relaciones principales

```
Usuario 1 ─── N Cartera            (como propietario)
Usuario N ─── N Cartera            (vía MiembroCartera)
Cartera 1 ─── N MiembroCartera
Cartera 1 ─── N Transaccion
Cartera 1 ─── N Periodo            (solo Hogar)
Cartera 1 ─── N PagoRecurrente
Cartera 1 ─── N Categoria          (personalizadas; globales con carteraId null)
Cartera 1 ─── N Invitacion
Categoria 1 ─── N Transaccion
Periodo 1 ─── N Transaccion        (carteras Hogar)
Usuario 1 ─── N TicketSoporte      (como cliente)
Trabajador 1 ─── N TicketSoporte   (asignado)
TicketSoporte 1 ─── N RespuestaTicket
```

## 4. Reglas de integridad

1. **Mínimo un administrador activo** por cartera (validado en app y en BD).
2. `Periodo.idCartera` solo admite carteras con `tipo = HOGAR`.
3. `estado = finalizada` solo permitido en carteras `Viaje` o `Evento`.
4. La clave de invitación es única y de **8 caracteres**; se almacena hasheada en `Invitacion.codigoHash`. Regenerar revoca la anterior.
5. Toda baja es lógica: nunca `DELETE` físico de entidades de negocio.
6. `comprobanteUrl` apunta a **Cloudinary**; nunca se almacenan binarios en la BD.
7. `correo` es único e inmutable por cuenta.
