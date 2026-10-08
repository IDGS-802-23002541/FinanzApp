import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CATEGORIAS_CARTERA } from '../data/mock-data';
import { useAuthUsuario } from '../stores/auth';
import { useCarterasStore, useInactivasDe } from '../stores/carteras';
import { useTransacciones } from '../stores/transacciones';
import { useToastStore } from '../stores/toast';
import { fechaCorta, fechaLarga, moneda } from '../utils/format';
import { sumar } from '../utils/finanzas';
import { Icon } from '../components/Icon';
import { EmptyState, PageHeader } from '../components/ui';

export default function Inactivas() {
  const usuario = useAuthUsuario();
  const inactivas = useInactivasDe(usuario?.idUsuario ?? null);
  const transacciones = useTransacciones();
  const mostrarToast = useToastStore((s) => s.mostrar);

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<number | 'todas'>('todas');

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return [...inactivas]
      .filter(
        (c) =>
          (categoria === 'todas' || c.idCategoriaCartera === categoria) &&
          (!texto || c.nombreCartera.toLowerCase().includes(texto) || c.descripcion.toLowerCase().includes(texto)),
      )
      .sort((a, b) => (b.fechaCierre ?? '').localeCompare(a.fechaCierre ?? ''));
  }, [inactivas, busqueda, categoria]);

  const gastadoDe = (idCartera: number) => sumar(transacciones.filter((t) => t.idCartera === idCartera), 'gasto');

  const nombreCategoria = (id: number) =>
    CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === id)?.nombreCategoriaCartera ?? 'Otro';

  const reactivar = (idCartera: number, nombre: string) => {
    useCarterasStore.getState().reactivar(idCartera);
    mostrarToast(`"${nombre}" se reactivó correctamente.`);
  };

  return (
    <Box>
      <PageHeader
        titulo="Carteras inactivas"
        descripcion="Histórico de carteras finalizadas con su balance congelado. Puedes reactivar las que administras."
      >
        <Button component={Link} to="/app/carteras" variant="outlined" color="inherit" startIcon={<Icon name="arrow-left" size={16} />} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
          Volver a carteras
        </Button>
      </PageHeader>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 1.5, alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setCategoria('todas')}
            sx={{ borderRadius: 999, border: '1px solid', borderColor: categoria === 'todas' ? '#74d8a5' : '#e2e8f0', bgcolor: categoria === 'todas' ? '#edfbf3' : '#ffffff', color: categoria === 'todas' ? '#0d5439' : '#475569', px: 1.5, py: 0.75, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Todas
          </Box>
          {CATEGORIAS_CARTERA.map((cat) => (
            <Box
              key={cat.idCategoriaCartera}
              component="button"
              type="button"
              onClick={() => setCategoria(cat.idCategoriaCartera)}
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, borderRadius: 999, border: '1px solid', borderColor: categoria === cat.idCategoriaCartera ? '#74d8a5' : '#e2e8f0', bgcolor: categoria === cat.idCategoriaCartera ? '#edfbf3' : '#ffffff', color: categoria === cat.idCategoriaCartera ? '#0d5439' : '#475569', px: 1.5, py: 0.75, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              <Icon name={cat.icono} size={14} />
              {cat.nombreCategoriaCartera}
            </Box>
          ))}
        </Box>
        <TextField
          type="search"
          placeholder="Buscar cartera…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ width: { lg: 288 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon name="search" size={16} /></InputAdornment> } }}
        />
      </Box>

      {filtradas.length === 0 ? (
        <Box sx={{ mt: 2.5 }}>
          <EmptyState
            titulo={inactivas.length ? 'Sin coincidencias' : 'No hay carteras finalizadas'}
            descripcion={
              inactivas.length
                ? 'Ajusta los filtros para encontrar una cartera del histórico.'
                : 'Cuando finalices una cartera aparecerá aquí con su balance final.'
            }
            icono="archive"
          />
        </Box>
      ) : (
        <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: '1fr 1fr', xl: '1fr 1fr 1fr' } }}>
          {filtradas.map((cartera) => (
            <Card key={cartera.idCartera} className="animate-aparecer" sx={{ p: 2.5, opacity: 0.96 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box sx={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#f1f5f9', color: '#64748b' }}>
                    <Icon name="archive" size={20} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cartera.nombreCartera}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 12, color: '#64748b' }}>
                      {nombreCategoria(cartera.idCategoriaCartera)}{cartera.fechaCierre ? ` · cerrada el ${fechaCorta(cartera.fechaCierre)}` : ''}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ borderRadius: 999, bgcolor: '#f1f5f9', color: '#475569', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Finalizada
                </Box>
              </Box>

              <Typography sx={{ mt: 1.5, fontSize: 13, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {cartera.descripcion}
              </Typography>

              <Box component="dl" sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, borderRadius: 3, bgcolor: '#f8fafc', p: 1.75, m: 0 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Total gastado</Typography>
                  <Typography component="dd" sx={{ mt: 0.25, fontSize: 15, fontWeight: 800, m: 0 }}>{moneda(gastadoDe(cartera.idCartera))}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Presupuesto</Typography>
                  <Typography component="dd" sx={{ mt: 0.25, fontSize: 15, fontWeight: 800, m: 0 }}>
                    {cartera.presupuestoInicial ? moneda(cartera.presupuestoInicial) : '—'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, borderTop: '1px solid #f1f5f9', pt: 2 }}>
                <Button component={Link} to={`/app/carteras/${cartera.idCartera}`} variant="contained" size="small" startIcon={<Icon name="eye" size={14} />} sx={{ flex: 1, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}>
                  Ver balance final
                </Button>
                {cartera.idPropietario === usuario?.idUsuario && (
                  <Button variant="outlined" color="inherit" size="small" startIcon={<Icon name="refresh" size={14} />} onClick={() => reactivar(cartera.idCartera, cartera.nombreCartera)} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
                    Reactivar
                  </Button>
                )}
              </Box>
              {cartera.fechaCierre && (
                <Typography sx={{ mt: 1.5, fontSize: 11, color: '#94a3b8' }}>
                  Cerrada el {fechaLarga(cartera.fechaCierre)} · el balance ya no se recalcula.
                </Typography>
              )}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
