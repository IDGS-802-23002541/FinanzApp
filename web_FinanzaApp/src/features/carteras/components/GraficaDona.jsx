import {Box, Paper, Stack, Typography} from '@mui/material'
import { formatearMonto } from '../../../utils/formato.js'

const COLORES = [
    'var(--color-primario)',
    'var(--color-secundario)',
    'var(--color-acento)',
    'var(--color-error)',
    'var(--color-info)',
    'var(--color-texto-terciario)',
]

const RADIO = 70 
const CIRCUNFERENCIA = 2 * Math.PI * RADIO 

function GraficaDona({titulo, datos}){
    const total = datos.reduce((suma, fila) => suma + fila.total, 0)

    const largos = datos.map((fila) =>
        total > 0 ? (fila.total / total) * CIRCUNFERENCIA : 0,
    )

    const segmentos = datos.map((fila, indice) => ({
        ...fila,
        color: COLORES[indice % COLORES.length],
        largo: largos[indice],
        desplazamiento: -largos
            .slice(0, indice)
            .reduce((suma, largo) => suma + largo, 0),
    }))
    return(
        <Paper 
        elevation={0}
        sx={{
            p:2.5,
            border: '1px solid var(--color-borde)',
            borderRadius: '16px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
        >
            <Typography variant='subtitle2' sx={{ fontWeight:700}}>
                {titulo}
            </Typography>
            {total === 0 ? (
                <Typography
                variant='body2'
                sx={{ mt: 3, color: 'var(--color-texto-secundario)'}}
                >
                    Sin transacciones todavía.
                </Typography>
            ): (
                <Stack 
                direction={{ xs: 'column', md: 'row'}}
                spacing={3}
                sx={{mt: 2, alignItems: 'center'}}
                >
                    <Box
                    sx={{
                        position: 'relative',
                        width: 176,
                        height: 176,
                        flexShrink: 0,
                    }}
                    >
                        <Box
                        component="svg"
                        viewBox="0 0 176 176"
                        sx={{width: '100%', height: '100%', transform:'rotate(-90deg)'}}
                        >
                            {segmentos.map((segmento) => (
                                <circle 
                                key={segmento.nombre}
                                cx="88"
                                cy="88"
                                r={RADIO}
                                fill='none'
                                stroke={segmento.color}
                                strokeWidth="16"
                                strokeDasharray={`${segmento.largo} ${CIRCUNFERENCIA}`}
                                    strokeDashoffset={segmento.desplazamiento}
                                />
                            ))}
                        </Box>
                        <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        >
                        
                        <Typography
                        variant='caption'
                        sx={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.08rem',
                            color: 'var(--color-texto-terciario)',
                        }}
                        >
                            GASTADO
                        </Typography>
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>
                            {formatearMonto(total)}
                        </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={1} sx={{width: '100%'}}>
                        {segmentos.map((segmento) => (
                            <Box 
                            key={segmento.nombre}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1}}
                            >
                                <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: segmento.color,
                                    flexShrink: 0,
                                }}  
                                />
                                <Typography
                                    noWrap
                                    variant="caption"
                                    sx={{ flex: 1, color: 'var(--color-texto-secundario)' }}
                                >
                                {segmento.nombre}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {formatearMonto(segmento.total)}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        width: 36,
                                        textAlign: 'right',
                                        color: 'var(--color-texto-terciario)',
                                    }}
                                >
                                {Math.round((segmento.total / total) * 100)}%
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            )}
        </Paper>
    )
}

export default GraficaDona