# Video de demostración

La sección "Así se siente tener tus cuentas en orden" de la landing muestra el
video de cómo funciona FinanzApp.

## Qué subir

| Archivo | Uso | Recomendación |
| --- | --- | --- |
| `demo-finanzapp.mp4` | Video principal | H.264, 1280×720, 20–40 s, menos de 8 MB |
| `demo-finanzapp-poster.jpg` | Imagen previa (se ve antes de reproducir) | 1280×720, la misma proporción |

## Estado actual

Mientras el equipo no entregue el video propio, la landing usa un material
temporal alojado en Pexels (`Landing.jsx`, constantes `VIDEO_DEMO` y
`POSTER_DEMO`). Al subir los archivos, cambia esas dos constantes por:

```js
const VIDEO_DEMO = '/media/demo-finanzapp.mp4'
const POSTER_DEMO = '/media/demo-finanzapp-poster.jpg'
```

No se sube el video al repositorio del backend ni se enlaza desde Cloudinary:
son archivos estáticos de la web.
