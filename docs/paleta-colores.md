# Paleta de colores — FinanzApp

Documento maestro de color para el diseño y el front web. Toda pantalla, componente o
gráfica debe usar estos tokens; **no se escriben códigos hex sueltos en los componentes**.

- **Fuente de verdad en Figma:** archivo **FinanzApp**, colección de variables
  `FinanzApp · Paleta` (modo `Light`).
- **Fuente de verdad en código:** `web_FinanzaApp/src/styles/tema.css`.

## 1. Colores principales

| Token | Hex | RGB | Uso principal |
| --- | --- | --- | --- |
| Petróleo | `#173B45` | `23, 59, 69` | Marca, texto principal, botones primarios, navegación y footer |
| Terracota | `#C65D45` | `198, 93, 69` | Acciones secundarias, categorías, alertas y acentos de gráficas |
| Coral | `#E7A28E` | `231, 162, 142` | Acento suave, íconos, estrellas, badges y fondos de apoyo |
| Fondo | `#F8F3EF` | `248, 243, 239` | Fondo general de la app y del canvas |
| Blanco | `#FFFFFF` | `255, 255, 255` | Tarjetas, superficies y texto sobre fondos oscuros |

### Proporción recomendada

- **60%** Fondo y Blanco: superficies y áreas de respiro.
- **25%** Petróleo: texto, navegación y acciones principales.
- **10%** Terracota: acentos, categorías y estados.
- **5%** Coral: detalles, íconos y badges.

## 2. Tokens semánticos

| Token CSS | Valor | Uso |
| --- | --- | --- |
| `--color-texto` | `#173B45` | Texto principal y títulos |
| `--color-texto-secundario` | `#46626A` | Descripciones y texto de apoyo |
| `--color-texto-terciario` | `#5D7176` | Metadatos, ayudas y etiquetas |
| `--color-fondo` | `#F8F3EF` | Fondo general |
| `--color-superficie` | `#FFFFFF` | Tarjetas y contenedores |
| `--color-superficie-suave` | `#F1EAE5` | Filas alternas, tablas y secciones |
| `--color-primario` | `#173B45` | Botón primario y enlaces |
| `--color-sobre-primario` | `#FFFFFF` | Texto e íconos sobre el primario |
| `--color-secundario` | `#C65D45` | Rellenos, series y acentos |
| `--color-secundario-texto` | `#B04B33` | Terracota cuando es texto o borde de texto |
| `--color-acento` | `#E7A28E` | Detalles, badges e íconos |
| `--color-borde` | `#E3D8D1` | Bordes de tarjetas e inputs |
| `--color-borde-fuerte` | `#D3C4BB` | Bordes de énfasis y hover |
| `--color-exito` | `#173B45` | Confirmaciones e ingresos |
| `--color-alerta` | `#C65D45` | Advertencias |
| `--color-error` | `#A94832` | Errores y acciones destructivas |
| `--color-negativo` | `#A94832` | Signo negativo del dinero (gastos) |
| `--color-info` | `#4A7C86` | Mensajes informativos |
| `--color-seleccion` | `#F7E0D8` | Fondo del enlace activo del menú lateral |
| `--color-seleccion-texto` | `#A94832` | Texto del enlace activo del menú lateral |

Los tonos `#46626A`, `#5D7176`, `#E3D8D1`, `#D3C4BB`, `#F1EAE5`, `#B04B33` y `#A94832`
son derivados de la paleta principal para texto, bordes y estados. No son colores
de marca.

**Los tres grises de texto cumplen AA sobre el Fondo** (10.9, 5.9 y 4.66). El valor
anterior de `--color-texto-terciario` (`#88979A`, 2.75) queda prohibido para texto:
solo puede usarse en íconos decorativos o líneas.

### Escala de forma

| Token | Valor | Uso |
| --- | --- | --- |
| `--radio-sm` | `8px` | Etiquetas pequeñas, tooltips |
| `--radio-md` | `12px` | Botones, inputs, menús |
| `--radio-lg` | `16px` | Tarjetas y contenedores |
| `--radio-pill` | `999px` | Chips y segmentados |
| `--altura-control-sm` | `36px` | Acciones dentro de tarjetas o tablas |
| `--altura-control-md` | `44px` | Botones, inputs y pestañas por defecto |
| `--altura-control-lg` | `52px` | Acción principal de una pantalla |

