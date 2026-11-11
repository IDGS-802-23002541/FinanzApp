import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { finalizarCartera } from '../api.js'
import { formatearMonto } from '../../../utils/formato.js'

// Cierre y balance solo aplica a carteras de viaje o evento.
const TIPOS_CERRABLES = ['Viaje', 'Evento']

// Si el detalle no trae balance (por ejemplo al recargar), se arma con el resumen.
function balanceDesdeResumen(cartera) {
  const ingresos = cartera.resumen?.totalIngresos ?? 0
  const gastos = cartera.resumen?.totalGastos ?? 0

  return {
    presupuestoInicial: cartera.presupuestoInicial ?? 0,
    totalIngresos: ingresos,
    totalGastos: gastos,
    balance: ingresos - gastos,
    porCategoria: cartera.series?.gastosPorCategoria ?? [],
    porParticipante: [],
  }
}

function TarjetaBalance({ etiqueta, valor, destacada = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        flex: 1,
        minWidth: 160,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        backgroundColor: destacada
          ? 'var(--color-superficie-suave)'
          : 'var(--color-superficie)',
      }}
    >
      <Typography variant="caption" sx={{ color: 'var(--color-texto-terciario)' }}>
        {etiqueta}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: '1.15rem', fontWeight: 800 }}>
        {formatearMonto(valor)}
      </Typography>
    </Paper>
  )
}

function TablaBalance({ titulo, columnas, filas, vacio }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {titulo}
      </Typography>

      {filas.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 2, color: 'var(--color-texto-secundario)' }}>
          {vacio}
        </Typography>
      ) : (
        <Box sx={{ mt: 1.5, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columnas.map((columna) => (
                  <TableCell key={columna.clave} align={columna.alineacion ?? 'left'}>
                    {columna.titulo}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila) => (
                <TableRow key={fila.clave}>
                  {columnas.map((columna) => (
                    <TableCell key={columna.clave} align={columna.alineacion ?? 'left'}>
                      {columna.formato ? columna.formato(fila[columna.clave]) : fila[columna.clave]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  )
}

function CierreBalance() {
  const { cartera, id, recargar } = useOutletContext()
  const [confirmar, setConfirmar] = useState(false)
  const [cerrando, setCerrando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [balance, setBalance] = useState(cartera.balance ?? null)

  const esCerrable = TIPOS_CERRABLES.includes(cartera.categoria)
  const esPropietario = cartera.rol === 'Propietario'
  const estaFinalizada = cartera.estatus === 'Finalizada'

  if (!esCerrable) {
    return (
      <Alert severity="info">
        Cierre y balance solo está disponible para carteras de tipo Viaje o Evento.
      </Alert>
    )
  }

  const balanceVisible = balance ?? (estaFinalizada ? balanceDesdeResumen(cartera) : null)

  const cerrarCartera = async () => {
    setCerrando(true)
    setError('')

    try {
      const resultado = await finalizarCartera(id)
      setBalance(resultado.balance)
      setMensaje(resultado.cartera ? 'Cartera finalizada correctamente.' : 'Cartera finalizada.')
      setConfirmar(false)
      recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setCerrando(false)
    }
  }

  return (
    <Stack spacing={3}>
      {mensaje && <Alert severity="success">{mensaje}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {estaFinalizada && (
        <Alert severity="info">
          La cartera está finalizada. Solo puedes consultar el detalle y el balance.
        </Alert>
      )}

      {!estaFinalizada && !esPropietario && (
        <Alert severity="info">
          Solo el propietario puede cerrar la cartera.
        </Alert>
      )}

      {!estaFinalizada && esPropietario && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid var(--color-borde)',
            borderRadius: '16px',
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Cerrar cartera
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-texto-secundario)' }}>
                Al cerrar la cartera se calcula el balance total, por categoría y por
                participante. Después queda en solo lectura.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmar(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Cerrar cartera
            </Button>
          </Stack>
        </Paper>
      )}

      {balanceVisible && (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TarjetaBalance etiqueta="Presupuesto inicial" valor={balanceVisible.presupuestoInicial ?? 0} />
            <TarjetaBalance etiqueta="Ingresos" valor={balanceVisible.totalIngresos ?? 0} />
            <TarjetaBalance etiqueta="Gastos" valor={balanceVisible.totalGastos ?? 0} />
            <TarjetaBalance etiqueta="Balance" valor={balanceVisible.balance ?? 0} destacada />
          </Box>

          <Divider />

          <TablaBalance
            titulo="Gastos por categoría"
            columnas={[
              { clave: 'nombre', titulo: 'Categoría' },
              {
                clave: 'total',
                titulo: 'Total',
                alineacion: 'right',
                formato: formatearMonto,
              },
            ]}
            filas={(balanceVisible.porCategoria ?? []).map((fila) => ({
              clave: fila.categoriaId ?? fila.nombre,
              nombre: fila.nombre,
              total: fila.total,
            }))}
            vacio="Sin gastos registrados."
          />

          <TablaBalance
            titulo="Balance por participante"
            columnas={[
              { clave: 'nombre', titulo: 'Participante' },
              {
                clave: 'totalIngresos',
                titulo: 'Ingresos',
                alineacion: 'right',
                formato: formatearMonto,
              },
              {
                clave: 'totalGastos',
                titulo: 'Gastos',
                alineacion: 'right',
                formato: formatearMonto,
              },
              {
                clave: 'balance',
                titulo: 'Balance',
                alineacion: 'right',
                formato: formatearMonto,
              },
            ]}
            filas={(balanceVisible.porParticipante ?? []).map((fila) => ({
              clave: fila.usuarioId,
              ...fila,
            }))}
            vacio="El desglose por participante se muestra al cerrar la cartera."
          />
        </>
      )}

      <Dialog open={confirmar} onClose={() => setConfirmar(false)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Cerrar la cartera?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            La cartera quedará finalizada y no se podrán registrar, editar ni eliminar
            movimientos. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmar(false)} disabled={cerrando}>
            Cancelar
          </Button>
          <Button onClick={cerrarCartera} color="error" variant="contained" disabled={cerrando}>
            {cerrando ? 'Cerrando...' : 'Sí, cerrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default CierreBalance
