import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useAutenticado } from '../stores/auth';
import { Icon } from '../components/Icon';

export default function NoEncontrado() {
  const autenticado = useAutenticado();
  const navigate = useNavigate();
  const destino = autenticado ? '/app/carteras' : '/';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          bgcolor: '#0f172a',
          color: '#ffffff',
        }}
      >
        <Icon name="alert" size={30} />
      </Box>
      <Typography sx={{ mt: 3, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0d6945' }}>
        Error 404
      </Typography>
      <Typography component="h1" sx={{ mt: 1, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
        Esta página no existe
      </Typography>
      <Typography sx={{ mt: 1.5, maxWidth: 420, fontSize: 14, color: '#64748b' }}>
        Revisa la dirección o regresa al panel para seguir administrando tus carteras.
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <Button component={Link} to={destino} variant="contained" startIcon={<Icon name="arrow-left" size={16} />}>
          {autenticado ? 'Ir al panel' : 'Volver al inicio'}
        </Button>
        <Button variant="outlined" color="inherit" sx={{ borderColor: '#cbd5e1', color: '#334155' }} onClick={() => navigate(-1)}>
          Página anterior
        </Button>
      </Box>
    </Box>
  );
}