No se escriben tamaños de botón a mano: se usa `size="small"` o el tamaño por
defecto del tema. Un botón nunca baja de 36 px de alto ni de 24 px de lado si es
solo ícono.


## 3. Reglas de uso

1. **No usar hex directamente en componentes.** Usa `var(--color-*)` o los tokens del
   tema. Si falta un token, se agrega en `tema.css` y se documenta aquí.
2. **Petróleo es el color de texto y acción principal.** No lo sustituyas por negro.
3. **Terracota es acento, no fondo de páginas completas.** Úsalo en botones secundarios,
   chips, categorías y series de gráficas. Cuando sea **texto**, usa
   `--color-secundario-texto`: el tono de marca no alcanza AA.
4. **Coral es detalle.** Úsalo en íconos, estrellas, badges y fondos suaves; no en
   bloques grandes con texto blanco.
5. **Estados:**
   - Éxito / ingreso: Petróleo.
   - Alerta: Terracota.
   - Error / gasto: `#A94832` (`--color-error` y `--color-negativo`).
   - Información: `#4A7C86` (`--color-info`), distinto del coral de acento.
6. **Dinero:** ingresos en `--color-primario`, gastos en `--color-negativo`. Los
   importes siempre llevan signo (`+`/`−`), nunca solo color.
7. **Gráficas:** usa el orden Petróleo → Terracota → Coral → tonos neutros. No agregues
   verdes, azules, morados ni rosas de la paleta anterior.
8. **Sombras:** negro con opacidad baja (`0 1px 3px rgba(0,0,0,.08)`); no uses colores
   de marca para sombras.
9. **Modo oscuro:** usa la adaptación de la sección 5; no inviertas los colores a mano.
10. **La landing y las vistas públicas no tienen modo oscuro.** Su contenedor lleva la
    clase `tema-claro`, que vuelve a fijar los tokens claros aunque la cuenta esté en
    oscuro. No los cambies por tokens sensibles al tema.

### Proporción del color (60/30/10)

Se aplica por superficie, no de forma global:

- **Panel:** 60 % Fondo y Blanco · 30 % Petróleo (navegación, títulos, acción
  principal) · 10 % Terracota y Coral. **Un solo acento por pantalla.**
- **Landing:** 60 % Petróleo (bloques de marca) · 30 % Fondo y Blanco · 10 % Coral,
  alternando secciones claras y oscuras.


## 4. Contraste y accesibilidad

Combinaciones permitidas para texto:

| Combinación | Nivel |
| --- | --- |
| Petróleo sobre Fondo o Blanco | AAA (10.9 y 12.0) |
| Blanco sobre Petróleo | AAA (12.0) |
| Petróleo sobre Coral | AA (5.70) |
| `--color-texto-secundario` sobre Fondo | AA (5.93) |
| `--color-texto-terciario` sobre Fondo | AA (4.66) |
| `--color-secundario-texto` sobre Fondo | AA (4.89) |
| Blanco sobre `--color-secundario-texto` | AA (5.38) |
| Blanco sobre Terracota | Solo textos grandes (4.16) |

Evita:

- Terracota `#C65D45` como texto o borde de texto: usa `--color-secundario-texto`.
- Coral sobre Terracota (contraste insuficiente).
- Blanco sobre Coral para texto pequeño.
- `#88979A` sobre Fondo: 2.75, no cumple AA.
- Grises con `opacity` sobre el fondo: cambian el contraste real. Usa el token.


## 5. Modo oscuro

El modo oscuro es una adaptación de la misma paleta; no introduce colores de marca nuevos.

