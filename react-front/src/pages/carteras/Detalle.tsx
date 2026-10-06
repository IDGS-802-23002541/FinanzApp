import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import QRCode from 'qrcode';
import type { Transaccion } from '../../types/models';
import { CATEGORIAS_CARTERA, CATEGORIAS_GASTO } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { esMiembroDe, esPropietario, useCarteraPorId, useCarterasStore, useMiembrosDe, useUsuariosDe } from '../../stores/carteras';
import { useTransaccionesStore, useTransaccionesDeCartera } from '../../stores/transacciones';
import { useToastStore } from '../../stores/toast';
import { fechaCorta, fechaLarga, hoyISO, moneda, nombreCompleto, porcentaje } from '../../utils/format';
import {
  avancePresupuesto,
  calcularResumen,
  filtrar,
  gastosPorCategoria,
  serieMensual,
  sumar,
  FILTRO_VACIO,
} from '../../utils/finanzas';
import type { FiltroTransacciones } from '../../types/models';
import { Icon } from '../../components/Icon';
import { Avatar, AvatarStack, ConfirmModal, EmptyState, ProgressBar, StatCard } from '../../components/ui';
import { BarChart, DonutChart } from '../../components/charts';
import { CarteraForm } from './CarteraForm';
import { TransaccionForm } from './TransaccionForm';
import { MiembroForm } from '../contribuyentes/MiembroForm';

type Pestana = 'resumen' | 'movimientos' | 'contribuyentes' | 'invitacion' | 'cierre';

