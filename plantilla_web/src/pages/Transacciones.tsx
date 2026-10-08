import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FiltroTransacciones, Transaccion } from '../types/models';
import { CATEGORIAS_GASTO } from '../data/mock-data';
import { useAuthUsuario } from '../stores/auth';
import { useCarteras, useMiembros } from '../stores/carteras';
import { useUsuarios } from '../stores/usuarios';
import { useTransacciones, useTransaccionesStore } from '../stores/transacciones';
import { useToastStore } from '../stores/toast';
import { filtrar, mesesDisponibles, sumar, FILTRO_VACIO } from '../utils/finanzas';
import { fechaCorta, moneda, nombreCompleto } from '../utils/format';
import { Icon } from '../components/Icon';
import { ConfirmModal, EmptyState, PageHeader } from '../components/ui';
import { TransaccionForm } from './carteras/TransaccionForm';

export default function Transacciones() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();
  const transacciones = useTransacciones();
  const mostrarToast = useToastStore((s) => s.mostrar);

  const [filtro, setFiltro] = useState<FiltroTransacciones>({ ...FILTRO_VACIO });
  const [formAbierto, setFormAbierto] = useState(false);
  const [editar, setEditar] = useState<Transaccion | null>(null);
  const [eliminar, setEliminar] = useState<Transaccion | null>(null);

  const idUsuario = usuario?.idUsuario ?? null;
  const misCarteras = carteras.filter(
    (c) => c.idPropietario === idUsuario || miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario),
  );
  const idsCarteras = new Set(misCarteras.map((c) => c.idCartera));

  const visibles = useMemo(
    () => transacciones.filter((t) => idsCarteras.has(t.idCartera)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transacciones, carteras, miembros, idUsuario],
  );

  const filtradas = useMemo(() => filtrar(visibles, filtro), [visibles, filtro]);
  const meses = useMemo(() => mesesDisponibles(visibles), [visibles]);

  const nombreCartera = (idCartera: number) => carteras.find((c) => c.idCartera === idCartera)?.nombreCartera ?? '—';
  const nombreUsuario = (id: number) => nombreCompleto(usuarios.find((u) => u.idUsuario === id));

  const puedeEditar = (t: Transaccion) => {
    const cartera = carteras.find((c) => c.idCartera === t.idCartera);
    if (!cartera || cartera.estado !== 'activa') return false;
    const esAdmin = cartera.idPropietario === idUsuario || miembros.some((m) => m.idCartera === cartera.idCartera && m.idUsuario === idUsuario && m.rol === 'admin');
    return esAdmin || t.idUsuario === idUsuario;
  };

  const alGuardar = (movimiento: Transaccion) => {
    const editando = editar !== null;
    setFormAbierto(false);
    setEditar(null);
    mostrarToast(editando ? 'Movimiento actualizado correctamente.' : `Movimiento de ${moneda(movimiento.monto)} registrado.`);
  };

  const confirmarEliminar = () => {
    if (!eliminar) return;
    useTransaccionesStore.getState().eliminar(eliminar.idTransaccion);
    mostrarToast('Movimiento eliminado.', 'error');
    setEliminar(null);
  };

  return (
    <Box>
      <PageHeader
        titulo="Transacciones"
        descripcion="Consulta todos los movimientos de tus carteras, combina filtros y corrige lo que haga falta."
      >
        <Button variant="contained" startIcon={<Icon name="plus" size={16} />} onClick={() => { setEditar(null); setFormAbierto(true); }}>
          Registrar movimiento
        </Button>
      </PageHeader>

      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr', lg: '2fr 1fr 1fr 1fr 1fr' } }}>
          <TextField
            type="search"
            placeholder="Buscar por nombre o nota…"
            value={filtro.texto}
            onChange={(e) => setFiltro((f) => ({ ...f, texto: e.target.value }))}
            slotProps={{ input: { startAdornment: <Icon name="search" size={16} style={{ marginRight: 8, color: '#94a3b8' }} /> } }}
          />
          <TextField select value={filtro.tipo} onChange={(e) => setFiltro((f) => ({ ...f, tipo: e.target.value as FiltroTransacciones['tipo'] }))}>
            <MenuItem value="todos">Todos los tipos</MenuItem>
            <MenuItem value="gasto">Gastos</MenuItem>
            <MenuItem value="ingreso">Ingresos</MenuItem>
          </TextField>
          <TextField select value={filtro.idCartera} onChange={(e) => setFiltro((f) => ({ ...f, idCartera: e.target.value === 'todas' ? 'todas' : Number(e.target.value) }))}>
            <MenuItem value="todas">Todas las carteras</MenuItem>
            {misCarteras.map((c) => (
              <MenuItem key={c.idCartera} value={c.idCartera}>{c.nombreCartera}</MenuItem>
            ))}
          </TextField>
          <TextField select value={filtro.idCategoriaGasto} onChange={(e) => setFiltro((f) => ({ ...f, idCategoriaGasto: e.target.value === 'todas' ? 'todas' : Number(e.target.value) }))}>
            <MenuItem value="todas">Todas las categorías</MenuItem>
            {CATEGORIAS_GASTO.map((c) => (
              <MenuItem key={c.idCategoriaGasto} value={c.idCategoriaGasto}>{c.nombreGasto}</MenuItem>
            ))}
          </TextField>
          <TextField select value={filtro.mes} onChange={(e) => setFiltro((f) => ({ ...f, mes: e.target.value }))}>
            <MenuItem value="todos">Todos los meses</MenuItem>
            {meses.map((m) => (
              <MenuItem key={m.clave} value={m.clave}>{m.etiqueta}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
            {filtradas.length} movimientos · {moneda(sumar(filtradas, 'ingreso'))} ingresos · {moneda(sumar(filtradas, 'gasto'))} gastos
          </Typography>
          <Button size="small" variant="text" startIcon={<Icon name="refresh" size={14} />} onClick={() => setFiltro({ ...FILTRO_VACIO })}>
            Limpiar filtros
          </Button>
        </Box>
      </Card>

      <Box sx={{ mt: 2.5 }}>
        {filtradas.length === 0 ? (
          <EmptyState titulo="Sin resultados" descripcion="No hay movimientos que coincidan con los filtros seleccionados." icono="search">
            <Button variant="outlined" color="inherit" size="small" startIcon={<Icon name="refresh" size={14} />} onClick={() => setFiltro({ ...FILTRO_VACIO })} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
              Limpiar filtros
            </Button>
          </EmptyState>
        ) : (
          <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 940 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Cartera</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtradas.map((t) => (
                  <TableRow key={t.idTransaccion} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                    <TableCell sx={{ whiteSpace: 'nowrap', color: '#64748b' }}>{fechaCorta(t.fecha)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t.nota}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{t.nombreGasto}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{nombreCartera(t.idCartera)}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{nombreUsuario(t.idUsuario)}</TableCell>
                    <TableCell sx={{ color: '#64748b', textTransform: 'capitalize' }}>{t.metodoPago}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: t.tipo === 'ingreso' ? '#0d6945' : '#0f172a', whiteSpace: 'nowrap' }}>
                      {t.tipo === 'ingreso' ? '+' : '−'}{moneda(t.monto)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {puedeEditar(t) ? (
                        <>
                          <Button size="small" variant="text" title="Editar" onClick={() => { setEditar(t); setFormAbierto(true); }} sx={{ minWidth: 32, color: '#475569' }}>
                            <Icon name="edit" size={15} />
                          </Button>
                          <Button size="small" variant="text" title="Eliminar" onClick={() => setEliminar(t)} sx={{ minWidth: 32, color: '#e11d48' }}>
                            <Icon name="trash" size={15} />
                          </Button>
                        </>
                      ) : (
                        <Typography component="span" sx={{ fontSize: 11, color: '#94a3b8' }}>Solo lectura</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <TransaccionForm
        abierto={formAbierto}
        transaccion={editar}
        onCerrar={() => { setFormAbierto(false); setEditar(null); }}
        onGuardado={alGuardar}
      />

      <ConfirmModal
        abierto={eliminar !== null}
        titulo="Eliminar movimiento"
        mensaje={`Se eliminará "${eliminar?.nota ?? ''}" por ${eliminar ? moneda(eliminar.monto) : ''}. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCerrar={() => setEliminar(null)}
      />
    </Box>
  );
}
