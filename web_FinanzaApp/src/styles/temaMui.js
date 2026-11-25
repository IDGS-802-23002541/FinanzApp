import { createTheme } from '@mui/material/styles'

// Tokens de color que el tema necesita. Se leen de src/styles/tema.css para no
// duplicar la paleta en JS.
const TOKENS = [
  'primario',
  'sobre-primario',
  'secundario',
  'secundario-texto',
  'acento',
  'exito',
  'alerta',
  'error',
  'info',
  'fondo',
  'superficie',
  'texto',
  'texto-secundario',
  'texto-terciario',
  'borde',
]

const leerTokens = (elemento) => {
  const estilos = getComputedStyle(elemento)
  const valores = {}
  TOKENS.forEach((nombre) => {
    valores[nombre] = estilos.getPropertyValue(`--color-${nombre}`).trim()
  })
  return valores
}

function construirTema(valores, esOscuro) {
  const color = (nombre) => valores[nombre]

  return createTheme({
    palette: {
      mode: esOscuro ? 'dark' : 'light',
      primary: {
        main: color('primario'),
        contrastText: color('sobre-primario'),
      },
      secondary: {
        // El tono de marca (#C65D45) no alcanza AA con texto blanco; este es su
        // equivalente para botones y texto: --color-secundario-texto.
        main: color('secundario-texto'),
        contrastText: color('sobre-primario'),
      },
      success: { main: color('exito') },
      warning: { main: color('alerta') },
      error: { main: color('error') },
      info: { main: color('info') },
      background: {
        default: color('fondo'),
        paper: color('superficie'),
      },
      text: {
        primary: color('texto'),
        secondary: color('texto-secundario'),
        disabled: color('texto-terciario'),
      },
      divider: color('borde'),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontSize: '1.75rem',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 800,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 800,
        lineHeight: 1.3,
      },
      subtitle1: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9375rem',
      },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 'var(--radio-md)',
            minHeight: 'var(--altura-control-md)',
            paddingInline: 20,
          },
          sizeSmall: {
            minHeight: 'var(--altura-control-sm)',
            paddingInline: 12,
            fontSize: '0.875rem',
          },
          sizeLarge: {
            minHeight: 'var(--altura-control-lg)',
            paddingInline: 28,
            fontSize: '1rem',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radio-md)',
            width: 'var(--altura-control-sm)',
            height: 'var(--altura-control-sm)',
          },
          sizeSmall: { width: 28, height: 28 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            // Variables CSS y no valores calculados: así un contenedor con
            // .tema-claro (la landing) usa siempre los tonos claros.
            backgroundColor: 'var(--color-superficie)',
            borderRadius: 'var(--radio-md)',
            minHeight: 'var(--altura-control-md)',
          },
          sizeSmall: { minHeight: 'var(--altura-control-sm)' },
          notchedOutline: { borderColor: 'var(--color-borde)' },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: 'var(--color-texto-secundario)' } },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: {
          root: { fontWeight: 600, color: 'var(--color-primario)' },
        },
      },
      // Cada estado se distingue por la barra lateral y el ícono, no por un
      // fondo de color que separe en exceso del resto de la interfaz.
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radio-md)',
            alignItems: 'center',
            paddingBlock: 10,
            backgroundColor: 'var(--color-superficie)',
            color: 'var(--color-texto)',
            border: '1px solid var(--color-borde)',
            borderLeftWidth: 4,
            '& .MuiAlert-icon': { color: 'inherit', opacity: 1, fontSize: 20 },
            '& .MuiAlert-message': { paddingBlock: 0 },
          },
        },
        variants: [
          {
            props: { severity: 'success' },
            style: { borderLeftColor: 'var(--color-exito)' },
          },
          {
            props: { severity: 'info' },
            style: {
              borderLeftColor: 'var(--color-info)',
              '& .MuiAlert-icon': { color: 'var(--color-info)' },
            },
          },
          {
            props: { severity: 'warning' },
            style: {
              borderLeftColor: 'var(--color-alerta)',
              '& .MuiAlert-icon': { color: 'var(--color-alerta)' },
            },
          },
          {
            props: { severity: 'error' },
            style: {
              borderLeftColor: 'var(--color-error)',
              '& .MuiAlert-icon': { color: 'var(--color-error)' },
            },
          },
        ],
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 'var(--radio-pill)', fontWeight: 600 },
          sizeSmall: { height: 24, fontSize: '0.75rem' },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 'var(--altura-control-md)' },
          indicator: { height: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            minHeight: 'var(--altura-control-md)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--color-primario)',
            color: 'var(--color-sobre-primario)',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radio-sm)',
            paddingBlock: 6,
            paddingInline: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: color('fondo'), color: color('texto') },
          '*:focus-visible': {
            outline: `2px solid ${color('acento')}`,
            outlineOffset: 2,
          },
        },
      },
    },
  })
}

export function crearTemaMui() {
  return construirTema(
    leerTokens(document.documentElement),
    document.documentElement.dataset.tema === 'oscuro',
  )
}

// La landing y las vistas públicas no tienen modo oscuro: se arma un tema claro
// leyendo los tokens de un contenedor .tema-claro, aunque la cuenta esté oscura.
export function crearTemaClaro() {
  const sonda = document.createElement('div')
  sonda.className = 'tema-claro'
  sonda.setAttribute('aria-hidden', 'true')
  sonda.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'
  document.body.appendChild(sonda)

  const valores = leerTokens(sonda)
  sonda.remove()

  return construirTema(valores, false)
}