| Token CSS | Valor | Uso |
| --- | --- | --- |
| `--color-fondo` | `#0B2229` | Fondo general |
| `--color-superficie` | `#173B45` | Tarjetas y contenedores |
| `--color-superficie-suave` | `#1F4A55` | Filas alternas |
| `--color-texto` | `#F8F3EF` | Texto principal |
| `--color-texto-secundario` | `#C9D6D8` | Texto de apoyo |
| `--color-texto-terciario` | `#93A7AB` | Metadatos |
| `--color-primario` | `#E7A28E` | Acción principal |
| `--color-sobre-primario` | `#173B45` | Texto sobre la acción principal |
| `--color-secundario-texto` | `#E7A28E` | Terracota como texto |
| `--color-borde` | `#2A5560` | Bordes |
| `--color-borde-fuerte` | `#3B6B76` | Énfasis y hover |
| `--color-exito` | `#8FD1B8` | Confirmaciones en oscuro |
| `--color-error` | `#E08A73` | Errores en oscuro |
| `--color-negativo` | `#E08A73` | Gastos en oscuro |
| `--color-info` | `#8FC1CB` | Mensajes informativos en oscuro |
| `--color-seleccion` | `#1F4A55` | Fondo del enlace activo del menú lateral |
| `--color-seleccion-texto` | `#E7A28E` | Texto del enlace activo del menú lateral |

La marca gráfica (`Logo`, avatares de participantes y franjas de categoría) usa
`--paleta-petroleo` y `--paleta-blanco`, que **no cambian con el tema**: un ícono de
marca nunca debe quedar coral sobre coral.


## 6. Equivalencia con Figma

| Token Figma | Token CSS |
| --- | --- |
| `01 Primario/Petróleo` | `--color-primario` |
| `02 Secundario/Terracota` | `--color-secundario` |
| `03 Acento/Coral` | `--color-acento` |
| `04 Fondo/Fondo` | `--color-fondo` |
| `04 Fondo/Blanco` | `--color-superficie` |
| `05 Texto/Secundario` | `--color-texto-secundario` |
| `05 Texto/Terciario` | `--color-texto-terciario` |
| `06 Borde/Default` | `--color-borde` |
| `06 Borde/Fuerte` | `--color-borde-fuerte` |
| `08 Estado/Error` | `--color-error` |

## 7. Logo

Los archivos de marca viven en `web_FinanzaApp/public/marca/` y se pintan con
`src/components/ui/Logo.jsx` (`variante="color" | "blanco" | "negro"`). El nombre
"FinanzApp" se compone con la tipografía de la interfaz (`conTexto`) para que herede
el color del fondo. Detalle de nombres, medidas y favicon en `public/marca/README.md`.

El logo usa un amarillo propio (`#F4C430`, `#F9D857`). Es **color de marca**, no de
la interfaz: no se reutiliza en botones, estados ni gráficas.

## 8. Ejemplos

```jsx
// Correcto: tokens del tema
<Button sx={{ backgroundColor: 'var(--color-primario)', color: 'var(--color-sobre-primario)' }}>
  Nueva cartera
</Button>

<Chip label="Viaje" sx={{ backgroundColor: 'var(--color-secundario)', color: 'var(--color-sobre-primario)' }} />
```

```jsx
// Incorrecto: hex sueltos y colores fuera de la paleta
<Button sx={{ backgroundColor: '#108354', color: '#fff' }}>Nueva cartera</Button>
<Chip label="Viaje" sx={{ backgroundColor: '#2563EB' }} />
```

## 9. Checklist para revisar una pantalla

- [ ] Todos los colores salen de `var(--color-*)`.
- [ ] El texto principal usa Petróleo sobre Fondo o Blanco.
- [ ] Los botones primarios son Petróleo con texto Blanco.
- [ ] Terracota y Coral se usan como acentos, no como fondos dominantes.
- [ ] El texto de apoyo usa `--color-texto-secundario` o `--color-texto-terciario`
      (nunca `#88979A` ni `opacity`).
- [ ] Los estados de éxito, alerta, error e información usan sus tokens.
- [ ] Ingresos y gastos se distinguen por signo **y** por color (`primario` / `negativo`).
- [ ] Los botones miden 36, 44 o 52 px; ninguno queda aplastado con `minHeight: 0`.
- [ ] No hay verdes, azules, morados ni rosas de la paleta anterior.
- [ ] La pantalla funciona en modo claro y oscuro (salvo la landing, que es siempre clara).

