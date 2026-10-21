import SvgIcon from '@mui/material/SvgIcon'

// Íconos de línea usados en las vistas de autenticación.
export function IconoFlechaIzquierda(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoFlechaDerecha(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoVisibilidad(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5c-4.5 0-8 4.5-8 7s3.5 7 8 7 8-4.5 8-7-3.5-7-8-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </SvgIcon>
  )
}

export function IconoVisibilidadOculto(props) {
  return (
    <SvgIcon {...props}>
      <path d="M2.7 3.7 20.3 21.3l-1.4 1.4-3.2-3.2A9.6 9.6 0 0 1 12 20c-4.5 0-8-4.5-8-8 0-1.6.6-3.2 1.6-4.6L1.3 5.1l1.4-1.4Zm5.4 8.1A4 4 0 0 0 12 16c.9 0 1.7-.3 2.4-.8l-1.5-1.5a2 2 0 0 1-2.6-2.6l-2.2-2.2ZM12 4c4.5 0 8 4.5 8 8 0 1.4-.5 2.8-1.3 4l-2.6-2.6A4 4 0 0 0 10.6 8L8.5 5.9A10 10 0 0 1 12 4Z" />
    </SvgIcon>
  )
}

export function IconoCheck(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}
