import { useState } from 'react'
import { Box, Typography } from '@mui/material'

// Archivos servidos desde public/marca/. Basta con reemplazarlos por el logo
// definitivo: no hace falta tocar código. Ver public/marca/README.md.
const ARCHIVOS = {
  color: '/marca/logo-color.svg',
  blanco: '/marca/logo-blanco.svg',
  negro: '/marca/logo-negro.svg',
}

// Marca de respaldo (círculo con la inicial) mientras el logo no exista o el
// archivo no cargue. Usa los tonos fuente para no cambiar con el tema.
function MarcaRespaldo({ variante, alto }) {
  const esBlanco = variante === 'blanco'

  return (
    <Box
      sx={{
        width: alto,
        height: alto,
        borderRadius: '50%',
        backgroundColor: esBlanco ? 'var(--paleta-blanco)' : 'var(--paleta-petroleo)',
        color: esBlanco ? 'var(--paleta-petroleo)' : 'var(--paleta-blanco)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: Math.round(alto * 0.42),
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      F
    </Box>
  )
}

// Logo de FinanzApp. `variante` elige el archivo según el fondo (color para
// fondos claros, blanco para petróleo, negro para impresión o PDF).
// `conTexto` añade el nombre junto al símbolo: quítalo si el archivo final ya
// incluye el wordmark.
export default function Logo({ variante = 'color', alto = 36, conTexto = false }) {
  const [cargada, setCargada] = useState(false)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      {/* La marca de respaldo se ve hasta que el archivo esté disponible, así
          nunca aparece el ícono de imagen rota. */}
      {!cargada && <MarcaRespaldo variante={variante} alto={alto} />}

      <Box
        component="img"
        src={ARCHIVOS[variante]}
        alt=""
        onLoad={() => setCargada(true)}
        onError={() => setCargada(false)}
        sx={{
          height: alto,
          width: 'auto',
          display: cargada ? 'block' : 'none',
        }}
      />

      {conTexto && (
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
          FinanzApp
        </Typography>
      )}
    </Box>
  )
}
