# movil_FinanzaApp — App Android (Kotlin + Jetpack Compose)

App móvil oficial de FinanzApp (registro rápido en campo, unión por QR/código y consulta).

## Stack

- **Android Studio** con **Kotlin** + **Jetpack Compose** (Material 3).
- Arquitectura **MVVM**, organizada por **features**.
- Navegación con **Navigation Compose**.
- Inyección de dependencias con **Hilt** (procesador vía **KSP**).
- Red con **Retrofit + OkHttp** y **kotlinx.serialization**.
- Almacenamiento del token con **androidx.security-crypto**.
- Imágenes desde Cloudinary con Coil (pendiente).

## Estructura

```
movil_FinanzaApp/app/src/main/java/com/finanzap/
├── FinanzapApp.kt                 # Application (@HiltAndroidApp)
├── MainActivity.kt                # única actividad (@AndroidEntryPoint)
├── core/
│   ├── network/                   # cliente HTTP, AuthInterceptor (agrega el JWT), manejo de errores
│   ├── storage/                   # TokenStorage: guarda el token cifrado
│   ├── di/                        # módulos de inyección de dependencias
│   ├── navigation/                # rutas y grafo de navegación
│   ├── ui/
│   │   ├── components/            # componentes compartidos
│   │   └── theme/                 # Color.kt, Type.kt, Theme.kt
│   └── util/                      # validadores, formateo de montos y fechas, constantes
└── features/
    ├── auth/                      # login, logout, recuperar y cambiar contraseña
    ├── cuenta/                    # ver y eliminar cuenta
    ├── carteras/                  # dashboard y detalle de cartera
    ├── transacciones/
    ├── reportes/
    ├── pagosrecurrentes/          # sin guiones: los paquetes de Kotlin no los admiten
    ├── ajustes/
    └── soporte/
```

Cada feature sigue la forma `data/` (`XxxApi`, `XxxRepository`, `dto/`), `model/` y `ui/` (pantalla + ViewModel + UiState).

### Contrato de una pantalla

Todas las pantallas siguen la misma forma, para que una feature nueva se lea igual que las existentes:

- **`XxxUiState`**: `data class` inmutable con `cargando`, errores y datos. La pantalla solo dibuja lo que recibe.
- **`XxxViewModel`**: expone `state: StateFlow<XxxUiState>` y `eventos: Flow<XxxEvento>` para navegación o avisos de una sola vez.
- Los **eventos** se consumen con `LaunchedEffect` en la pantalla; nunca se guardan en el estado.
- **`XxxRepository`**: única puerta a la API y devuelve `Result<T>`; el ViewModel traduce el fallo a mensaje.
- La pantalla **no conoce DTOs ni Retrofit**, solo los modelos de `model/`.
- Estados de UI obligatorios: **cargando**, **error con reintento** (`EstadoError`) y **vacío** (`EstadoVacio`).

## Primeros pasos

1. Abrir la carpeta `movil_FinanzaApp/` en Android Studio (el proyecto base ya está en el repo).
2. Sincronizar Gradle y ejecutar en un emulador o dispositivo.
3. Configurar la URL de la API (`10.0.2.2` apunta al localhost de la máquina en el emulador).

## Reglas

Ver el `AGENTS.md` raíz (ramas, commits y reglas generales).
