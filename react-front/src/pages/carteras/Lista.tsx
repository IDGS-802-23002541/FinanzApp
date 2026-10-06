import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Cartera, Transaccion } from '../../types/models';
import { CATEGORIAS_CARTERA } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { useCarterasStore, useCarteras, useMiembros } from '../../stores/carteras';
import { useUsuarios } from '../../stores/usuarios';
import { useTransacciones } from '../../stores/transacciones';
import { useToastStore } from '../../stores/toast';
import { fechaCorta, moneda, nombreCorto } from '../../utils/format';
import { avancePresupuesto, calcularResumen, sumar } from '../../utils/finanzas';
import { Icon } from '../../components/Icon';
import { Avatar, AvatarStack, ConfirmModal, EmptyState, PageHeader, ProgressBar } from '../../components/ui';
import { CarteraForm } from './CarteraForm';
import { TransaccionForm } from './TransaccionForm';

type Vista = 'propias' | 'compartidas';

export default function Lista() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();
  const transacciones = useTransacciones();
  const mostrarToast = useToastStore((s) => s.mostrar);

  const [vista, setVista] = useState<Vista>('propias');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | 'todas'>('todas');
  const [formAbierto, setFormAbierto] = useState(false);
  const [carteraEnEdicion, setCarteraEnEdicion] = useState<Cartera | null>(null);
  const [archivar, setArchivar] = useState<Cartera | null>(null);
  const [eliminar, setEliminar] = useState<Cartera | null>(null);
  const [formGasto, setFormGasto] = useState(false);
  const [carteraSeleccionada, setCarteraSeleccionada] = useState<number | null>(null);

  const idUsuario = usuario?.idUsuario ?? null;

  const todasMisCarteras = useMemo(
    () => carteras.filter((c) => c.idPropietario === idUsuario && c.estado === 'activa'),
    [carteras, idUsuario],
  );

  const misCarteras = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return todasMisCarteras.filter(
      (c) =>
        (categoriaFiltro === 'todas' || c.idCategoriaCartera === categoriaFiltro) &&
        (!texto || c.nombreCartera.toLowerCase().includes(texto) || c.descripcion.toLowerCase().includes(texto)),
    );
  }, [todasMisCarteras, busqueda, categoriaFiltro]);

  const colaboraciones = useMemo(
    () =>
      carteras.filter(
        (c) =>
          c.idPropietario !== idUsuario &&
          c.estado === 'activa' &&
          miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario),
      ),
    [carteras, miembros, idUsuario],
  );

  const usuarioDe = (id: number) => usuarios.find((u) => u.idUsuario === id) ?? null;

  const usuariosDe = (idCartera: number) =>
    miembros
      .filter((m) => m.idCartera === idCartera)
      .map((m) => usuarioDe(m.idUsuario))
      .filter((u): u is NonNullable<typeof u> => u !== null);

  const movimientosDe = (idCartera: number) => transacciones.filter((t) => t.idCartera === idCartera);

  const nombreCategoria = (id: number) =>
    CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === id)?.nombreCategoriaCartera ?? 'Otro';

  const iconoCategoria = (id: number) =>
    CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === id)?.icono ?? 'tag';

  const avanceDe = (cartera: Cartera) => avancePresupuesto(cartera, movimientosDe(cartera.idCartera));

  const miPagado = (cartera: Cartera) => {
    if (!idUsuario) return 0;
    return movimientosDe(cartera.idCartera)
      .filter((t) => t.idUsuario === idUsuario && t.tipo === 'gasto')
      .reduce((total, t) => total + t.monto, 0);
  };

  const miCuota = (cartera: Cartera) =>
    calcularResumen(cartera, movimientosDe(cartera.idCartera), miembros.filter((m) => m.idCartera === cartera.idCartera), usuarios)
      .cuotaPorMiembro;

  const nueva = () => {
    setCarteraEnEdicion(null);
    setFormAbierto(true);
  };

  const editar = (cartera: Cartera) => {
    setCarteraEnEdicion(cartera);
    setFormAbierto(true);
  };

  const alGuardar = (cartera: Cartera) => {
    const editando = carteraEnEdicion !== null;
    setFormAbierto(false);
    setCarteraEnEdicion(null);
    mostrarToast(editando ? 'Cartera actualizada correctamente.' : `Cartera "${cartera.nombreCartera}" creada.`);
  };

  const confirmarArchivar = () => {
    if (!archivar) return;
    useCarterasStore.getState().archivar(archivar.idCartera);
    mostrarToast(`"${archivar.nombreCartera}" se archivó correctamente.`, 'info');
    setArchivar(null);
  };

  const confirmarEliminar = () => {
    if (!eliminar) return;
    useCarterasStore.getState().eliminar(eliminar.idCartera);
    mostrarToast(`"${eliminar.nombreCartera}" se eliminó definitivamente.`, 'error');
    setEliminar(null);
  };

  const registrarGasto = (cartera: Cartera) => {
    setCarteraSeleccionada(cartera.idCartera);
    setFormGasto(true);
  };

  const alGuardarGasto = (movimiento: Transaccion) => {
    setFormGasto(false);
    const cartera = carteras.find((c) => c.idCartera === movimiento.idCartera);
    mostrarToast(`Gasto de ${moneda(movimiento.monto)} registrado en ${cartera?.nombreCartera ?? 'la cartera'}.`);
  };

  return (
    <Box>
      <PageHeader
        titulo="Carteras"
        descripcion="Administra las carteras que creaste y consulta aquellas en las que participas como contribuyente."
      >
        <Button component={Link} to="/app/inactivas" variant="outlined" color="inherit" startIcon={<Icon name="archive" size={16} />} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
          Inactivas
        </Button>
        <Button variant="contained" startIcon={<Icon name="plus" size={16} />} onClick={nueva}>
          Nueva cartera
        </Button>
      </PageHeader>

      {/* Pestañas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, borderRadius: 4, bgcolor: '#f1f5f9', p: 0.75, maxWidth: { sm: 560 } }}>
        {(
          [
            { clave: 'propias' as Vista, etiqueta: 'Mis carteras', icono: 'wallet', total: misCarteras.length, badge: 'brand' },
            { clave: 'compartidas' as Vista, etiqueta: 'Compartidas', icono: 'share', total: colaboraciones.length, badge: 'slate' },
          ] as const
        ).map((tab) => (
          <Box
            key={tab.clave}
            component="button"
            type="button"
            onClick={() => setVista(tab.clave)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 3,
              border: 'none',
              px: 1.5,
              py: 1.25,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              bgcolor: vista === tab.clave ? '#ffffff' : 'transparent',
              color: vista === tab.clave ? '#0f172a' : '#64748b',
              boxShadow: vista === tab.clave ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Icon name={tab.icono} size={16} />
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.etiqueta}</Box>
            <Box
              component="span"
              sx={{
                flexShrink: 0,
                borderRadius: 999,
                px: 1,
                py: 0.25,
                fontSize: 11,
                fontWeight: 800,
                bgcolor: tab.badge === 'brand' ? '#edfbf3' : '#e2e8f0',
                color: tab.badge === 'brand' ? '#0d6945' : '#475569',
              }}
            >
              {tab.total}
            </Box>
          </Box>
        ))}
      </Box>

      {vista === 'propias' ? (
        <Box component="section" sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 1.5, alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box
                component="button"
                type="button"
                onClick={() => setCategoriaFiltro('todas')}
                sx={chipSx(categoriaFiltro === 'todas')}
              >
                Todas
              </Box>
              {CATEGORIAS_CARTERA.map((categoria) => (
                <Box
                  key={categoria.idCategoriaCartera}
                  component="button"
                  type="button"
                  onClick={() => setCategoriaFiltro(categoria.idCategoriaCartera)}
                  sx={chipSx(categoriaFiltro === categoria.idCategoriaCartera)}
                >
                  <Icon name={categoria.icono} size={14} />
                  {categoria.nombreCategoriaCartera}
                </Box>
              ))}
            </Box>
            <TextField
              type="search"
              placeholder="Buscar cartera…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: { lg: 288 } }}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Icon name="search" size={16} /></InputAdornment>) } }}
            />
          </Box>

          {misCarteras.length > 0 ? (
            <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: '1fr 1fr', xl: '1fr 1fr 1fr' } }}>
              {misCarteras.map((cartera) => (
                <Card key={cartera.idCartera} className="animate-aparecer" sx={{ overflow: 'hidden' }}>
                  <Box sx={{ height: 6, width: '100%', bgcolor: cartera.color }} />
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', minWidth: 0, alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: cartera.color, color: '#ffffff' }}>
                          <Icon name={iconoCategoria(cartera.idCategoriaCartera)} size={20} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box component={Link} to={`/app/carteras/${cartera.idCartera}`} sx={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: '#0d6945' } }}>
                            {cartera.nombreCartera}
                          </Box>
                          <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ borderRadius: 999, bgcolor: '#f1f5f9', color: '#475569', px: 1.25, py: 0.5, fontSize: 11, fontWeight: 700 }}>
                              {nombreCategoria(cartera.idCategoriaCartera)}
                            </Box>
                            {cartera.fechaInicio && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, borderRadius: 999, border: '1px solid #e2e8f0', px: 1.25, py: 0.5, fontSize: 11, fontWeight: 600, color: '#475569' }}>
                                <Icon name="calendar" size={13} />
                                {fechaCorta(cartera.fechaInicio)}
                                {cartera.fechaFin ? ` → ${fechaCorta(cartera.fechaFin)}` : ''}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <AvatarStack usuarios={usuariosDe(cartera.idCartera)} limite={3} />
                    </Box>

                    <Typography sx={{ mt: 1.5, fontSize: 14, color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cartera.descripcion}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
                        <Box component="span">{avanceDe(cartera)}% del presupuesto</Box>
                        <Box component="span">{moneda(sumar(movimientosDe(cartera.idCartera), 'gasto'))} gastado</Box>
                      </Box>
                      <ProgressBar valor={avanceDe(cartera)} color={cartera.color} />
                    </Box>

                    <Box component="dl" sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, borderTop: '1px solid #f1f5f9', pt: 2, textAlign: 'center', m: 0 }}>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Presupuesto</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 700, m: 0 }}>
                          {cartera.presupuestoInicial ? moneda(cartera.presupuestoInicial) : 'Sin definir'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Aportado</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 700, color: '#0d6945', m: 0 }}>
                          {moneda(sumar(movimientosDe(cartera.idCartera), 'ingreso'))}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Movimientos</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 700, m: 0 }}>
                          {movimientosDe(cartera.idCartera).length}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #f1f5f9', pt: 2 }}>
                      <Button component={Link} to={`/app/carteras/${cartera.idCartera}`} variant="contained" size="small" startIcon={<Icon name="eye" size={14} />} sx={{ flex: 1, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}>
                        Abrir cartera
                      </Button>
                      <Button variant="outlined" color="inherit" size="small" title="Editar" onClick={() => editar(cartera)} sx={{ minWidth: 36, borderColor: '#cbd5e1', color: '#334155' }}>
                        <Icon name="edit" size={14} />
                      </Button>
                      <Button variant="outlined" color="inherit" size="small" title="Archivar" onClick={() => setArchivar(cartera)} sx={{ minWidth: 36, borderColor: '#cbd5e1', color: '#334155' }}>
                        <Icon name="archive" size={14} />
                      </Button>
                      <Button variant="outlined" size="small" title="Eliminar" onClick={() => setEliminar(cartera)} sx={{ minWidth: 36, borderColor: '#fecdd3', color: '#e11d48' }}>
                        <Icon name="trash" size={14} />
                      </Button>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          ) : todasMisCarteras.length > 0 ? (
            <Box sx={{ mt: 2.5 }}>
              <EmptyState titulo="No hay carteras que coincidan" descripcion="Ajusta los filtros de búsqueda para encontrar tus carteras." icono="search">
                <Button variant="outlined" color="inherit" size="small" startIcon={<Icon name="refresh" size={14} />} onClick={() => { setBusqueda(''); setCategoriaFiltro('todas'); }} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                  Limpiar filtros
                </Button>
              </EmptyState>
            </Box>
          ) : (
            <Box sx={{ mt: 2.5 }}>
              <EmptyState titulo="Todavía no tienes carteras" descripcion="Crea una cartera para el hogar, un viaje o un evento y comienza a registrar movimientos." icono="wallet">
                <Button variant="contained" size="small" startIcon={<Icon name="plus" size={14} />} onClick={nueva}>
                  Nueva cartera
                </Button>
              </EmptyState>
            </Box>
          )}
        </Box>
      ) : (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 14, color: '#64748b' }}>
            Soy contribuyente en {colaboraciones.length} carteras de otros usuarios.
          </Typography>

          {colaboraciones.length > 0 ? (
            <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: '1fr 1fr', xl: '1fr 1fr 1fr' } }}>
              {colaboraciones.map((cartera) => {
                const pagado = miPagado(cartera);
                const cuota = miCuota(cartera);
                const saldo = pagado - cuota;
                return (
                  <Card key={cartera.idCartera} className="animate-aparecer" sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', minWidth: 0, alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: cartera.color, color: '#ffffff' }}>
                          <Icon name={iconoCategoria(cartera.idCategoriaCartera)} size={20} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box component={Link} to={`/app/carteras/${cartera.idCartera}`} sx={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#0f172a', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: '#0d6945' } }}>
                            {cartera.nombreCartera}
                          </Box>
                          <Typography sx={{ mt: 0.5, fontSize: 12, color: '#64748b' }}>
                            Administrada por {nombreCorto(usuarioDe(cartera.idPropietario))}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'inline-block', borderRadius: 999, bgcolor: '#f1f5f9', color: '#475569', px: 1.25, py: 0.5, fontSize: 11, fontWeight: 700 }}>
                            {nombreCategoria(cartera.idCategoriaCartera)}
                          </Box>
                        </Box>
                      </Box>
                      <Avatar usuario={usuarioDe(cartera.idPropietario)} tamano="sm" />
                    </Box>

                    <Box component="dl" sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, borderRadius: 4, bgcolor: '#f8fafc', p: 2, textAlign: 'center', m: 0 }}>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Mi pagado</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 800, m: 0 }}>{moneda(pagado)}</Typography>
                      </Box>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Mi cuota</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 800, m: 0 }}>{moneda(cuota)}</Typography>
                      </Box>
                      <Box>
                        <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Mi saldo</Typography>
                        <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 800, color: saldo >= 0 ? '#0d6945' : '#e11d48', m: 0 }}>
                          {saldo >= 0 ? '+' : ''}{moneda(saldo)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, color: '#64748b' }}>
                        <Box component="span">Avance del presupuesto</Box>
                        <Box component="span">{avanceDe(cartera)}%</Box>
                      </Box>
                      <ProgressBar valor={avanceDe(cartera)} color={cartera.color} />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #f1f5f9', pt: 2 }}>
                      <Button variant="contained" size="small" startIcon={<Icon name="plus" size={14} />} onClick={() => registrarGasto(cartera)} sx={{ flex: 1 }}>
                        Registrar gasto
                      </Button>
                      <Button component={Link} to={`/app/carteras/${cartera.idCartera}`} variant="outlined" color="inherit" size="small" startIcon={<Icon name="eye" size={14} />} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                        Ver cartera
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ mt: 2.5 }}>
              <EmptyState
                titulo="No participo en otras carteras"
                descripcion="Cuando alguien te invite con un código QR, sus carteras aparecerán en esta sección."
                icono="share"
              />
            </Box>
          )}
        </Box>
      )}

      <CarteraForm
        abierto={formAbierto}
        cartera={carteraEnEdicion}
        onCerrar={() => setFormAbierto(false)}
        onGuardado={alGuardar}
      />

      <TransaccionForm
        abierto={formGasto}
        transaccion={null}
        idCarteraFija={carteraSeleccionada}
        idUsuarioFija={idUsuario}
        onCerrar={() => setFormGasto(false)}
        onGuardado={alGuardarGasto}
      />

      <ConfirmModal
        abierto={archivar !== null}
        titulo="Archivar cartera"
        mensaje={`La cartera ${archivar?.nombreCartera ?? ''} pasará a la sección de inactivas. Podrás reactivarla después.`}
        textoConfirmar="Archivar"
        tono="primary"
        onConfirmar={confirmarArchivar}
        onCerrar={() => setArchivar(null)}
      />

      <ConfirmModal
        abierto={eliminar !== null}
        titulo="Eliminar cartera"
        mensaje={`Se eliminarán la cartera ${eliminar?.nombreCartera ?? ''}, sus miembros y sus movimientos. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar definitivamente"
        onConfirmar={confirmarEliminar}
        onCerrar={() => setEliminar(null)}
      />
    </Box>
  );
}

function chipSx(activo: boolean) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    borderRadius: 999,
    border: '1px solid',
    borderColor: activo ? '#74d8a5' : '#e2e8f0',
    bgcolor: activo ? '#edfbf3' : '#ffffff',
    color: activo ? '#0d5439' : '#475569',
    px: 1.5,
    py: 0.75,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as const;
}
