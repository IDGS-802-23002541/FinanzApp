import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import QRCode from 'react-qr-code'
import { generarInvitacion, obtenerInvitacion } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'

function InvitacionQR() {
  const { cartera, id } = useOutletContext()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [generando, setGenerando] = useState(false)

  const esPropietario = cartera.rol === 'Propietario'

  useEffect(() => {
    if (!esPropietario) {
      setCargando(false)
      return undefined
    }

    let vigente = true
    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const respuesta = await obtenerInvitacion(id)
        if (vigente) setDatos(respuesta)
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [id, esPropietario])

  const generar = async () => {
    setGenerando(true)
    setError('')
    try {
      await generarInvitacion(id)
      const respuesta = await obtenerInvitacion(id)
      setDatos(respuesta)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerando(false)
    }
  }

  if (!esPropietario) {
    return (
      <Alert severity="info">
        Solo el propietario puede ver o generar la invitación.
      </Alert>
    )
  }

  if (cargando) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const invitacion = datos?.invitacion
  const ingresos = datos?.ingresos ?? []

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Invitación QR
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-texto-secundario)' }}
            >
              Comparte el QR o la clave de 8 caracteres.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={generar}
            disabled={generando || cartera.estatus !== 'Activa'}
          >
            {generando
              ? 'Generando…'
              : invitacion
                ? 'Generar nueva'
                : 'Generar invitación'}
          </Button>
        </Box>

        {invitacion ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'auto 1fr' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 2,
                justifySelf: 'center',
              }}
            >
              <QRCode value={invitacion.qrContenido} size={180} />
            </Box>

            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-texto-secundario)' }}
              >
                Clave
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.2rem',
                }}
              >
                {invitacion.codigo}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-texto-terciario)' }}
              >
                Vence: {formatearFecha(invitacion.fechaExpiracion)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-texto-terciario)' }}
              >
                Estado: {invitacion.estado}
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Alert severity="info">Aún no hay una invitación activa.</Alert>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Bitácora de ingresos
          </Typography>
          {ingresos.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-texto-secundario)' }}
            >
              Todavía no se ha unido nadie.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {ingresos.map((persona) => (
                <Box
                  key={persona.idUsuario}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                >
                  <Typography>{persona.nombre}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-texto-terciario)' }}
                  >
                    {formatearFecha(persona.fechaUnion)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default InvitacionQR
