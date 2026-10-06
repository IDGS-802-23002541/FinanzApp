# movil_FinanzaApp — App Android (Kotlin + Jetpack Compose)

App móvil oficial de FinanzApp (registro rápido en campo, unión por QR/código y consulta).

## Stack obligatorio

- **Android Studio** con **Kotlin** y **Jetpack Compose**.
- Arquitectura **MVVM**: `ui/` (composables + ViewModels), `data/` (repositorios + Retrofit/Ktor), `domain/`.
- Navegación con Navigation Compose; imágenes desde Cloudinary con Coil.
- Inyección de dependencias: Hilt (si el equipo lo confirma).

## Estructura sugerida

```
movil_FinanzaApp/
└── app/src/main/java/mx/utl/finanzapp/
    ├── ui/           # pantallas Compose + ViewModels por módulo
    ├── data/         # repositorios, API (Retrofit), modelos
    ├── domain/       # casos de uso y modelos de negocio
    └── di/           # módulos de Hilt
```

## Primeros pasos

1. Abrir la carpeta `movil_FinanzaApp/` en Android Studio (el proyecto base ya está en el repo).
2. Sincronizar Gradle y ejecutar en un emulador o dispositivo.
3. Configurar la URL de la API (`10.0.2.2` apunta al localhost de la máquina en el emulador).

## Reglas

Ver el `AGENTS.md` raíz (ramas, commits y reglas generales).
