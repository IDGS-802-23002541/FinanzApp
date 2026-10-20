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
      fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingBlock: 10, paddingInline: 20 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: color('superficie'),
            borderRadius: 10,
          },
          notchedOutline: { borderColor: color('borde') },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: color('texto-secundario') } },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
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
