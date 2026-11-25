import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

export default function Revelar({ children, delay = 0, distancia = 24, sx, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || typeof IntersectionObserver === 'undefined') return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : `translateY(${distancia}px)`,
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        // Solo mientras falta revelarse: mantenerlo siempre cuesta memoria en móvil.
        willChange: visible ? 'auto' : 'opacity, transform',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
