import { useLayoutEffect, useState } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { ThemeContext } from './ThemeContext.js'
import { crearTemaMui } from '../styles/temaMui.js'

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro')
  const [temaMui, setTemaMui] = useState(() => crearTemaMui())

  useLayoutEffect(() => {
    document.documentElement.dataset.tema = tema
    setTemaMui(crearTemaMui())
  }, [tema])

  const alternarTema = () => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'))
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
