import {Box, Paper, Typography} from '@mui/material'
import { formatearMonto } from '../../../utils/formato.js'

function TarjetaResumen({etiqueta, monto, Icono, fondo}){
    return(
        <Paper
        elevation={0}
        sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            border: '1px solid var(--color-borde)',
            borderRadius: '16px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}  
        >
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>

                <Typography
                variant='body2'
                sx={{ color: 'var(--color-texto-terciario)'}}
                >
                    {etiqueta}
                </Typography>
                <Typography variant='h2'>
                    {formatearMonto(monto)}
                </Typography>
            </Box>

            <Box 
            sx={{
                width: 44,
                height: 44, 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: fondo, 
                color: 'var(--color-primario)',
                flexShrink: 0,
            }}
            >
                {Icono && <Icono sx={{fontSize: 20}} />}
            </Box>
        </Paper>
    )
}

export default TarjetaResumen