import { createTheme } from '@mui/material/styles';

/** Escala de color de marca (misma que el prototipo Angular). */
export const BRAND: Record<number, string> = {
  50: '#edfbf3',
  100: '#d3f5e1',
  200: '#a9eac6',
  300: '#74d8a5',
  400: '#3fbe82',
  500: '#1da368',
  600: '#108354',
  700: '#0d6945',
  800: '#0d5439',
  900: '#0b4530',
  950: '#04271b',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND[600],
      light: BRAND[400],
      dark: BRAND[700],
      contrastText: '#ffffff',
    },
    error: { main: '#e11d48' },
    success: { main: BRAND[600] },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.17rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 600, textTransform: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#0f172a', fontSize: 12, fontWeight: 600 },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
  },
});
