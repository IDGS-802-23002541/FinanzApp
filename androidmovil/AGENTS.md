# Reglas de `androidmovil` (móvil)

- Stack: **Kotlin + Jetpack Compose**; arquitectura **MVVM**.
- Los composables no llaman a la API: toda la lógica pasa por ViewModels y repositorios.
- Red contra la API Flask (Retrofit/Ktor); imágenes con Coil desde Cloudinary.
- Navegación con Navigation Compose; una pantalla por archivo dentro de `ui/<módulo>/`.
- No agregar dependencias nuevas sin acordarlo con el equipo.
- Antes de terminar: compila en Android Studio sin errores y sin warnings nuevos.
- Commits con el estándar del `AGENTS.md` raíz en tu rama (`DB/VR/AC/DR <tipo>: …`).
