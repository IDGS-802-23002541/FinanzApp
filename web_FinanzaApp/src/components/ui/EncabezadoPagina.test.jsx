import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EncabezadoPagina from './EncabezadoPagina.jsx'

describe('EncabezadoPagina', () => {
  it('muestra el título y la descripción', () => {
    render(<EncabezadoPagina titulo="Carteras" descripcion="Tus carteras" />)
    expect(screen.getByText('Carteras')).toBeInTheDocument()
    expect(screen.getByText('Tus carteras')).toBeInTheDocument()
  })

  it('omite la descripción cuando no se envía', () => {
    render(<EncabezadoPagina titulo="Solo título" />)
    expect(screen.getByText('Solo título')).toBeInTheDocument()
    expect(screen.queryByText('Tus carteras')).not.toBeInTheDocument()
  })
})
