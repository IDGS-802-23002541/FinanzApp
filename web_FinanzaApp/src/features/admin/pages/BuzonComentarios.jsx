import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { listarComentarios } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'

function BuzonComentarios() {
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await listarComentarios()
        if (vigente) setComentarios(datos ?? [])
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
  }, [])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Buzón de comentarios</Typography>
        <Typography sx={{ mt: 0.5, color: 'var(--color-texto-secundario)' }}>
          Comentarios enviados desde la landing.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {cargando ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : comentarios.length === 0 ? (
        <Alert severity="info">
          Todavía no hay comentarios enviados desde la landing.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {comentarios.map((comentario) => (
            <Paper
              key={comentario.idComentario}
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid var(--color-borde)',
                borderRadius: '12px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {comentario.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-texto-terciario)' }}
                  >
                    {comentario.correo}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--color-texto-terciario)' }}
                >
                  {formatearFecha(comentario.fechaCreacion)}
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1,
                  color: 'var(--color-texto-secundario)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {comentario.comentario}
              </Typography>

              <Button
                size="small"
                onClick={() => setSeleccionado(comentario)}
                sx={{ mt: 1 }}
              >
                Ver completo
              </Button>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={Boolean(seleccionado)}
        onClose={() => setSeleccionado(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{seleccionado?.nombre}</DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: 'var(--color-texto-terciario)' }}
          >
            {seleccionado?.correo} ·{' '}
            {seleccionado && formatearFecha(seleccionado.fechaCreacion)}
          </Typography>
          <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
            {seleccionado?.comentario}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeleccionado(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default BuzonComentarios
