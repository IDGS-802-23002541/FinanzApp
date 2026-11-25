import { Box, Button, ButtonBase, IconButton, Stack, Typography } from '@mui/material'
import {
  IconoCalendario,
  IconoFlechaDerecha,
  IconoLapiz,
  IconoPapelera,
} from '../../../components/ui/Iconos.jsx'
import { aparienciaCategoria } from '../aparienciaCategoria.js'

// La colaboración se distingue de lo propio con el color de selección (CA2).
const ESTILO_ROL = {
  Propietario: {
    backgroundColor: 'var(--color-superficie-suave)',
    color: 'var(--color-texto-secundario)',
  },
  Colaborador: {
    backgroundColor: 'var(--color-seleccion)',
    color: 'var(--color-seleccion-texto)',
  },
}

function Etiqueta({ children, sx }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.5,
        borderRadius: 'var(--radio-pill)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        lineHeight: '16.5px',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

// Tarjeta de una cartera del dashboard (HU-03.2): nombre, tipo, estatus, mi rol
// y acciones. El clic completo es la HU-04.1.
function TarjetaCartera({
  nombre,
  categoria,
  descripcion,
  rol,
  estatus,
  periodo,
  onAbrir,
  onEditar,
  onInactivar,
}) {
  const { fondo, icono, Icono } = aparienciaCategoria(categoria)
  // Solo el propietario administra una cartera activa (CA5 de HU-04.5).
  const puedeAdministrar = rol === 'Propietario' && estatus === 'Activa'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: 'var(--radio-lg)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ height: '6px', backgroundColor: fondo }} />

      {/* CA4 de HU-03.2: el cuerpo de la tarjeta abre el detalle. */}
      <ButtonBase
        onClick={onAbrir}
        aria-label={`Abrir la cartera ${nombre}`}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
          p: 2.5,
          pb: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 'var(--radio-pill)',
                backgroundColor: fondo,
                color: icono,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icono sx={{ fontSize: 20 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: 'var(--color-texto)',
                }}
              >
                {nombre}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.75,
                }}
              >
                <Etiqueta
                  sx={{
                    backgroundColor: 'var(--color-superficie-suave)',
                    color: 'var(--color-texto-secundario)',
                  }}
                >
                  {categoria}
                </Etiqueta>
                <Etiqueta sx={ESTILO_ROL[rol]}>{rol}</Etiqueta>
                <Etiqueta
                  sx={{
                    border: '1px solid var(--color-exito)',
                    color: 'var(--color-exito)',
                  }}
                >
                  {estatus}
                </Etiqueta>
              </Box>

              {periodo && (
                <Box sx={{ mt: 1, display: 'flex' }}>
                  <Etiqueta
                    sx={{
                      border: '1px solid var(--color-borde)',
                      color: 'var(--color-texto-secundario)',
                      fontWeight: 600,
                      gap: 0.75,
                    }}
                  >
                    <IconoCalendario sx={{ fontSize: 13 }} />
                    {periodo}
                  </Etiqueta>
                </Box>
              )}
            </Box>
          </Stack>

        {descripcion && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: '0.875rem',
              lineHeight: '21px',
              color: 'var(--color-texto-secundario)',
            }}
          >
            {descripcion}
          </Typography>
        )}
      </ButtonBase>

      <Box
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTop: '0.8px solid var(--color-superficie-suave)',
        }}
      >
          <Button
            variant="contained"
            startIcon={<IconoFlechaDerecha sx={{ fontSize: 14 }} />}
            onClick={onAbrir}
            sx={{
              flex: 1,
              borderRadius: 'var(--radio-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'var(--color-primario)',
              color: 'var(--color-sobre-primario)',
            }}
          >
            Abrir cartera
          </Button>

          {puedeAdministrar && (
            <>
              <IconButton
                size="small"
                aria-label="Editar cartera"
                onClick={onEditar}
                sx={{
                  border: '1px solid var(--color-borde-fuerte)',
                  color: 'var(--color-texto-secundario)',
                }}
              >
                <IconoLapiz sx={{ fontSize: 14 }} />
              </IconButton>

              <IconButton
                size="small"
                aria-label="Eliminar cartera"
                onClick={onInactivar}
                sx={{
                  border: '1px solid var(--color-acento)',
                  color: 'var(--color-alerta)',
                }}
              >
                <IconoPapelera sx={{ fontSize: 14 }} />
              </IconButton>
            </>
          )}
        </Box>
    </Box>
  )
}

export default TarjetaCartera

