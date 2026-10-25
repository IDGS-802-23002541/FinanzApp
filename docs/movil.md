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
│   ├── network/            # cliente HTTP, AuthInterceptor (JWT), manejo de errores
│   ├── storage/            # TokenStorage (token cifrado)
│   ├── di/                 # módulos de Hilt
│   ├── navigation/         # rutas y grafo de navegación
│   ├── ui/
│   │   ├── components/     # componentes compartidos
│   │   └── theme/          # Color.kt, Theme.kt, Type.kt
│   └── util/               # validadores, formateo de montos y fechas, constantes
└── features/               # MVVM por feature: data/ (api, repository, dto), model/, ui/
    ├── auth/               # login, logout, recuperar y cambiar contraseña
    ├── cuenta/             # ver y eliminar cuenta
    ├── carteras/           # dashboard y detalle de cartera
    ├── transacciones/
    ├── reportes/
    ├── pagosrecurrentes/   # sin guiones: los paquetes de Kotlin no los admiten
    ├── ajustes/
    └── soporte/
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

Implementada en `features/auth/ui/recuperar` en dos pasos:

1. **Solicitud:** el usuario escribe su correo → `POST /auth/recuperar`. La respuesta es siempre el mismo mensaje neutro, exista o no la cuenta.
2. **Código y nueva contraseña:** código de 6 dígitos + nueva contraseña + confirmación → `POST /auth/restablecer`. Al completarse se muestra la confirmación y se vuelve al login.

Reglas:

- El código tiene vigencia de **30 minutos** y es de **un solo uso**; al restablecer se invalidan los demás códigos y las sesiones activas.
- La política de contraseña se valida igual en la app y en el backend: **mínimo 8 caracteres, una mayúscula y un número**.
- En builds de desarrollo la app muestra el código que devuelve el backend en modo `debug`; en release ese aviso no aparece.
- **Pendiente (tarea #219, backend):** envío del código por correo. Hasta entonces el flujo solo es funcional en entorno de desarrollo.

## Reglas transversales en móvil

- Respetar el RBAC: ocultar acciones no permitidas según `rolCartera`.
- Carteras **Finalizadas** en modo solo lectura.
- Montos en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- **Eliminaciones lógicas**: nunca borrar datos; reflejar `estado`/`fechaBaja`.
- Cachear datos para uso offline básico y sincronizar al reconectar.
