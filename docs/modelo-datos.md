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

### 1.2 `CategoriaCartera` (tipo de cartera)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idCategoriaCartera | int PK | |
| nombreCategoriaCartera | enum | `Hogar` \| `Viaje` \| `Evento` \| `Otro` |
| descripcion | string | |
| icono | string | |
| color | string | |

### 1.3 `Cartera`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idCartera | int PK | |
| nombreCartera | string | |
| descripcion | string | |
| idCategoriaCartera | int FK | Tipo de cartera |
| idPropietario | int FK | Dueño/administrador original |
| presupuestoInicial | decimal? | Opcional |
| **estado** | enum | `ACTIVA` \| `ARCHIVADA` (= inactiva) \| `FINALIZADA`. **Finalizada solo Viaje/Evento** |
| fechaCreacion | datetime | |
| fechaInicio | date? | Vigencia |
| fechaFin | date? | Vigencia |
| fechaCierre | datetime? | Al finalizar |
| **fechaBaja** | datetime? | **Nuevo** (baja lógica) |
| codigoInvitacion | string | **8 caracteres** |
| color | string | |

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

### 1.5 `Transaccion`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idTransaccion | int PK | |
| idCartera | int FK | |
| idUsuario | int FK | Responsable |
| idCategoriaGasto | int FK | Ver §1.6 |
| **idPeriodo** | int FK? | **Nuevo**: periodo del movimiento (carteras Hogar) |
| tipo | enum | `ingreso` \| `gasto` |
| monto | decimal | |
| fecha | date | |
| metodoPago | enum | `efectivo` \| `tarjeta` \| `transferencia` |
| nota | string | Descripción |
| **comprobanteUrl** | string? | **Nuevo**: imagen en Cloudinary |
| **estado** | enum | `activo` \| `eliminado`. **Nuevo** (baja lógica) |

> Cambio: se elimina `nombreGasto` duplicado; el nombre se obtiene de la categoría.

### 1.6 `CategoriaGasto`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idCategoriaGasto | int PK | |
| nombreGasto | string | |
| icono | string | |
| color | string | |
| **idCartera** | int FK? | `null` = categoría global; con valor = personalizada. **Nuevo** |
| **idCategoriaCartera** | int FK? | Para globales: a qué **tipo de cartera** aplica. **Nuevo** |
| **tipo** | enum | `gasto` \| `ingreso` \| `ambos`. **Nuevo** |
| **habilitada** | bool | Habilitar/deshabilitar. **Nuevo** |
| **orden** | int | Ordenamiento personalizado. **Nuevo** |

---

## 2. Entidades nuevas

### 2.1 `Periodo` (exclusivo Cartera Hogar)
| Campo | Tipo | Notas |
| --- | --- | --- |
| idPeriodo | int PK | |
| idCartera | int FK | Debe ser tipo Hogar |
| frecuencia | enum | `semanal` \| `quincenal` \| `mensual` \| ... |
| fechaInicio | date | |
| fechaFin | date | |
| **activo** | bool | Periodo vigente actual |

### 2.2 `PagoRecurrente`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idPagoRecurrente | int PK | |
| idCartera | int FK | |
| idCategoriaGasto | int FK | |
| descripcion | string | |
| monto | decimal | |
| periodicidad | enum | `semanal` \| `quincenal` \| `mensual` \| `anual` |
| proximoVencimiento | date | |
| estado | enum | `pendiente` \| `hecho` |
| fechaHecho | datetime? | |

### 2.3 `TicketSoporte`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idTicket | int PK | |
| idUsuario | int FK | Cliente que reporta |
| asunto | string | |
| descripcion | text | Editable mientras esté pendiente |
| categoria | string? | Clasificación hecha por soporte |
| **estado** | enum | `pendiente` \| `respondido` \| `cerrado` \| `cancelado` |
| idTrabajador | int FK? | Asignado |
| fechaCreacion | datetime | |
| fechaCierre | datetime? | |

### 2.4 `RespuestaTicket`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idRespuesta | int PK | |
| idTicket | int FK | |
| idTrabajador | int FK | Autor |
| mensaje | text | |
| fecha | datetime | |

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
| nombre | string | |
| correo | string | |
| mensaje | text | |
| fecha | datetime | |
| leido | bool | Para el buzón del administrador |

### 2.7 `Notificacion`
| Campo | Tipo | Notas |
| --- | --- | --- |
| idNotificacion | int PK | |
| idUsuario | int FK | Destinatario |
| tipo | enum | `movimiento` \| `recordatorio` \| `pago_recurrente` |
| mensaje | string | |
| leida | bool | |
| fecha | datetime | |

---

## 3. Relaciones principales

```
Usuario 1 ─── N Cartera            (como propietario)
Usuario N ─── N Cartera            (vía MiembroCartera)
Cartera 1 ─── N MiembroCartera
Cartera 1 ─── N Transaccion
Cartera 1 ─── N Periodo            (solo Hogar)
Cartera 1 ─── N PagoRecurrente
CategoriaCartera 1 ─── N Cartera
CategoriaGasto 1 ─── N Transaccion
Periodo 1 ─── N Transaccion        (carteras Hogar)
Usuario 1 ─── N TicketSoporte      (como cliente)
Trabajador 1 ─── N TicketSoporte   (asignado)
TicketSoporte 1 ─── N RespuestaTicket
```

## 4. Reglas de integridad

1. **Mínimo un administrador activo** por cartera (validado en app y en BD).
2. `Periodo.idCartera` solo admite carteras con `idCategoriaCartera = Hogar`.
3. `estado = finalizada` solo permitido en carteras `Viaje` o `Evento`.
4. `codigoInvitacion` es único y de **8 caracteres**.
5. Toda baja es lógica: nunca `DELETE` físico de entidades de negocio.
6. `comprobanteUrl` apunta a **Cloudinary**; nunca se almacenan binarios en la BD.
7. `correo` es único e inmutable por cuenta.
