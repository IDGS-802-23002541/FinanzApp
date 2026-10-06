import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Cartera } from '../../types/models';
import { CATEGORIAS_CARTERA } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { useCarterasStore } from '../../stores/carteras';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/ui';

export interface CarteraFormProps {
  abierto: boolean;
  /** null = crear */
  cartera: Cartera | null;
  onCerrar: () => void;
  onGuardado: (cartera: Cartera) => void;
}

const COLORES = ['#0d6945', '#2563eb', '#7c3aed', '#d97706', '#0891b2', '#e11d48', '#4f46e5', '#65a30d'];

function ayudaCategoria(categoria: number): string {
  if (categoria === 1) return 'Ideal para gastos recurrentes del hogar.';
  if (categoria === 2) return 'Permite registrar fecha de inicio y fin del viaje.';
  if (categoria === 3) return 'Bodas, posadas, cumpleaños y eventos del grupo.';
  return 'Proyectos y gastos especiales.';
}

export function CarteraForm({ abierto, cartera, onCerrar, onGuardado }: CarteraFormProps) {
  const usuario = useAuthUsuario();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(1);
  const [presupuesto, setPresupuesto] = useState('');
  const [color, setColor] = useState('#0d6945');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tocadoNombre, setTocadoNombre] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setTocadoNombre(false);
    if (cartera) {
      setNombre(cartera.nombreCartera);
      setDescripcion(cartera.descripcion);
      setCategoria(cartera.idCategoriaCartera);
      setPresupuesto(cartera.presupuestoInicial ? String(cartera.presupuestoInicial) : '');
      setColor(cartera.color);
      setFechaInicio(cartera.fechaInicio ?? '');
      setFechaFin(cartera.fechaFin ?? '');
    } else {
      setNombre('');
      setDescripcion('');
      setCategoria(1);
      setPresupuesto('');
      setColor(COLORES[Math.floor(Math.random() * COLORES.length)]);
      setFechaInicio('');
      setFechaFin('');
    }
  }, [abierto, cartera]);

  const esFechas = categoria === 2 || categoria === 3;
  const nombreInvalido = tocadoNombre && nombre.trim().length < 3;

  const guardar = () => {
    if (nombre.trim().length < 3) {
      setTocadoNombre(true);
      return;
    }
    const datos = {
      nombreCartera: nombre.trim(),
      descripcion: descripcion.trim(),
      idCategoriaCartera: Number(categoria),
      presupuestoInicial: presupuesto ? Number(presupuesto) : null,
      color,
      fechaInicio: esFechas && fechaInicio ? fechaInicio : undefined,
      fechaFin: esFechas && fechaFin ? fechaFin : undefined,
    };
    if (cartera) {
      useCarterasStore.getState().actualizar(cartera.idCartera, datos);
      onGuardado({ ...cartera, ...datos });
      return;
    }
    const propietario = usuario?.idUsuario ?? 1;
    onGuardado(useCarterasStore.getState().crear(datos, propietario));
  };

  return (
    <Modal
      abierto={abierto}
      titulo={cartera ? 'Editar cartera' : 'Nueva cartera'}
      subtitulo="Define la categoría, el presupuesto y el color de identificación."
      onCerrar={onCerrar}
      footer={
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="inherit" onClick={onCerrar} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardar} startIcon={<Icon name="check" size={16} />}>
            {cartera ? 'Guardar cambios' : 'Crear cartera'}
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
        <TextField
          id="nombreCartera"
          label="Nombre de la cartera"
          placeholder="Viaje a Cancún"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => setTocadoNombre(true)}
          error={nombreInvalido}
          helperText={nombreInvalido ? 'Escribe un nombre de al menos 3 caracteres.' : ' '}
        />

        <TextField
          id="descripcion"
          label="Descripción"
          placeholder="¿Para qué se usará esta cartera?"
          multiline
          minRows={2}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            id="categoria"
            select
            label="Categoría"
            value={categoria}
            onChange={(e) => setCategoria(Number(e.target.value))}
            helperText={ayudaCategoria(categoria)}
          >
            {CATEGORIAS_CARTERA.map((item) => (
              <MenuItem key={item.idCategoriaCartera} value={item.idCategoriaCartera}>
                {item.nombreCategoriaCartera}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="presupuesto"
            label="Presupuesto inicial (MXN)"
            type="number"
            placeholder="15000"
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            helperText="Opcional. Se usa para calcular el avance."
            slotProps={{ htmlInput: { min: 0, step: 100 } }}
          />
        </Box>

        {esFechas && (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              id="fechaInicio"
              label="Fecha de inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              id="fechaFin"
              label="Fecha de fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        )}

        <Box>
          <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 600, color: '#334155' }}>Color de la cartera</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            {COLORES.map((tono) => (
              <Box
                key={tono}
                component="button"
                type="button"
                aria-label={`Seleccionar color ${tono}`}
                onClick={() => setColor(tono)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 3,
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: tono,
                  outline: color === tono ? '2px solid #0f172a' : 'none',
                  outlineOffset: 2,
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
