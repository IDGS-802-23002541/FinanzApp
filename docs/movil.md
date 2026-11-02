# App Móvil — Android (Kotlin + Jetpack Compose, MVVM)

Pantallas y flujo de la app Android de FinanzApp, alineadas con la
[lógica de negocio](./logica-de-negocio.md) y la [matriz RBAC](./rbac-permisos.md).

## Stack y reglas

- **Android Studio** con **Kotlin + Jetpack Compose**.
- Arquitectura **MVVM** por features: `ui/` (Compose + ViewModel) → `data/` (API + repositorio).
- Consumo de la misma API REST del [backend](./backend.md); sesión por **JWT**.
- Navegación con Navigation Compose.
- Ubicación: `movil_FinanzaApp/`, paquete base `com.finanzap` (esqueleto por features ya creado).

## Estructura propuesta

```
movil_FinanzaApp/app/src/main/java/com/finanzap/
├── FinanzapApp.kt          # Application (Hilt)
├── MainActivity.kt         # única actividad; aloja la navegación
├── core/
│   ├── network/            # AuthInterceptor (JWT), TokenAuthenticator (refresh), jsonApi
│   ├── storage/            # SesionLocal, SesionLocalCifrada, PreferenciasTema, EventosSesion
│   ├── di/                 # Modulos.kt (repositorios, almacenamiento y red)
│   ├── navigation/         # Rutas, NavHost, MainViewModel
│   ├── ui/                 # componentes, tema, MenuLateral, PantallaPendiente
│   └── util/               # validadores, errores, montos y fechas
└── features/
    ├── auth/               # data/ (AuthApi, AuthRepository, AuthDtos) y ui/ (ViewModel + Screen)
    └── carteras/           # Cartera.kt, data/ y ui/
```

## Pantallas por módulo

| Módulo | Pantallas (Compose) | Notas móviles |
| --- | --- | --- |
| Autenticación | Login, Recuperar contraseña | Recuperar en 2 pasos: correo → código de 6 dígitos + nueva contraseña; correo inmutable en perfil. |
| Carteras | Lista con filtros, Formulario, Detalle | Tabs: resumen, movimientos, contribuyentes, invitación, cierre. |
| Contribuyentes | Lista de miembros, Invitación QR | **Escaneo de QR** con cámara + ingreso manual de la clave de 8 caracteres. |
| Periodos | Gestión de periodos | Solo carteras Hogar; marcar periodo activo. |
| Transacciones | Lista paginada, Formulario | Comprobante desde cámara/galería → Cloudinary; filtro por periodo. |
| Reportes | Gráficas interactivas, filtros | Reutilizar la lógica de `utils/reportes`. |
| Pagos recurrentes | Lista, Formulario, marcar "Hecho" | Recordatorios. |
| Ajustes | Perfil, tema Claro/Oscuro, notificaciones | Correo deshabilitado. |
| Soporte | Mis reportes, Formulario, Detalle | Estados pendiente/respondido/cerrado; cancelar si está pendiente. |
| Notificaciones | Centro de notificaciones | Push/avisos de movimientos y pagos próximos. |

### Recuperación de contraseña (HU-02.3)

Implementada en `features/auth/ui` (RecuperarViewModel y RecuperarContrasenaScreen) en dos pasos:

1. **Solicitud:** el usuario escribe su correo → `POST /auth/recuperar`. La respuesta es siempre el mismo mensaje neutro, exista o no la cuenta.
2. **Código y nueva contraseña:** código de 6 dígitos + nueva contraseña + confirmación → `POST /auth/restablecer`. Al completarse se muestra la confirmación y se vuelve al login.

Reglas:

- El código tiene vigencia de **30 minutos** y es de **un solo uso**; al restablecer se invalidan los demás códigos y las sesiones activas.
- La política de contraseña se valida igual en la app y en el backend: **mínimo 8 caracteres, una mayúscula y un número**.
- En builds de desarrollo la app muestra el código que devuelve el backend en modo `debug`; en release ese aviso no aparece.
- **Pendiente (tarea #219, backend):** envío del código por correo. Hasta entonces el flujo solo es funcional en entorno de desarrollo.

## Menú lateral global (decisión #TG-226)

**Por qué:** el encabezado de Carteras concentraba el título, el botón de tema y tres iconos (nueva cartera, mi cuenta, salir). En un teléfono de 384 dp el título “Carteras” se partía en dos líneas y la descripción quedaba en una columna muy angosta. Al mover los accesos al menú, el encabezado solo conserva `☰`, el título y la acción principal.

**Qué se hizo:**

- `ModalNavigationDrawer` en `core/navigation/FinanzAppNavHost.kt`, por encima del `NavHost`, para que el menú esté disponible en **todas** las secciones autenticadas y no solo en Carteras.
- Secciones: **Carteras, Reportes, Soporte, Mi cuenta** (agrupa ajustes), **Modo oscuro/claro** y **Cerrar sesión**.
- `core/ui/MenuLateral.kt` contiene el contenido del menú y `LocalAbrirMenu`, el `CompositionLocal` con el que cada encabezado abre el drawer.
- `core/ui/EncabezadoVolver.kt` muestra el botón `☰` cuando hay sesión iniciada; en Login y Recuperar el menú no se muestra ni se puede deslizar.
- La sección actual se resalta según la ruta; Nueva cartera resalta Carteras y Cambiar contraseña resalta Mi cuenta.
- La navegación desde el menú usa `popUpTo(Rutas.Carteras)` para no acumular secciones en la pila.
- Reportes y Soporte todavía no tienen módulo: abren `core/ui/PantallaPendiente.kt` con el aviso “Próximamente”.

**Referencia:** commit `1d88c75`, historia #TG-226.

## Reglas transversales en móvil

- Respetar el RBAC: ocultar acciones no permitidas según `rolCartera`.
- Carteras **Finalizadas** en modo solo lectura.
- Montos en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- **Eliminaciones lógicas**: nunca borrar datos; reflejar `estado`/`fechaBaja`.
- Cachear datos para uso offline básico y sincronizar al reconectar.
