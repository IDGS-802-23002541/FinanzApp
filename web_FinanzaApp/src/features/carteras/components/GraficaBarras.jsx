import {Box, Paper, Stack, Typography} from '@mui/material'

const formatoCompacto = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    notation: 'compact',
    maximumFractionDigits: 1,
})

function GraficaBarras({titulo, grupos, series}){
    const valores = grupos.flatMap((grupo) => series.map((serie) => grupo.valores[serie.clave] || 0))
    const maximo = Math.max(...valores, 1)
    return(
        <Paper sx={{ p:2.5, border: '1px solid var(--color-borde)', borderRadius: '16px'}}>
            <Typography variant='subtitle2' sx={{fontWeight: 700}}>{titulo}</Typography>

            <Stack direction="row" spacing={2} sx={{mt: 1.5}}>
                {series.map((serie) => (
                    <Box key={serie.clave} sx={{display: 'flex', alignItems:'center', gap:0.75}}>
                        <Box sx={{width:10,
                            height:10,
                            borderRadius: '50%',
                            backgroundColor:serie.color,
                        }}/>
                        <Typography variant='caption' sx={{color: 'var(--color-texto-terciario)'}}>
                            {serie.nombre}
                        </Typography>
                    </Box>
                ))}
            </Stack>

            {grupos.length === 0 ? (
                <Typography variant='body2' sx={{mt: 3, color: 'var(--color-texto-secundario)'}}>
                    Sin transacciones todavía
                </Typography>
            ) : (
                <Box sx={{mt: 2}}>
                    <Box 
                        sx={{
                            display:'flex',
                            alignItems: 'flex-end',
                            height: 200,
                            gap: 1.5,
                            pl: 1,
                        }}
                    >
                        {grupos.map((grupo) => (
                            <Box 
                            key={grupo.etiqueta}
                            sx={{
                                flex:1,
                                height:'100%',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent:'center',
                                gap: 0.5,
                            }}
                            >
                                {series.map((serie) => {
                                    const valor = grupo.valores[serie.clave] || 0
                                    return(
                                        <Box
                                            key={serie.clave}
                                            title={`${serie.nombre}: ${formatoCompacto.format(valor)}`}
                                            sx={{
                                                width:14,
                                                height: `${(valor / maximo) * 100}%`,
                                                minHeight: 2,
                                                backgroundColor: serie.color,
                                                borderRadius: '6px 6px 0 0',
                                            }}
                                        />
                                    )
                                })}
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap:1.5, mt: 1, pl: 1}}>
                        {grupos.map((grupo) => (
                            <Typography
                                key={grupo.etiqueta}
                                variant="caption"
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    color: 'var(--color-texto-terciario)',
                                }}
                            >
                                {grupo.etiqueta}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    )
}

export default GraficaBarras