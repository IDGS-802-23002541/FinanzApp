# Logo de FinanzApp

Aquí viven los archivos de la marca. La aplicación los lee desde `/marca/…`,
así que **no hay que tocar código**: basta con dejar los archivos con estos
nombres y medidas.

| Archivo | Cuándo se usa | Fondo | Alto renderizado |
| --- | --- | --- | --- |
| `logo-color.svg` | Sidebar del panel, barra superior en móvil | claro | 26–30 px |
| `logo-blanco.svg` | Header y footer de la landing, panel de Login/Registro | petróleo | 26–32 px |
| `logo-color-completo.svg` | Uso externo (correo, documentación, PDF) | claro | libre |
| `logo-negro.svg` *(pendiente)* | PDF e impresión en blanco y negro | blanco | — |

## Estado

`logo-color.svg`, `logo-blanco.svg` y `logo-color-completo.svg` ya están
integrados. Solo falta la versión negra para impresión; mientras no exista, la
aplicación muestra la marca de respaldo y nada se rompe.

## Composición

Los archivos `logo-color.svg` y `logo-blanco.svg` son **solo el símbolo**
(cartera con monedas). El nombre "FinanzApp" lo agrega el componente
`src/components/ui/Logo.jsx` con la tipografía de la interfaz, así hereda el
color del fondo (blanco sobre petróleo, petróleo sobre claro) y se ve igual en
modo oscuro. Por eso se usa `<Logo conTexto />`.

Si en el futuro entregan un logo que ya incluya el wordmark, quita `conTexto`
en `SideBar`, `PanelLayout`, `Landing` y `AuthLayout`.

## Favicon

`index.html` apunta a `/favicon.svg`. Para no dejar un 404, el símbolo se sube
**sobrescribiendo** `public/favicon.svg`; no hace falta cambiar el HTML.

## Color

El logo usa un amarillo propio (`#F4C430` / `#F9D857`) que **no forma parte de
la paleta de la interfaz**: es color de marca y no debe reutilizarse en
botones, estados ni gráficas.
