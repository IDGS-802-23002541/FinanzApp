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
| `--color-texto-secundario` | `#5B7278` | Descripciones y texto de apoyo |
| `--color-texto-terciario` | `#88979A` | Metadatos, placeholders y ayudas |
| `--color-fondo` | `#F8F3EF` | Fondo general |
| `--color-superficie` | `#FFFFFF` | Tarjetas y contenedores |
| `--color-superficie-suave` | `#F1EAE5` | Filas alternas, tablas y secciones |
| `--color-primario` | `#173B45` | Botón primario y enlaces |
| `--color-sobre-primario` | `#FFFFFF` | Texto e íconos sobre el primario |
| `--color-secundario` | `#C65D45` | Botón secundario y acentos |
| `--color-acento` | `#E7A28E` | Detalles, badges e íconos |
| `--color-borde` | `#E3D8D1` | Bordes de tarjetas e inputs |
| `--color-borde-fuerte` | `#D3C4BB` | Bordes de énfasis y hover |
| `--color-exito` | `#173B45` | Confirmaciones e ingresos |
| `--color-alerta` | `#C65D45` | Advertencias |
| `--color-error` | `#A94832` | Errores, gastos y acciones destructivas |
| `--color-info` | `#E7A28E` | Mensajes informativos |
| `--color-seleccion` | `#F7E0D8` | Fondo del enlace activo del menú lateral |
| `--color-seleccion-texto` | `#A94832` | Texto del enlace activo del menú lateral |

Los tonos `#5B7278`, `#88979A`, `#E3D8D1`, `#D3C4BB`, `#F1EAE5` y `#A94832` son
derivados de la paleta principal para texto, bordes y estados. No son colores de marca.

## 3. Reglas de uso

1. **No usar hex directamente en componentes.** Usa `var(--color-*)` o los tokens del
   tema. Si falta un token, se agrega en `tema.css` y se documenta aquí.
2. **Petróleo es el color de texto y acción principal.** No lo sustituyas por negro.
3. **Terracota es acento, no fondo de páginas completas.** Úsalo en botones secundarios,
   chips, categorías y series de gráficas.
4. **Coral es detalle.** Úsalo en íconos, estrellas, badges y fondos suaves; no en
   bloques grandes con texto blanco.
5. **Estados:**
   - Éxito / ingreso: Petróleo.
   - Alerta: Terracota.
   - Error / gasto: `#A94832`.
   - Información: Coral.
6. **Gráficas:** usa el orden Petróleo → Terracota → Coral → tonos neutros. No agregues
   verdes, azules, morados ni rosas de la paleta anterior.
7. **Sombras:** negro con opacidad baja (`0 1px 3px rgba(0,0,0,.08)`); no uses colores
   de marca para sombras.
8. **Modo oscuro:** usa la adaptación de la sección 5; no inviertas los colores a mano.

## 4. Contraste y accesibilidad

Combinaciones permitidas para texto:

| Combinación | Nivel |
| --- | --- |
| Petróleo sobre Fondo o Blanco | AAA |
| Blanco sobre Petróleo | AAA |
| Petróleo sobre Coral | AA |
| Blanco sobre Terracota | AA en textos grandes; evitar en textos menores a 14 px |
| Fondo sobre Terracota | AA en textos grandes |

Evita:

- Coral sobre Terracota (contraste insuficiente).
- Blanco sobre Coral para texto pequeño.
- Texto gris claro (`#B5BCBC` o similar) sobre Fondo.

## 5. Modo oscuro

El modo oscuro es una adaptación de la misma paleta; no introduce colores de marca nuevos.

| Token CSS | Valor | Uso |
| --- | --- | --- |
| `--color-fondo` | `#0F2A32` | Fondo general |
| `--color-superficie` | `#173B45` | Tarjetas y contenedores |
| `--color-superficie-suave` | `#1F4A55` | Filas alternas |
| `--color-texto` | `#F8F3EF` | Texto principal |
| `--color-texto-secundario` | `#C9D6D8` | Texto de apoyo |
| `--color-texto-terciario` | `#93A7AB` | Metadatos |
| `--color-primario` | `#E7A28E` | Acción principal |
| `--color-sobre-primario` | `#173B45` | Texto sobre la acción principal |
| `--color-borde` | `#2A5560` | Bordes |
| `--color-borde-fuerte` | `#3B6B76` | Énfasis y hover |
| `--color-exito` | `#8FD1B8` | Confirmaciones en oscuro |
| `--color-error` | `#E08A73` | Errores en oscuro |
| `--color-seleccion` | `#1F4A55` | Fondo del enlace activo del menú lateral |
| `--color-seleccion-texto` | `#E7A28E` | Texto del enlace activo del menú lateral |

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

## 7. Ejemplos

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

## 8. Checklist para revisar una pantalla

- [ ] Todos los colores salen de `var(--color-*)`.
- [ ] El texto principal usa Petróleo sobre Fondo o Blanco.
- [ ] Los botones primarios son Petróleo con texto Blanco.
- [ ] Terracota y Coral se usan como acentos, no como fondos dominantes.
- [ ] Los estados de éxito, alerta, error e información usan sus tokens.
- [ ] No hay verdes, azules, morados ni rosas de la paleta anterior.
- [ ] La pantalla funciona en modo claro y oscuro.
