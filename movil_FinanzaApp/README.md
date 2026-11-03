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
│   ├── ui/                        # componentes, tema, menú lateral y pantalla pendiente
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

### Por qué se reestructuró

La estructura anterior creaba una carpeta por capa (`data/dto/`, `model/`, `ui/login/`, `ui/cuenta/`…) y hasta **cuatro archivos por pantalla** (`Screen`, `UiState`, `Evento`, `ViewModel`). Para el tamaño actual del módulo eso generaba ≈33 carpetas y ≈39 archivos en `features`, con muchos archivos de 5–10 líneas y saltos constantes entre carpetas.

Se aplanó a una organización por feature:

| Antes | Ahora |
| --- | --- |
| `data/`, `data/dto/`, `model/`, `ui/<pantalla>/` | `data/` + `ui/` (y el modelo en la raíz de la feature si es compartido) |
| 4 archivos por pantalla | 2 archivos: `XxxViewModel.kt` (estado + evento + ViewModel) y `XxxScreen.kt` (pantalla + contenido) |
| 8 archivos de DTO de auth | 1 archivo `AuthDtos.kt` |
| 3 módulos de Hilt | 1 archivo `Modulos.kt` |
| Carpetas de features vacías | se crean cuando la feature empieza |

El objetivo era **menos carpetas y archivos, no menos arquitectura**: se conservan MVVM, Repository, `Result`, Hilt, `StateFlow`/`Channel`, la separación `Screen`/`Contenido` y los tests. No se agregaron `UseCase`, `Factory`, `Adapter` con interfaz, MVI ni `BaseViewModel`; tampoco se eliminaron dependencias.

El costo es que algunos archivos son más largos. Si una pantalla crece demasiado, se vuelve a dividir; hoy no se justificaba.

## Navegación

El menú lateral vive en `core/navigation/FinanzAppNavHost.kt` (`ModalNavigationDrawer`) y está disponible en **todas las secciones autenticadas**. Se abre con el botón `☰` de cada encabezado y contiene: Carteras, Reportes, Soporte, Mi cuenta, Modo oscuro/claro y Cerrar sesión. En Login y Recuperar no aparece.

**Por qué:** el encabezado anterior mezclaba título, botón de tema y tres iconos; en pantallas angostas “Carteras” se partía en dos líneas y la descripción quedaba en una columna mínima. Al mover esos accesos al menú, el encabezado conserva solo `☰`, título y la acción principal.

Reportes y Soporte todavía no tienen módulo: muestran `core/ui/PantallaPendiente.kt` con “Próximamente”. La navegación desde el menú usa `popUpTo(Rutas.Carteras)` para no acumular secciones.

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
