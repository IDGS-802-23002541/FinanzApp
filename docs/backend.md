# Backend_FinanzaApp — API REST (Python 3.13 + Flask)

Diseño del backend que implementa la [lógica de negocio](./logica-de-negocio.md)
y el [modelo de datos](./modelo-datos.md). Sustituye los datos mock del front
por una API real con persistencia en **SQL Server** y archivos en **Cloudinary**.

## Stack y reglas

- **Python 3.13** + **Flask con Blueprints** (un blueprint por dominio).
- **SQL Server** vía SQLAlchemy + `pyodbc`.
- **Cloudinary** para comprobantes e imágenes.
- **JWT** para sesiones; contraseñas con hash (nunca en texto plano).
- Variables de entorno en `.env` (nunca al repo): cadena de SQL Server y credenciales de Cloudinary.

## Estructura

```
Backend_FinanzaApp/
├── app/
│   ├── __init__.py          # create_app() y registro de blueprints
│   ├── extensions.py        # db (SQL Server), cloudinary, jwt
│   ├── blueprints/
│   │   ├── auth/            # registro, login, recuperar contraseña
│   │   ├── usuarios/        # perfil, baja lógica, admin de clientes
│   │   ├── carteras/        # CRUD, estados, filtros, periodos
│   │   ├── miembros/        # invitaciones, roles, baja/reactivación
│   │   ├── transacciones/   # movimientos, comprobantes
│   │   ├── categorias/      # globales y personalizadas
│   │   ├── pagos/           # pagos recurrentes
│   │   ├── reportes/        # agregados y PDF
│   │   ├── notificaciones/
│   │   ├── soporte/         # tickets cliente/admin
│   │   └── admin/           # métricas, trabajadores, comentarios
│   ├── models/              # entidades SQLAlchemy
│   └── utils/               # validaciones, permisos, respuestas
├── config.py
├── run.py
├── requirements.txt
└── .env.example
```

## Blueprints y responsabilidades

| Blueprint | Endpoints principales | Reglas |
| --- | --- | --- |
| `auth` | `POST /auth/registro`, `/auth/login`, `/auth/recuperar`, `/auth/restablecer` | JWT; validar correo único; recuperación con código de 6 dígitos (30 min, un solo uso). |
| `usuarios` | `GET/PUT /usuarios/me`, `DELETE /usuarios/me`, `GET /usuarios` (admin) | Correo inmutable; baja lógica; solo admin lista clientes. |
| `carteras` | `GET/POST /carteras`, `GET/PUT /carteras/:id`, `POST /carteras/:id/inactivar`, `/reactivar`, `/finalizar` | Finalizada solo Viaje/Evento; sin borrado físico; filtros por estado/pertenencia. |
| `miembros` | `GET/POST /carteras/:id/miembros`, `DELETE`, `/unirse`, `/delegar`, `/salir` | Un solo admin activo; baja/reactivación; invitación 8 caracteres. |
| `periodos` | `GET/POST /carteras/:id/periodos` | Solo Hogar; un periodo activo. |
| `transacciones` | `GET/POST /carteras/:id/transacciones`, `PUT/DELETE /transacciones/:id` | Editar/eliminar solo admin o dueño; bloqueo por estado; paginación; filtro por periodo. |
| `categorias` | `GET /categorias`, `POST/PUT /carteras/:id/categorias` | Global por tipo; personalizadas; habilitar/ordenar. |
| `pagos` | `GET/POST /carteras/:id/pagos`, `PUT/DELETE /pagos/:id`, `/marcar-hecho` | Estados pendiente/hecho. |
| `reportes` | `GET /carteras/:id/reporte`, `GET /reportes/pdf` | Filtros por tipo, montos y periodo; PDF. |
| `notificaciones` | `GET /notificaciones`, `PUT /notificaciones/:id/leida` | Movimientos, recordatorios, pagos próximos. |
| `soporte` | `GET/POST /tickets`, `PUT /tickets/:id`, `POST /tickets/:id/responder`, `/cerrar`, `/delegar` | Estados; worker solo cierra los asignados. |
| `admin` | `GET /admin/metricas`, `GET/POST /admin/trabajadores`, `GET /admin/comentarios` | Solo `adminSistema`; CRUD trabajadores y buzz. |
| `landing` | `POST /comentarios` | Público. |

## Validaciones que deben vivir en el servidor

1. **Administrador único** activo por cartera.
2. **Editar/eliminar movimiento**: solo administrador o dueño, y cartera activa.
3. **Finalizada** solo para Viaje/Evento y bloquea escrituras.
4. **Sin DELETE físico** en entidades de negocio.
5. `codigoInvitacion` de **8 caracteres**, único; regenerar invalida el anterior.
6. `Periodo` solo en carteras Hogar.
7. `correo` único e inmutable; contraseña con hash.
8. Un trabajador **solo cierra** tickets asignados a él.

## Respuestas y errores

- Formato JSON uniforme: `{ ok, data, mensaje }` para éxito y `{ ok: false, mensaje }` con el código HTTP correspondiente.
- Códigos: `400` validación, `401` no autenticado, `403` sin permiso, `404` inexistente, `409` conflicto (duplicados, admin único).

## Primeros pasos

```bash
cd Backend_FinanzaApp
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app run.py run --debug
```
