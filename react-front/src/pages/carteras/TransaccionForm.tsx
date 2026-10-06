import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { MetodoPago, TipoTransaccion, Transaccion } from '../../types/models';
import { CATEGORIAS_GASTO } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { useCarteras, useCarterasStore, useMiembros } from '../../stores/carteras';
import { useUsuarios } from '../../stores/usuarios';
import { useTransaccionesStore } from '../../stores/transacciones';
import { hoyISO } from '../../utils/format';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/ui';

export interface TransaccionFormProps {
  abierto: boolean;
  /** null = registrar nuevo; con valor = editar */
  transaccion: Transaccion | null;
  /** Si viene, la cartera queda fija (no se muestra selector) */
  idCarteraFija?: number | null;
  /** Si viene, el responsable queda fijo */
  idUsuarioFija?: number | null;
  onCerrar: () => void;
  onGuardado: (transaccion: Transaccion) => void;
}

const METODOS: { valor: MetodoPago; etiqueta: string }[] = [
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
];

export function TransaccionForm({
  abierto,
  transaccion,
  idCarteraFija = null,
  idUsuarioFija = null,
  onCerrar,
  onGuardado,
}: TransaccionFormProps) {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();

  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [idCartera, setIdCartera] = useState(0);
  const [idUsuario, setIdUsuario] = useState(0);
  const [idCategoriaGasto, setIdCategoriaGasto] = useState(1);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [nota, setNota] = useState('');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const carterasDisponibles = useMemo(() => {
    if (idCarteraFija) return carteras.filter((c) => c.idCartera === idCarteraFija);
    const id = usuario?.idUsuario ?? 0;
    return carteras.filter(
      (c) => c.estado === 'activa' && (c.idPropietario === id || miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === id)),
    );
  }, [carteras, miembros, usuario, idCarteraFija]);

  const miembrosDe = (idCarteraSel: number) =>
    miembros
      .filter((m) => m.idCartera === idCarteraSel)
      .map((m) => usuarios.find((u) => u.idUsuario === m.idUsuario))
      .filter((u): u is NonNullable<typeof u> => u !== undefined);

  const nombreCarteraFija = carteras.find((c) => c.idCartera === idCarteraFija)?.nombreCartera ?? '';

  useEffect(() => {
    if (!abierto) return;
    setTocados({});
    if (transaccion) {
      setTipo(transaccion.tipo);
      setIdCartera(transaccion.idCartera);
      setIdUsuario(transaccion.idUsuario);
      setIdCategoriaGasto(transaccion.idCategoriaGasto);
      setMonto(String(transaccion.monto));
      setFecha(transaccion.fecha);
      setMetodoPago(transaccion.metodoPago);
      setNota(transaccion.nota);
      return;
    }
    const primeraCartera = idCarteraFija ?? carterasDisponibles[0]?.idCartera ?? 0;
    const primerMiembro =
      idUsuarioFija ?? miembros.find((m) => m.idCartera === primeraCartera)?.idUsuario ?? 0;
    setTipo('gasto');
    setIdCartera(primeraCartera);
    setIdUsuario(primerMiembro);
    setIdCategoriaGasto(1);
    setMonto('');
    setFecha(hoyISO());
    setMetodoPago('efectivo');
    setNota('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, transaccion, idCarteraFija, idUsuarioFija]);

  const cambiarCartera = (nueva: number) => {
    setIdCartera(nueva);
    const primerMiembro = miembros.find((m) => m.idCartera === nueva);
    if (primerMiembro) setIdUsuario(primerMiembro.idUsuario);
  };

  const montoNumero = Number(monto);
  const montoInvalido = Boolean(tocados.monto) && (!monto || montoNumero < 1);
  const fechaInvalida = Boolean(tocados.fecha) && !fecha;
  const notaInvalida = Boolean(tocados.nota) && nota.trim().length < 3;

  const guardar = () => {
    setTocados({ monto: true, fecha: true, nota: true });
    if (!monto || montoNumero < 1 || !fecha || nota.trim().length < 3 || !idCartera || !idUsuario) return;

    const categoria = CATEGORIAS_GASTO.find((c) => c.idCategoriaGasto === idCategoriaGasto);
    const datos = {
      idCartera: Number(idCartera),
      idUsuario: Number(idUsuario),
      idCategoriaGasto: tipo === 'ingreso' ? 10 : Number(idCategoriaGasto),
      nombreGasto: tipo === 'ingreso' ? 'Aportación' : (categoria?.nombreGasto ?? 'Otros gastos'),
      tipo,
      monto: montoNumero,
      fecha,
      metodoPago,
      nota: nota.trim(),
    };

    if (transaccion) {
      useTransaccionesStore.getState().actualizar(transaccion.idTransaccion, datos);
      onGuardado({ ...transaccion, ...datos });
      return;
    }
    onGuardado(useTransaccionesStore.getState().crear(datos));
  };

  return (
    <Modal
      abierto={abierto}
      titulo={transaccion ? 'Editar movimiento' : 'Registrar movimiento'}
      subtitulo="Los ingresos representan aportaciones al fondo; los gastos son consumos de la cartera."
      onCerrar={onCerrar}
      footer={
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="inherit" onClick={onCerrar} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardar} startIcon={<Icon name="check" size={16} />}>
            {transaccion ? 'Guardar cambios' : 'Registrar movimiento'}
          </Button>
        </Box>
      }
    >
      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        {/* Tipo */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, borderRadius: 4, bgcolor: '#f1f5f9', p: 0.75 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setTipo('gasto')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 3,
              border: 'none',
              px: 2,
              py: 1.25,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              bgcolor: tipo === 'gasto' ? '#ffffff' : 'transparent',
              color: tipo === 'gasto' ? '#e11d48' : '#64748b',
              boxShadow: tipo === 'gasto' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
            }}
          >
            <Icon name="cart" size={16} />
            Gasto
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => setTipo('ingreso')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 3,
              border: 'none',
              px: 2,
              py: 1.25,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              bgcolor: tipo === 'ingreso' ? '#ffffff' : 'transparent',
              color: tipo === 'ingreso' ? '#0d6945' : '#64748b',
              boxShadow: tipo === 'ingreso' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
            }}
          >
            <Icon name="trend-up" size={16} />
            Ingreso
          </Box>
        </Box>

        {/* Cartera */}
        {idCarteraFija ? (
          <Box sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', px: 1.75, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Cartera</Typography>
            <Typography sx={{ mt: 0.25, fontSize: 14, fontWeight: 700 }}>{nombreCarteraFija}</Typography>
          </Box>
        ) : (
          <TextField
            id="idCartera"
            select
            label="Cartera"
            value={idCartera}
            onChange={(e) => cambiarCartera(Number(e.target.value))}
          >
            {carterasDisponibles.map((cartera) => (
              <MenuItem key={cartera.idCartera} value={cartera.idCartera}>
                {cartera.nombreCartera}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            id="idUsuario"
            select
            label="Responsable"
            value={idUsuario}
            onChange={(e) => setIdUsuario(Number(e.target.value))}
          >
            {miembrosDe(idCartera).map((miembro) => (
              <MenuItem key={miembro.idUsuario} value={miembro.idUsuario}>
                {miembro.nombreUsuario} {miembro.APaterno}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="monto"
            label="Monto (MXN)"
            type="number"
            placeholder="850"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onBlur={() => setTocados((t) => ({ ...t, monto: true }))}
            error={montoInvalido}
            helperText={montoInvalido ? 'Ingresa un monto mayor a cero.' : ' '}
            slotProps={{ htmlInput: { min: 1, step: 10 } }}
          />
        </Box>

        {tipo === 'gasto' && (
          <TextField
            id="categoria"
            select
            label="Categoría del gasto"
            value={idCategoriaGasto}
            onChange={(e) => setIdCategoriaGasto(Number(e.target.value))}
          >
            {CATEGORIAS_GASTO.map((categoria) => (
              <MenuItem key={categoria.idCategoriaGasto} value={categoria.idCategoriaGasto}>
                {categoria.nombreGasto}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            id="fecha"
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            onBlur={() => setTocados((t) => ({ ...t, fecha: true }))}
            error={fechaInvalida}
            helperText={fechaInvalida ? 'Selecciona la fecha del movimiento.' : ' '}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            id="metodoPago"
            select
            label="Método de pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
          >
            {METODOS.map((metodo) => (
              <MenuItem key={metodo.valor} value={metodo.valor}>
                {metodo.etiqueta}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          id="nota"
          label="Descripción"
          placeholder="Despensa de la semana"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={() => setTocados((t) => ({ ...t, nota: true }))}
          error={notaInvalida}
          helperText={notaInvalida ? 'Agrega una descripción breve.' : ' '}
        />
      </Box>
    </Modal>
  );
}
