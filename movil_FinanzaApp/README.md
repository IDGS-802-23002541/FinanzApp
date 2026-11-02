# movil_FinanzaApp — App Android (Kotlin + Jetpack Compose)

App móvil oficial de FinanzApp (registro rápido en campo, unión por QR/código y consulta).

## Stack

- **Android Studio** con **Kotlin** + **Jetpack Compose** (Material 3).
- Arquitectura **MVVM**, organizada por **features**.
- Navegación con **Navigation Compose**.
- Inyección de dependencias con **Hilt** (procesador vía **KSP**).
- Red con **Retrofit + OkHttp** y **kotlinx.serialization**.
- Almacenamiento de la sesión con **androidx.security-crypto**.
- Imágenes desde Cloudinary con Coil (pendiente).

## Estructura

```
movil_FinanzaApp/app/src/main/java/com/finanzap/
├── FinanzapApp.kt                 # Application (@HiltAndroidApp)
├── MainActivity.kt                # única actividad (@AndroidEntryPoint)
├── core/
│   ├── network/                   # AuthInterceptor (JWT), TokenAuthenticator (refresh), jsonApi
│   ├── storage/                   # SesionLocal, SesionLocalCifrada, PreferenciasTema, EventosSesion
│   ├── di/                        # Modulos.kt: repositorios, almacenamiento y red
│   ├── navigation/                # Rutas, grafo de navegación y estado raíz
│   ├── ui/                        # componentes, tema y dimensiones
│   └── util/                      # validadores, errores de API, montos y fechas
└── features/
    ├── auth/
    │   ├── data/                  # AuthApi, AuthRepository(+Impl), AuthDtos
    │   └── ui/                    # Login, Recuperar, MiCuenta y CambiarContrasena
    ├── carteras/
    │   ├── Cartera.kt
    │   ├── data/                  # CarterasApi, CarterasRepository(+Impl), CarterasDtos
    │   └── ui/                    # Carteras y NuevaCartera
    └── (las demás features se crean cuando se trabajen)
```

Cada pantalla se resuelve con **dos archivos** dentro de `ui/`:

- `XxxViewModel.kt`: `XxxUiState`, `XxxEvento` y `XxxViewModel`.
- `XxxScreen.kt`: `XxxScreen` (conectada) y `XxxContenido` (sin ViewModel).

### Contrato de una pantalla

Todas las pantallas siguen la misma forma, para que una feature nueva se lea igual que las existentes:

- **`XxxViewModel.kt`**: reúne `XxxUiState` (inmutable, con `cargando`, errores y datos), `XxxEvento` y el ViewModel, que expone `state: StateFlow<XxxUiState>` y `eventos: Flow<XxxEvento>` para navegación o avisos de una sola vez.
- Los **eventos** se emiten con `Channel` y se consumen con `LaunchedEffect` en la pantalla; nunca se guardan en el estado.
- **`XxxRepository`**: única puerta a la API y devuelve `Result<T>`; el ViewModel traduce el fallo a mensaje.
- La pantalla **no conoce DTOs ni Retrofit**, solo los modelos de `model/`.
- Estados de UI obligatorios en listados: **cargando**, **error con reintento** (`EstadoError`) y **vacío** (`EstadoVacio`).
- La pantalla se divide en **`XxxScreen`** (conectada a Hilt y al ciclo de vida) y **`XxxContenido`** (sin ViewModel, recibe `state` y callbacks).
- Los formularios reutilizan `core/ui/components/` (`CampoCorreo`, `CampoContrasena`, `BotonPrincipal`, `EncabezadoVolver`, `PantallaFormulario`, `ErrorCampo`).
- Las validaciones, montos y fechas se resuelven con `core/util/`.

## Primeros pasos

1. Abrir la carpeta `movil_FinanzaApp/` en Android Studio (el proyecto base ya está en el repo).
2. Sincronizar Gradle y ejecutar en un emulador o dispositivo.
3. Configurar la URL de la API (`10.0.2.2` apunta al localhost de la máquina en el emulador).

## Reglas

Ver el `AGENTS.md` raíz (ramas, commits y reglas generales).
