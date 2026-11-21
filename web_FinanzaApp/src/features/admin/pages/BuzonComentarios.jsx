import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { archivarComentario, listarComentarios } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'
import { IconoPapelera } from '../../../components/ui/Iconos.jsx'

const POR_PAGINA = 10

const ESTADOS = {
  PENDIENTE: 'Pendiente',
  ATENDIDO: 'Atendido',
  ARCHIVADO: 'Archivado',
}

function BuzonComentarios() {
  const [comentarios, setComentarios] = useState([])
  const [paginacion, setPaginacion] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)
  const [porArchivar, setPorArchivar] = useState(null)
  const [archivando, setArchivando] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await listarComentarios({
          pagina,
          porPagina: POR_PAGINA,
        })
        if (!vigente) return

        // Al archivar el último de la página, retrocede una para no quedar vacío.
        if (datos.comentarios.length === 0 && pagina > 1) {
          setPagina((actual) => actual - 1)
          return
        }
        setComentarios(datos.comentarios)
        setPaginacion(datos.paginacion)
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
  }, [pagina, recarga])

  const archivar = async () => {
    setArchivando(true)
    setError('')
    try {
      await archivarComentario(porArchivar.idComentario)
      setPorArchivar(null)
      setRecarga((n) => n + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setArchivando(false)
    }
  }

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
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={ESTADOS[comentario.estado] ?? comentario.estado}
                    size="small"
                    sx={{
                      backgroundColor: 'var(--color-superficie-suave)',
                      color: 'var(--color-texto-secundario)',
                      fontWeight: 700,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-texto-terciario)' }}
                  >
                    {formatearFecha(comentario.fechaCreacion)}
                  </Typography>
                </Stack>
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

              <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                <Button size="small" onClick={() => setSeleccionado(comentario)}>
                  Ver completo
                </Button>
                <Tooltip title="Archivar comentario">
                  <IconButton
                    size="small"
                    onClick={() => setPorArchivar(comentario)}
                    aria-label={`Archivar comentario de ${comentario.nombre}`}
                    sx={{ color: 'var(--color-texto-terciario)' }}
                  >
                    <IconoPapelera />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {paginacion && paginacion.totalPaginas > 1 && (
        <Pagination
          count={paginacion.totalPaginas}
          page={pagina}
          onChange={(_evento, valor) => setPagina(valor)}
          color="primary"
          sx={{ alignSelf: 'center' }}
        />
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

      <Dialog open={Boolean(porArchivar)} onClose={() => setPorArchivar(null)}>
        <DialogTitle>Archivar comentario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas archivar el comentario de {porArchivar?.nombre}? Dejará de
            mostrarse en el buzón, pero se conservará el registro.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPorArchivar(null)} disabled={archivando}>
            Cancelar
          </Button>
          <Button
            onClick={archivar}
            color="error"
            variant="contained"
            disabled={archivando}
          >
            {archivando ? 'Archivando…' : 'Archivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default BuzonComentarios
