import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCarteras, useCarterasStore, useMiembros, useUsuariosDisponibles } from '../../stores/carteras';
import { useUsuariosStore } from '../../stores/usuarios';
import { nombreCompleto } from '../../utils/format';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/ui';

export interface MiembroFormProps {
  abierto: boolean;
  /** Si viene, la cartera destino queda fija (no se muestra selector) */
  idCartera?: number | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

type Modo = 'existente' | 'nuevo';

export function MiembroForm({ abierto, idCartera = null, onCerrar, onGuardado }: MiembroFormProps) {
  const carteras = useCarteras();
  const miembros = useMiembros();

  const [carteraElegida, setCarteraElegida] = useState(0);
  const [modo, setModo] = useState<Modo>('existente');
  const [idUsuario, setIdUsuario] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [APaterno, setAPaterno] = useState('');
  const [AMaterno, setAMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [aporte, setAporte] = useState('');
  const [error, setError] = useState('');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const carterasActivas = useMemo(
    () => carteras.filter((c) => c.estado === 'activa'),
    [carteras],
  );

  const disponibles = useUsuariosDisponibles(carteraElegida);
  const nombreCarteraFija = carteras.find((c) => c.idCartera === idCartera)?.nombreCartera ?? '';

  useEffect(() => {
    if (!abierto) return;
    const inicial = idCartera ?? carterasActivas[0]?.idCartera ?? 0;
    setCarteraElegida(inicial);
    setModo('existente');
    setIdUsuario(0);
    setNombreUsuario('');
    setAPaterno('');
    setAMaterno('');
    setCorreo('');
    setTelefono('');
    setAporte('');
    setError('');
    setTocados({});
  }, [abierto, idCartera, carterasActivas]);

  useEffect(() => {
    if (!disponibles.length) {
      setIdUsuario(0);
      return;
    }
    if (!disponibles.some((u) => u.idUsuario === idUsuario)) setIdUsuario(disponibles[0].idUsuario);
  }, [disponibles, idUsuario]);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const marcar = (campo: string) => () => setTocados((t) => ({ ...t, [campo]: true }));

  const guardar = () => {
    setError('');
    if (!carteraElegida) return;

    const aporteNumero = aporte ? Number(aporte) : null;
    const store = useCarterasStore.getState();

    if (modo === 'existente') {
      if (!idUsuario) {
        setError('Selecciona un usuario registrado para agregarlo a la cartera.');
        return;
      }
      store.crearMiembro(carteraElegida, idUsuario, 'miembro', aporteNumero);
      onGuardado();
      return;
    }

    setTocados({ nombreUsuario: true, APaterno: true, correo: true });
    if (!nombreUsuario.trim() || !APaterno.trim() || !correoValido) return;

    if (useUsuariosStore.getState().usuarios.some((u) => u.correo.toLowerCase() === correo.trim().toLowerCase())) {
      setError('Ese correo ya tiene una cuenta registrada.');
      return;
    }

    const usuario = useUsuariosStore.getState().registrarNuevo({
      nombreUsuario: nombreUsuario.trim(),
      APaterno: APaterno.trim(),
      AMaterno: AMaterno.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
    });
    store.crearMiembro(carteraElegida, usuario.idUsuario, 'miembro', aporteNumero);
    onGuardado();
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Agregar contribuyente"
      subtitulo="Puedes invitar a un usuario registrado o registrar a una persona nueva en la cartera."
      onCerrar={onCerrar}
      footer={
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="inherit" onClick={onCerrar} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardar} startIcon={<Icon name="check" size={16} />}>
            Agregar a la cartera
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
        {idCartera ? (
          <Box sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', px: 1.75, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Cartera destino</Typography>
            <Typography sx={{ mt: 0.25, fontSize: 14, fontWeight: 700 }}>{nombreCarteraFija}</Typography>
          </Box>
        ) : (
          <TextField
            id="cartera"
            select
            label="Cartera"
            value={carteraElegida}
            onChange={(e) => setCarteraElegida(Number(e.target.value))}
          >
            {carterasActivas.map((cartera) => (
              <MenuItem key={cartera.idCartera} value={cartera.idCartera}>
                {cartera.nombreCartera}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, borderRadius: 4, bgcolor: '#f1f5f9', p: 0.75 }}>
          {(
            [
              { clave: 'existente' as Modo, etiqueta: 'Usuario registrado' },
              { clave: 'nuevo' as Modo, etiqueta: 'Persona nueva' },
            ] as const
          ).map((tab) => (
            <Box
              key={tab.clave}
              component="button"
              type="button"
              onClick={() => { setModo(tab.clave); setError(''); }}
              sx={{
                borderRadius: 3,
                border: 'none',
                px: 2,
                py: 1.25,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: modo === tab.clave ? '#ffffff' : 'transparent',
                color: modo === tab.clave ? '#0f172a' : '#64748b',
                boxShadow: modo === tab.clave ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              }}
            >
              {tab.etiqueta}
            </Box>
          ))}
        </Box>

        {modo === 'existente' ? (
          disponibles.length > 0 ? (
            <Box>
              <TextField
                id="idUsuario"
                select
                label="Usuario"
                value={idUsuario}
                onChange={(e) => setIdUsuario(Number(e.target.value))}
                helperText="Solo se muestran usuarios que aún no pertenecen a la cartera."
                fullWidth
              >
                {disponibles.map((u) => (
                  <MenuItem key={u.idUsuario} value={u.idUsuario}>
                    {nombreCompleto(u)} · {u.correo}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ) : (
            <Box sx={{ borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', px: 2, py: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Todos los usuarios ya están en esta cartera</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: '#64748b' }}>Cambia a “Persona nueva” para registrar a alguien más.</Typography>
            </Box>
          )
        ) : (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              id="nombreUsuario"
              label="Nombre"
              placeholder="María"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              onBlur={marcar('nombreUsuario')}
              error={Boolean(tocados.nombreUsuario) && !nombreUsuario.trim()}
              helperText={Boolean(tocados.nombreUsuario) && !nombreUsuario.trim() ? 'Escribe el nombre.' : ' '}
            />
            <TextField
              id="APaterno"
              label="Apellido paterno"
              placeholder="López"
              value={APaterno}
              onChange={(e) => setAPaterno(e.target.value)}
              onBlur={marcar('APaterno')}
              error={Boolean(tocados.APaterno) && !APaterno.trim()}
              helperText={Boolean(tocados.APaterno) && !APaterno.trim() ? 'Escribe el apellido paterno.' : ' '}
            />
            <TextField id="AMaterno" label="Apellido materno" placeholder="Ríos" value={AMaterno} onChange={(e) => setAMaterno(e.target.value)} />
            <TextField
              id="correo"
              label="Correo electrónico"
              type="email"
              placeholder="maria@correo.mx"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onBlur={marcar('correo')}
              error={Boolean(tocados.correo) && !correoValido}
              helperText={Boolean(tocados.correo) && !correoValido ? 'Ingresa un correo válido.' : ' '}
            />
            <TextField id="telefono" label="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Box>
        )}

        <TextField
          id="aporte"
          label="Aporte comprometido (MXN, opcional)"
          type="number"
          placeholder="5000"
          value={aporte}
          onChange={(e) => setAporte(e.target.value)}
          helperText="Es informativo: sirve como referencia de ahorro."
          slotProps={{ htmlInput: { min: 0, step: 100 } }}
        />

        {error && (
          <Box sx={{ borderRadius: 3, border: '1px solid #fecdd3', bgcolor: '#fff1f2', px: 1.75, py: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#be123c' }}>{error}</Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
