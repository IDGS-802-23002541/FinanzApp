import { useState } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { ThemeContext } from './ThemeContext.js'
import { crearTemaMui } from '../styles/temaMui.js'

export function ThemeProvider({ children }) {
  //Toma el tema guardado en localStorage o usa 'claro' por defecto
  const [tema, setTema] = useState(() => localStorage.getItem('tema') ?? 'claro')
  const [temaMui, setTemaMui] = useState(() => crearTemaMui())

  const cambiarTema = (siguiente) => {
    document.documentElement.dataset.tema = siguiente
    localStorage.setItem('tema', siguiente)
    setTema(siguiente)
    setTemaMui(crearTemaMui())
  }

  return (
    <ThemeContext.Provider value={{ tema, cambiarTema }}>
      <MuiThemeProvider theme={temaMui}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
