import { useState } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { ThemeContext } from './ThemeContext.js'
import { crearTemaMui } from '../styles/temaMui.js'

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro')
  const [temaMui, setTemaMui] = useState(() => crearTemaMui())

  const alternarTema = () => {
    const siguiente = tema === 'claro' ? 'oscuro' : 'claro'

    // El tema de MUI se construye después de aplicar los tokens del modo elegido.
    document.documentElement.dataset.tema = siguiente
    setTema(siguiente)
    setTemaMui(crearTemaMui())
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      <MuiThemeProvider theme={temaMui}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
