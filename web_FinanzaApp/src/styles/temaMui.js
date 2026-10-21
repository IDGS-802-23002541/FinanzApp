import { createTheme } from '@mui/material/styles'

// Lee los tokens de src/styles/tema.css para no duplicar la paleta en JS.
const leerToken = (nombre) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${nombre}`).trim()

export function crearTemaMui() {
  const color = (nombre) => leerToken(nombre)
  const esOscuro = document.documentElement.dataset.tema === 'oscuro'

  return createTheme({
    palette: {
      mode: esOscuro ? 'dark' : 'light',
      primary: {
        main: color('primario'),
        contrastText: color('sobre-primario'),
      },
      secondary: {
        main: color('secundario'),
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
        lineHeight: 1.5,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 800,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
      },
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
            borderRadius: 12,
            minHeight: 50,
            paddingInline: 20,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: color('superficie'),
            borderRadius: 12,
            minHeight: 48,
          },
          notchedOutline: { borderColor: color('borde') },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: color('texto-secundario') } },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: {
          root: { fontWeight: 600, color: color('primario') },
        },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: color('fondo'), color: color('texto') },
        },
      },
    },
  })
}