export default function Detalle() {
  const { id } = useParams();
  const idCartera = Number(id);
  const navigate = useNavigate();

  const usuario = useAuthUsuario();
  const cartera = useCarteraPorId(idCartera);
  const miembros = useMiembrosDe(idCartera);
  const usuariosDe = useUsuariosDe(idCartera);
  const movimientos = useTransaccionesDeCartera(idCartera);
  const mostrarToast = useToastStore((s) => s.mostrar);

  const [pestana, setPestana] = useState<Pestana>('resumen');
  const [editarCartera, setEditarCartera] = useState(false);
  const [formMovimiento, setFormMovimiento] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState<Transaccion | null>(null);
  const [movimientoEliminar, setMovimientoEliminar] = useState<Transaccion | null>(null);
  const [formMiembro, setFormMiembro] = useState(false);
  const [miembroEliminar, setMiembroEliminar] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<FiltroTransacciones>({ ...FILTRO_VACIO, idCartera });
  const [qr, setQr] = useState('');
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);

  const idUsuario = usuario?.idUsuario ?? null;
  const miembroActual = miembros.find((m) => m.idUsuario === idUsuario);
  const puedeAdministrar = Boolean(
    cartera && idUsuario !== null && (esPropietario(idCartera, idUsuario) || miembroActual?.rol === 'admin'),
  );
  const activa = cartera?.estado === 'activa';

  const resumen = useMemo(
    () => (cartera ? calcularResumen(cartera, movimientos, miembros, usuariosDe) : null),
    [cartera, movimientos, miembros, usuariosDe],
  );

  const enlaceInvitacion = cartera ? `finanzapp.mx/unirse?codigo=${cartera.codigoInvitacion}` : '';

  useEffect(() => {
    if (pestana !== 'invitacion' || !enlaceInvitacion) return;
    QRCode.toDataURL(`https://${enlaceInvitacion}`, { width: 240, margin: 1 })
      .then(setQr)
      .catch(() => setQr(''));
  }, [pestana, enlaceInvitacion]);

  if (!cartera) {
    return (
      <EmptyState titulo="Cartera no encontrada" descripcion="La cartera que buscas no existe o fue eliminada." icono="wallet">
        <Button component={Link} to="/app/carteras" variant="contained" startIcon={<Icon name="arrow-left" size={16} />}>
          Volver a carteras
        </Button>
      </EmptyState>
    );
  }

  const categoria = CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === cartera.idCategoriaCartera);
  const avance = avancePresupuesto(cartera, movimientos);
  const filtrados = filtrar(movimientos, filtro);
  const nombreDe = (idU: number) => usuariosDe.find((u) => u.idUsuario === idU);

  const copiarClave = async () => {
    try {
      await navigator.clipboard.writeText(cartera.codigoInvitacion);
      mostrarToast('Clave copiada al portapapeles.');
    } catch {
      mostrarToast('No se pudo copiar automáticamente; copia la clave manualmente.', 'error');
    }
  };

  const compartir = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Invitación a ${cartera.nombreCartera}`, text: 'Únete a mi cartera en FinanzApp', url: `https://${enlaceInvitacion}` });
        return;
      }
      await navigator.clipboard.writeText(`https://${enlaceInvitacion}`);
      mostrarToast('Enlace copiado al portapapeles.');
    } catch {
      mostrarToast('No se pudo compartir el enlace.', 'error');
    }
  };

  const regenerar = () => {
    const nuevo = useCarterasStore.getState().regenerarCodigo(cartera.idCartera);
    mostrarToast(`Nueva clave generada: ${nuevo}. La anterior ya no funciona.`, 'info');
  };

  const finalizar = () => {
    useCarterasStore.getState().archivar(cartera.idCartera);
    setConfirmarFinalizar(false);
    mostrarToast(`"${cartera.nombreCartera}" quedó finalizada y pasó a Inactivas.`, 'info');
  };

  const guardarMovimiento = (movimiento: Transaccion) => {
    const editando = movimientoEditar !== null;
    setFormMovimiento(false);
    setMovimientoEditar(null);
    mostrarToast(editando ? 'Movimiento actualizado correctamente.' : `Movimiento de ${moneda(movimiento.monto)} registrado.`);
  };

  const eliminarMovimiento = () => {
    if (!movimientoEliminar) return;
    useTransaccionesStore.getState().eliminar(movimientoEliminar.idTransaccion);
    mostrarToast('Movimiento eliminado.', 'error');
    setMovimientoEliminar(null);
  };

  const eliminarMiembro = () => {
    if (miembroEliminar === null) return;
    const admins = miembros.filter((m) => m.rol === 'admin');
    const miembro = miembros.find((m) => m.idMiembro === miembroEliminar);
    if (miembro?.rol === 'admin' && admins.length === 1) {
      mostrarToast('No puedes dar de baja al último administrador de la cartera.', 'error');
      setMiembroEliminar(null);
      return;
    }
    useCarterasStore.getState().eliminarMiembro(miembroEliminar);
    mostrarToast('Contribuyente dado de baja; sus movimientos se conservan.', 'info');
    setMiembroEliminar(null);
  };

  const PESTANAS: { clave: Pestana; etiqueta: string; icono: string }[] = [
    { clave: 'resumen', etiqueta: 'Resumen', icono: 'chart' },
    { clave: 'movimientos', etiqueta: 'Movimientos', icono: 'receipt' },
    { clave: 'contribuyentes', etiqueta: 'Contribuyentes', icono: 'users' },
    { clave: 'invitacion', etiqueta: 'Invitación QR', icono: 'qr' },
    { clave: 'cierre', etiqueta: 'Cierre y balance', icono: 'target' },
  ];

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ mb: 3 }}>
        <Box
          component={Link}
          to="/app/carteras"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 13, fontWeight: 500, color: '#64748b', textDecoration: 'none', '&:hover': { color: '#0f172a' } }}
        >
          <Icon name="arrow-left" size={15} />
          Volver a carteras
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: cartera.color, color: '#ffffff' }}>
              <Icon name={categoria?.icono ?? 'tag'} size={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cartera.nombreCartera}
              </Typography>
              <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <Box sx={{ borderRadius: 999, bgcolor: '#f1f5f9', color: '#475569', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700 }}>
                  {categoria?.nombreCategoriaCartera ?? 'Otro'}
                </Box>
                {!activa && (
                  <Box sx={{ borderRadius: 999, bgcolor: '#fff1f2', color: '#e11d48', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700 }}>
                    Cartera finalizada
                  </Box>
                )}
                {activa && cartera.fechaInicio && (
                  <Box sx={{ borderRadius: 999, border: '1px solid #e2e8f0', color: '#64748b', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 600 }}>
                    {fechaCorta(cartera.fechaInicio)}{cartera.fechaFin ? ` → ${fechaCorta(cartera.fechaFin)}` : ''}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            {activa && (
              <Button variant="contained" startIcon={<Icon name="plus" size={16} />} onClick={() => { setMovimientoEditar(null); setFormMovimiento(true); }}>
                Registrar movimiento
              </Button>
            )}
            {puedeAdministrar && (
              <Button variant="outlined" color="inherit" startIcon={<Icon name="edit" size={16} />} onClick={() => setEditarCartera(true)} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                Editar
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Pestañas */}
      <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', borderBottom: '1px solid #e2e8f0', mb: 3 }}>
        {PESTANAS.map((tab) => (
          <Box
            key={tab.clave}
            component="button"
            type="button"
            onClick={() => setPestana(tab.clave)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              border: 'none',
              borderBottom: '2px solid',
              borderColor: pestana === tab.clave ? '#108354' : 'transparent',
              bgcolor: 'transparent',
              px: 1.75,
              py: 1.5,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              color: pestana === tab.clave ? '#0d6945' : '#64748b',
              '&:hover': { color: pestana === tab.clave ? '#0d6945' : '#0f172a' },
            }}
          >
            <Icon name={tab.icono} size={16} />
            {tab.etiqueta}
          </Box>
        ))}
      </Box>

      {/* ------------------------------ RESUMEN ------------------------------ */}
      {pestana === 'resumen' && resumen && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
            <StatCard etiqueta="Presupuesto" valor={cartera.presupuestoInicial ?? 0} icono="target" tono="slate" nota={cartera.presupuestoInicial ? '' : 'Sin definir'} />
            <StatCard etiqueta="Gastado" valor={resumen.totalGastos} icono="cart" tono="rose" />
            <StatCard etiqueta="Disponible" valor={resumen.disponible} icono="wallet" tono={resumen.disponible < 0 ? 'rose' : 'brand'} />
            <StatCard etiqueta="Movimientos" valor={resumen.movimientos} icono="receipt" tono="slate" formato="numero" />
          </Box>

          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.25 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                Avance del presupuesto{cartera.presupuestoInicial ? '' : ' (base: ingresos)'}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: avance >= 90 ? '#e11d48' : '#0d6945' }}>{avance}%</Typography>
            </Box>
            <ProgressBar valor={avance} color={avance >= 90 ? '#e11d48' : cartera.color} altura={12} />
          </Card>

          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Últimos 6 meses</Typography>
              <BarChart datos={serieMensual(movimientos, 6)} alto={190} color={cartera.color} mostrarSecundario leyendaPrincipal="Gastos por mes" leyendaSecundario="Ingresos" />
            </Card>
            <Card sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Gasto por categoría</Typography>
              <DonutChart segmentos={gastosPorCategoria(movimientos, CATEGORIAS_GASTO)} etiquetaCentro="Gastado" />
            </Card>
          </Box>

          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Ranking de pagos por contribuyente</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {resumen.saldos.slice(0, 5).map((saldo) => {
                  const maxPagado = resumen.saldos[0]?.pagado || 1;
                  return (
                    <Box key={saldo.usuario.idUsuario} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar usuario={saldo.usuario} tamano="sm" />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: 13 }}>
                          <Box sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreCompleto(saldo.usuario)}</Box>
                          <Box sx={{ fontWeight: 700 }}>{moneda(saldo.pagado)}</Box>
                        </Box>
                        <Box sx={{ mt: 0.75 }}>
                          <ProgressBar valor={porcentaje(saldo.pagado, maxPagado)} color={saldo.usuario.color} altura={6} />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                {resumen.saldos.length === 0 && <Typography sx={{ fontSize: 13, color: '#64748b' }}>Sin pagos registrados.</Typography>}
              </Box>
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Últimos movimientos</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {movimientos.slice(0, 5).map((t) => (
                  <Box key={t.idTransaccion} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: t.tipo === 'ingreso' ? '#edfbf3' : '#fff1f2', color: t.tipo === 'ingreso' ? '#0d6945' : '#e11d48' }}>
                      <Icon name={t.tipo === 'ingreso' ? 'trend-up' : 'cart'} size={17} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nota}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: '#64748b' }}>{nombreCompleto(nombreDe(t.idUsuario))} · {fechaCorta(t.fecha)}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: t.tipo === 'ingreso' ? '#0d6945' : '#0f172a' }}>
                      {t.tipo === 'ingreso' ? '+' : '−'}{moneda(t.monto)}
                    </Typography>
                  </Box>
                ))}
                {movimientos.length === 0 && <Typography sx={{ fontSize: 13, color: '#64748b' }}>Aún no hay movimientos. Registra el primero para ver estadísticas.</Typography>}
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* ---------------------------- MOVIMIENTOS ---------------------------- */}
      {pestana === 'movimientos' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' } }}>
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
              <TextField select value={filtro.idCategoriaGasto} onChange={(e) => setFiltro((f) => ({ ...f, idCategoriaGasto: e.target.value === 'todas' ? 'todas' : Number(e.target.value) }))}>
                <MenuItem value="todas">Todas las categorías</MenuItem>
                {CATEGORIAS_GASTO.map((c) => (
                  <MenuItem key={c.idCategoriaGasto} value={c.idCategoriaGasto}>{c.nombreGasto}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
                {filtrados.length} de {movimientos.length} movimientos · Total filtrado: {moneda(sumar(filtrados, 'ingreso'))} ingresos / {moneda(sumar(filtrados, 'gasto'))} gastos
              </Typography>
              <Button size="small" variant="text" startIcon={<Icon name="refresh" size={14} />} onClick={() => setFiltro({ ...FILTRO_VACIO, idCartera })}>
                Limpiar filtros
              </Button>
            </Box>
          </Card>

          {filtrados.length === 0 ? (
            <EmptyState titulo="Sin movimientos que coincidan" descripcion="Ajusta los filtros o registra un movimiento nuevo." icono="search" />
          ) : (
            <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    {(puedeAdministrar || movimientos.some((t) => t.idUsuario === idUsuario)) && <TableCell align="right">Acciones</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrados.map((t) => {
                    const propio = t.idUsuario === idUsuario;
                    const puedeEditar = activa && (puedeAdministrar || propio);
                    return (
                      <TableRow key={t.idTransaccion} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                        <TableCell sx={{ whiteSpace: 'nowrap', color: '#64748b' }}>{fechaCorta(t.fecha)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t.nota}</TableCell>
                        <TableCell sx={{ color: '#475569' }}>{t.nombreGasto}</TableCell>
                        <TableCell sx={{ color: '#475569' }}>{nombreCompleto(nombreDe(t.idUsuario))}</TableCell>
                        <TableCell sx={{ color: '#64748b', textTransform: 'capitalize' }}>{t.metodoPago}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: t.tipo === 'ingreso' ? '#0d6945' : '#0f172a', whiteSpace: 'nowrap' }}>
                          {t.tipo === 'ingreso' ? '+' : '−'}{moneda(t.monto)}
                        </TableCell>
                        {(puedeAdministrar || movimientos.some((x) => x.idUsuario === idUsuario)) && (
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {puedeEditar ? (
                              <>
                                <Button size="small" variant="text" onClick={() => { setMovimientoEditar(t); setFormMovimiento(true); }} sx={{ minWidth: 32, color: '#475569' }} title="Editar">
                                  <Icon name="edit" size={15} />
                                </Button>
                                <Button size="small" variant="text" onClick={() => setMovimientoEliminar(t)} sx={{ minWidth: 32, color: '#e11d48' }} title="Eliminar">
                                  <Icon name="trash" size={15} />
                                </Button>
                              </>
                            ) : (
                              <Typography component="span" sx={{ fontSize: 11, color: '#94a3b8' }}>Solo lectura</Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* --------------------------- CONTRIBUYENTES --------------------------- */}
      {pestana === 'contribuyentes' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{miembros.length} contribuyentes</Typography>
              <Typography sx={{ fontSize: 13, color: '#64748b' }}>El aporte comprometido es informativo; el saldo se calcula con los movimientos.</Typography>
            </Box>
            {puedeAdministrar && activa && (
              <Button variant="contained" startIcon={<Icon name="plus" size={16} />} onClick={() => setFormMiembro(true)}>
                Agregar contribuyente
              </Button>
            )}
          </Box>

          <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                  <TableCell>Contribuyente</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell align="right">Aporte comprometido</TableCell>
                  <TableCell align="right">Movimientos</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  {puedeAdministrar && activa && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {miembros.map((m) => {
                  const u = nombreDe(m.idUsuario);
                  const saldo = resumen?.saldos.find((s) => s.usuario.idUsuario === m.idUsuario)?.saldo ?? 0;
                  const movs = movimientos.filter((t) => t.idUsuario === m.idUsuario).length;
                  return (
                    <TableRow key={m.idMiembro} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar usuario={u} tamano="xs" />
                          <Box component="span" sx={{ fontWeight: 600 }}>{nombreCompleto(u)}</Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{u?.correo ?? '—'}</TableCell>
                      <TableCell>
                        <Box component="span" sx={{ borderRadius: 999, bgcolor: m.rol === 'admin' ? '#edfbf3' : '#f1f5f9', color: m.rol === 'admin' ? '#0d6945' : '#475569', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700 }}>
                          {m.rol === 'admin' ? 'Administrador' : 'Miembro'}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{m.aporteComprometido ? moneda(m.aporteComprometido) : '—'}</TableCell>
                      <TableCell align="right">{movs}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: saldo >= 0 ? '#0d6945' : '#e11d48', whiteSpace: 'nowrap' }}>
                        {saldo >= 0 ? '+' : '−'}{moneda(Math.abs(saldo))}
                      </TableCell>
                      {puedeAdministrar && activa && (
                        <TableCell align="right">
                          <Button size="small" variant="text" onClick={() => setMiembroEliminar(m.idMiembro)} sx={{ minWidth: 32, color: '#e11d48' }} title="Dar de baja">
                            <Icon name="trash" size={15} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ----------------------------- INVITACIÓN ----------------------------- */}
      {pestana === 'invitacion' && (
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: 'minmax(0, 420px) 1fr' }, alignItems: 'start' }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Código QR de invitación</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {qr ? (
                <Box component="img" src={qr} alt={`QR de ${cartera.nombreCartera}`} sx={{ width: 240, height: 240, borderRadius: 3, border: '1px solid #e2e8f0' }} />
              ) : (
                <Box sx={{ width: 240, height: 240, borderRadius: 3, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Icon name="qr" size={40} />
                </Box>
              )}
            </Box>
            <Typography sx={{ mt: 2, fontSize: 12, color: '#64748b' }}>Clave única</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 26, fontWeight: 800, letterSpacing: '0.08em' }}>{cartera.codigoInvitacion}</Typography>
            <Typography sx={{ mt: 1, fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>{enlaceInvitacion}</Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Invita a tu grupo</Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: '#475569' }}>
              Comparte el código QR o la clave por WhatsApp. Quien la reciba podrá unirse a la cartera como contribuyente
              y registrar sus propios movimientos.
            </Typography>
            <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button variant="outlined" color="inherit" startIcon={<Icon name="copy" size={16} />} onClick={copiarClave} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                Copiar clave
              </Button>
              <Button variant="contained" startIcon={<Icon name="share" size={16} />} onClick={compartir}>
                Compartir
              </Button>
              {puedeAdministrar && activa && (
                <Button variant="outlined" color="warning" startIcon={<Icon name="refresh" size={16} />} onClick={regenerar}>
                  Regenerar clave
                </Button>
              )}
            </Box>
            {!puedeAdministrar && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#94a3b8' }}>
                Solo un administrador puede regenerar la clave.
              </Typography>
            )}
            {!activa && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#e11d48' }}>
                Esta cartera está finalizada: la invitación ya no admite nuevos miembros.
              </Typography>
            )}
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AvatarStack usuarios={usuariosDe} limite={5} />
              <Typography sx={{ fontSize: 13, color: '#64748b' }}>{miembros.length} miembros actuales</Typography>
            </Box>
          </Card>
        </Box>
      )}

      {/* ------------------------------- CIERRE ------------------------------- */}
      {pestana === 'cierre' && resumen && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {!activa && (
            <Box sx={{ borderRadius: 3, border: '1px solid #fecdd3', bgcolor: '#fff1f2', px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#be123c' }}>
                Cartera finalizada{cartera.fechaCierre ? ` el ${fechaLarga(cartera.fechaCierre)}` : ''}. El balance mostrado quedó congelado.
              </Typography>
            </Box>
          )}

          <Card sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>Saldos por integrante</Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b' } }}>
                    <TableCell>Integrante</TableCell>
                    <TableCell align="right">Pagado</TableCell>
                    <TableCell align="right">Aportado</TableCell>
                    <TableCell align="right">Cuota</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumen.saldos.map((s) => (
                    <TableRow key={s.usuario.idUsuario} sx={{ '& td': { fontSize: 13.5 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar usuario={s.usuario} tamano="xs" />
                          <Box component="span" sx={{ fontWeight: 600 }}>{nombreCompleto(s.usuario)}</Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{moneda(s.pagado)}</TableCell>
                      <TableCell align="right" sx={{ color: '#0d6945' }}>{moneda(s.aportado)}</TableCell>
                      <TableCell align="right">{moneda(s.cuota)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: Math.abs(s.saldo) <= 1 ? '#64748b' : s.saldo > 0 ? '#0d6945' : '#e11d48', whiteSpace: 'nowrap' }}>
                        {s.saldo >= 0 ? '+' : '−'}{moneda(Math.abs(s.saldo))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography sx={{ mt: 1.5, fontSize: 12.5, color: Math.abs(resumen.saldos.reduce((t, s) => t + s.saldo, 0)) <= 1 ? '#0d6945' : '#e11d48' }}>
              Suma de saldos: {moneda(resumen.saldos.reduce((t, s) => t + s.saldo, 0))} {Math.abs(resumen.saldos.reduce((t, s) => t + s.saldo, 0)) <= 1 ? '· cuentas cuadradas (±$1.00 de tolerancia)' : '· revisa los movimientos'}
            </Typography>
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>Liquidación sugerida</Typography>
            {resumen.liquidaciones.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {resumen.liquidaciones.map((liq, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 3, bgcolor: '#f8fafc', px: 2, py: 1.5 }}>
                    <Avatar usuario={liq.de} tamano="xs" />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{nombreCompleto(liq.de)}</Typography>
                    <Icon name="chevron-right" size={16} />
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0d6945' }}>{moneda(liq.monto)}</Typography>
                    <Icon name="chevron-right" size={16} />
                    <Avatar usuario={liq.para} tamano="xs" />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{nombreCompleto(liq.para)}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 13.5, color: '#64748b' }}>
                No se requieren transferencias: todos los saldos están dentro de la tolerancia de ±$1.00.
              </Typography>
            )}
          </Card>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button variant="outlined" color="inherit" startIcon={<Icon name="print" size={16} />} onClick={() => window.print()} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
              Imprimir balance
            </Button>
            {puedeAdministrar && activa && (
              <Button variant="contained" color="error" startIcon={<Icon name="check" size={16} />} onClick={() => setConfirmarFinalizar(true)}>
                Finalizar cartera
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Modales */}
      <CarteraForm abierto={editarCartera} cartera={cartera} onCerrar={() => setEditarCartera(false)} onGuardado={() => { setEditarCartera(false); mostrarToast('Cartera actualizada correctamente.'); }} />

      <TransaccionForm
        abierto={formMovimiento}
        transaccion={movimientoEditar}
        idCarteraFija={idCartera}
        onCerrar={() => { setFormMovimiento(false); setMovimientoEditar(null); }}
        onGuardado={guardarMovimiento}
      />

      <MiembroForm abierto={formMiembro} idCartera={idCartera} onCerrar={() => setFormMiembro(false)} onGuardado={() => { setFormMiembro(false); mostrarToast('Contribuyente agregado a la cartera.'); }} />

      <ConfirmModal
        abierto={movimientoEliminar !== null}
        titulo="Eliminar movimiento"
        mensaje={`Se eliminará "${movimientoEliminar?.nota ?? ''}" por ${movimientoEliminar ? moneda(movimientoEliminar.monto) : ''}. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={eliminarMovimiento}
        onCerrar={() => setMovimientoEliminar(null)}
      />

      <ConfirmModal
        abierto={miembroEliminar !== null}
        titulo="Dar de baja al contribuyente"
        mensaje="Sus movimientos se conservarán en el histórico de la cartera y los totales se recalcularán."
        textoConfirmar="Dar de baja"
        onConfirmar={eliminarMiembro}
        onCerrar={() => setMiembroEliminar(null)}
      />

      <ConfirmModal
        abierto={confirmarFinalizar}
        titulo="Finalizar cartera"
        mensaje={`La cartera "${cartera.nombreCartera}" pasará a Inactivas y ya no admitirá movimientos, miembros ni invitaciones.`}
        textoConfirmar="Finalizar cartera"
        onConfirmar={finalizar}
        onCerrar={() => setConfirmarFinalizar(false)}
      />
    </Box>
  );
}
