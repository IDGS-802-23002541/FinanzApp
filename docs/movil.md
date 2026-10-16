# App Móvil — Android (Kotlin + Jetpack Compose, MVVM)

Pantallas y flujo de la app Android de FinanzApp, alineadas con la
[lógica de negocio](./logica-de-negocio.md) y la [matriz RBAC](./rbac-permisos.md).

## Stack y reglas

- **Android Studio** con **Kotlin + Jetpack Compose**.
- Arquitectura **MVVM**: `ui/` (Compose) → `viewmodel/` → `data/` (repositorios + API).
- Consumo de la misma API REST del [backend](./backend.md); sesión por **JWT**.
- Navegación con Navigation Compose.
- Ubicación: `movil_FinanzaApp/` (hoy solo el esqueleto base generado por Android Studio).

## Estructura propuesta

```
movil_FinanzaApp/app/src/main/java/.../
├── data/
│   ├── api/            # Retrofit/Ktor + JWT
│   ├── model/          # DTOs y entidades (espejo de modelo-datos)
│   └── repository/
├── ui/
│   ├── auth/           # Login, Registro, Restablecer contraseña
│   ├── carteras/       # Lista, Detalle, Formulario
│   ├── transacciones/  # Lista, Formulario
│   ├── contribuyentes/ # Miembros, Invitación QR
│   ├── periodos/       # Periodos Hogar
│   ├── reportes/       # Gráficas y filtros
│   ├── pagos/          # Pagos recurrentes
│   ├── ajustes/        # Perfil, tema, notificaciones
│   ├── soporte/        # Tickets del cliente
│   └── theme/          # Color.kt, Theme.kt, Type.kt (ya existen)
└── viewmodel/
```

## Pantallas por módulo

| Módulo | Pantallas (Compose) | Notas móviles |
| --- | --- | --- |
| Autenticación | Login, Registro, Restablecer contraseña | Restablecer en 3 pasos; correo inmutable en perfil. |
| Carteras | Lista con filtros, Formulario, Detalle | Tabs: resumen, movimientos, contribuyentes, invitación, cierre. |
| Contribuyentes | Lista de miembros, Invitación QR | **Escaneo de QR** con cámara + ingreso manual de la clave de 8 caracteres. |
| Periodos | Gestión de periodos | Solo carteras Hogar; marcar periodo activo. |
| Transacciones | Lista paginada, Formulario | Comprobante desde cámara/galería → Cloudinary; filtro por periodo. |
| Reportes | Gráficas interactivas, filtros | Reutilizar la lógica de `utils/reportes`. |
| Pagos recurrentes | Lista, Formulario, marcar "Hecho" | Recordatorios. |
| Ajustes | Perfil, tema Claro/Oscuro, notificaciones | Correo deshabilitado. |
| Soporte | Mis reportes, Formulario, Detalle | Estados pendiente/respondido/cerrado; cancelar si está pendiente. |
| Notificaciones | Centro de notificaciones | Push/avisos de movimientos y pagos próximos. |

## Reglas transversales en móvil

- Respetar el RBAC: ocultar acciones no permitidas según `rolCartera`.
- Carteras **Finalizadas** en modo solo lectura.
- Montos en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- **Eliminaciones lógicas**: nunca borrar datos; reflejar `estado`/`fechaBaja`.
- Cachear datos para uso offline básico y sincronizar al reconectar.
