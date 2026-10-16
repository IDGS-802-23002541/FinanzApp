import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro')

  useEffect(() => {
    document.documentElement.dataset.tema = tema
  }, [tema])

  const alternarTema = () => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'))
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}
