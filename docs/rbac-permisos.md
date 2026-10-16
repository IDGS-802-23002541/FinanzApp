# Matriz de permisos (RBAC) — FinanzApp

Control de acceso por roles para todos los módulos. Refina la matriz de la
especificación separando **rol de sistema** (`rolSistema`) y **rol dentro de
cartera** (`rolCartera`), e incorporando la corrección acordada:
**editar/eliminar transacciones = Administrador o dueño de cartera**.

## Roles

| Rol | Tipo | Descripción |
| --- | --- | --- |
| **Visitante** | — | No autenticado. |
| **Usuario** | `rolSistema = usuario` | Cuenta autenticada; puede ser propietario/contribuyente. |
| **Propietario / Administrador de cartera** | `rolCartera = administrador` | Dueño o administrador delegado de una cartera. |
| **Contribuyente** | `rolCartera = contribuyente` | Invitado que participa en una cartera. |
| **Admin del sistema** | `rolSistema = adminSistema` | Administrador global de la plataforma. |
| **Trabajador / Dev** | `rolSistema = trabajador` | Equipo técnico o de soporte. |

> Notas: **Propietario** = creador (`idPropietario`) o administrador delegado
> (`rolCartera = administrador`). En transacciones, "Administrador o dueño"
> cubre a ambos. Un **trabajador** solo cierra los tickets **asignados a él**.

Leyenda: **X** = permitido · **—** = denegado.

| Funcionalidad / Módulo | Visitante | Propietario (cartera) | Contribuyente | Admin (sistema) | Trabajador / Dev |
| --- | :---: | :---: | :---: | :---: | :---: |
| **Landing Page** |
| Ver landing y enviar comentarios | **X** | **X** | **X** | **X** | **X** |
| **Autenticación y Cuenta** |
| Registrar nueva cuenta | **X** | **X** | **X** | **X** | **X** |
| Iniciar y cerrar sesión | **X** | **X** | **X** | **X** | **X** |
| Recuperar y cambiar contraseña | **X** | **X** | **X** | **X** | **X** |
| Ver, editar perfil o eliminar cuenta (lógico) | — | **X** | **X** | **X** | **X** |
| **Dashboard y Carteras** |
| Crear nueva cartera | — | **X** | **X** *(la suya)* | **X** | **X** |
| Listar, buscar y filtrar carteras | — | **X** | **X** | **X** | **X** |
| Ver detalle, balance y gráficas de cartera | — | **X** | **X** | **X** | **X** |
| Editar datos de la cartera | — | **X** | — | **X** | **X** |
| Inactivar cartera (baja lógica) | — | **X** | — | **X** | **X** |
| Reactivar cartera | — | **X** | — | **X** | **X** |
| Finalizar cartera (Viaje/Evento → Finalizada) | — | **X** | — | **X** | **X** |
| Gestionar periodos (solo Hogar) | — | **X** | — | **X** | **X** |
| Invitar miembros (Generar QR / Clave) | — | **X** | — | **X** | **X** |
| Dar de baja / reactivar contribuyentes | — | **X** | — | **X** | **X** |
| Delegar rol de administrador | — | **X** | — | **X** | **X** |
| Salirse de una cartera compartida | — | — | **X** | — | — |
| **Transacciones** |
| Ver, filtrar por periodo y paginar | — | **X** | **X** | **X** | **X** |
| Registrar ingreso o gasto | — | **X** | **X** | **X** | **X** |
| Editar o eliminar transacción | — | **X** | — | **X** | **X** |
| Crear categoría personalizada | — | **X** | **X** | **X** | **X** |
| Habilitar/deshabilitar y ordenar categorías | — | **X** | — | **X** | **X** |
| **Reportes** |
| Filtrar, previsualizar, generar y descargar PDF | — | **X** | **X** | **X** | **X** |
| **Pagos Recurrentes** |
| Ver pagos recurrentes | — | **X** | **X** | **X** | **X** |
| Agregar, editar y eliminar pago recurrente | — | **X** | **X** | **X** | **X** |
| Marcar pago como "Hecho" | — | **X** | **X** | **X** | **X** |
| **Ajustes de Plataforma** |
| Modificar datos de cuenta y cambiar tema | — | **X** | **X** | **X** | **X** |
| Configurar notificaciones | — | **X** | **X** | **X** | **X** |
| **Soporte (Cliente)** |
| Crear reporte de ayuda | — | **X** | **X** | **X** | **X** |
| Ver mis reportes y respuestas recibidas | — | **X** *(propios)* | **X** *(propios)* | **X** | **X** |
| Editar y cancelar reporte (si está pendiente) | — | **X** *(propios)* | **X** *(propios)* | **X** | **X** |
| **Panel Administrador (Global)** |
| Ver métricas de clientes (totales, activos, etc.) | — | — | — | **X** | **X** |
| Ver buzón de comentarios de landing | — | — | — | **X** | **X** |
| Ver totales de trabajadores y tickets | — | — | — | **X** | **X** |
| Ver, crear, editar y eliminar trabajadores | — | — | — | **X** | — |
| **Gestión de Tickets de Soporte** |
| Ver y filtrar todos los tickets | — | — | — | **X** | **X** |
| Tomar o asignar ticket | — | — | — | **X** | **X** |
| Catalogar o clasificar ticket | — | — | — | **X** | **X** |
| Responder ticket al cliente | — | — | — | **X** | **X** |
| Cerrar ticket | — | — | — | **X** | **X** *(solo asignados)* |

## Reglas de autorización clave

1. **Un único administrador activo** por cartera; no puede abandonarla sin delegar o cerrar.
2. El **contribuyente** solo registra y consulta movimientos; **no** los edita ni elimina.
3. Edición/eliminación de movimientos **bloqueada** si la cartera está Inactiva o Finalizada.
4. Las carteras **Finalizadas** son de solo lectura para todos.
5. El correo de la cuenta es **inmutable**; fecha de creación y estado tampoco son editables por el usuario.
6. Un **trabajador** solo puede **cerrar** tickets que le fueron **asignados**.
