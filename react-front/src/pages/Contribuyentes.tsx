import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthUsuario } from '../stores/auth';
import { useCarteras, useCarterasStore, useMiembros } from '../stores/carteras';
import { useUsuarios } from '../stores/usuarios';
import { useTransacciones } from '../stores/transacciones';
import { useToastStore } from '../stores/toast';
import { calcularResumen } from '../utils/finanzas';
import { moneda, nombreCompleto } from '../utils/format';
import { Icon } from '../components/Icon';
import { Avatar, ConfirmModal, EmptyState, PageHeader } from '../components/ui';
import { MiembroForm } from './contribuyentes/MiembroForm';

interface FilaContribuyente {
  idMiembro: number;
  idCartera: number;
  nombreCartera: string;
  idUsuario: number;
  rol: 'admin' | 'miembro';
  aporte: number | null;
  movimientos: number;
  saldo: number;
}

export default function Contribuyentes() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();
  const transacciones = useTransacciones();
  const mostrarToast = useToastStore((s) => s.mostrar);

  const [busqueda, setBusqueda] = useState('');
  const [formAbierto, setFormAbierto] = useState(false);
  const [eliminar, setEliminar] = useState<{ idMiembro: number; nombre: string; cartera: string } | null>(null);

  const idUsuario = usuario?.idUsuario ?? null;

  const misCarteras = useMemo(
    () =>
      carteras.filter(
        (c) =>
          c.estado === 'activa' &&
          (c.idPropietario === idUsuario || miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario && m.rol === 'admin')),
      ),
    [carteras, miembros, idUsuario],
  );

  const filas = useMemo<FilaContribuyente[]>(() => {
    const resultado: FilaContribuyente[] = [];
    for (const cartera of misCarteras) {
      const miembrosCartera = miembros.filter((m) => m.idCartera === cartera.idCartera);
      const usuariosCartera = miembrosCartera
        .map((m) => usuarios.find((u) => u.idUsuario === m.idUsuario))
        .filter((u): u is NonNullable<typeof u> => u !== undefined);
      const movimientosCartera = transacciones.filter((t) => t.idCartera === cartera.idCartera);
      const resumen = calcularResumen(cartera, movimientosCartera, miembrosCartera, usuariosCartera);
      for (const m of miembrosCartera) {
        const u = usuarios.find((x) => x.idUsuario === m.idUsuario);
        if (!u) continue;
        resultado.push({
          idMiembro: m.idMiembro,
          idCartera: cartera.idCartera,
          nombreCartera: cartera.nombreCartera,
          idUsuario: m.idUsuario,
          rol: m.rol,
          aporte: m.aporteComprometido,
          movimientos: movimientosCartera.filter((t) => t.idUsuario === m.idUsuario).length,
          saldo: resumen.saldos.find((s) => s.usuario.idUsuario === m.idUsuario)?.saldo ?? 0,
        });
      }
    }
    const texto = busqueda.trim().toLowerCase();
    return resultado
      .filter((f) => {
        if (!texto) return true;
        const u = usuarios.find((x) => x.idUsuario === f.idUsuario);
        return `${nombreCompleto(u)} ${u?.correo ?? ''} ${f.nombreCartera}`.toLowerCase().includes(texto);
      })
      .sort((a, b) => a.nombreCartera.localeCompare(b.nombreCartera) || a.idUsuario - b.idUsuario);
  }, [misCarteras, miembros, usuarios, transacciones, busqueda]);

  const confirmarEliminar = () => {
    if (!eliminar) return;
    const fila = filas.find((f) => f.idMiembro === eliminar.idMiembro);
    if (fila) {
      const admins = miembros.filter((m) => m.idCartera === fila.idCartera && m.rol === 'admin');
      if (fila.rol === 'admin' && admins.length === 1) {
        mostrarToast('No puedes dar de baja al último administrador de la cartera.', 'error');
        setEliminar(null);
        return;
      }
      useCarterasStore.getState().eliminarMiembro(fila.idMiembro);
      mostrarToast(`Se dio de baja a ${eliminar.nombre} de "${fila.nombreCartera}". Sus movimientos se conservan.`, 'info');
    }
    setEliminar(null);
  };

  return (
    <Box>
      <PageHeader
        titulo="Contribuyentes"
        descripcion="Consulta y administra las personas que participan en tus carteras activas."
      >
        <Button variant="contained" startIcon={<Icon name="plus" size={16} />} onClick={() => setFormAbierto(true)}>
          Agregar contribuyente
        </Button>
      </PageHeader>

      <Box sx={{ mb: 2.5, maxWidth: 420 }}>
        <TextField
          type="search"
          placeholder="Filtrar por nombre, correo o cartera…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          fullWidth
          slotProps={{ input: { startAdornment: <Icon name="search" size={16} style={{ marginRight: 8, color: '#94a3b8' }} /> } }}
        />
      </Box>

      {filas.length === 0 ? (
        <EmptyState
          titulo={busqueda ? 'Sin coincidencias' : 'Aún no hay contribuyentes'}
          descripcion={
            busqueda
              ? 'Ajusta el filtro para encontrar a la persona que buscas.'
              : 'Agrega contribuyentes a tus carteras para verlos aquí.'
          }
          icono="users"
        />
      ) : (
        <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                <TableCell>Contribuyente</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Cartera</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="right">Aporte</TableCell>
                <TableCell align="right">Movimientos</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila) => {
                const u = usuarios.find((x) => x.idUsuario === fila.idUsuario);
                return (
                  <TableRow key={`${fila.idCartera}-${fila.idMiembro}`} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar usuario={u} tamano="xs" />
                        <Box component="span" sx={{ fontWeight: 600 }}>{nombreCompleto(u)}</Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{u?.correo}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{fila.nombreCartera}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ borderRadius: 999, bgcolor: fila.rol === 'admin' ? '#edfbf3' : '#f1f5f9', color: fila.rol === 'admin' ? '#0d6945' : '#475569', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700 }}>
                        {fila.rol === 'admin' ? 'Administrador' : 'Miembro'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{fila.aporte ? moneda(fila.aporte) : '—'}</TableCell>
                    <TableCell align="right">{fila.movimientos}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: fila.saldo >= 0 ? '#0d6945' : '#e11d48', whiteSpace: 'nowrap' }}>
                      {fila.saldo >= 0 ? '+' : '−'}{moneda(Math.abs(fila.saldo))}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        title="Dar de baja"
                        onClick={() => setEliminar({ idMiembro: fila.idMiembro, nombre: nombreCompleto(u), cartera: fila.nombreCartera })}
                        sx={{ minWidth: 32, color: '#e11d48' }}
                      >
                        <Icon name="trash" size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <MiembroForm
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        onGuardado={() => {
          setFormAbierto(false);
          mostrarToast('Contribuyente agregado correctamente.');
        }}
      />

      <ConfirmModal
        abierto={eliminar !== null}
        titulo="Dar de baja al contribuyente"
        mensaje={`Se dará de baja a ${eliminar?.nombre ?? ''} de "${eliminar?.cartera ?? ''}". Sus movimientos se conservan y los totales se recalculan.`}
        textoConfirmar="Dar de baja"
        onConfirmar={confirmarEliminar}
        onCerrar={() => setEliminar(null)}
      />
    </Box>
  );
}
