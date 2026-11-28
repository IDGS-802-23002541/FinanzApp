import { describe, expect, it } from 'vitest'
import { fechasDePreset, formatearFecha, formatearMonto } from './formato.js'

describe('formatearMonto', () => {
  it('formatea el monto en pesos mexicanos', () => {
    expect(formatearMonto(1234.5)).toContain('1,234.50')
    expect(formatearMonto(1234.5)).toContain('$')
  })

  it('formatea cero', () => {
    expect(formatearMonto(0)).toContain('0.00')
  })
})

describe('formatearFecha', () => {
  it('no mueve el día cuando la fecha viene como YYYY-MM-DD', () => {
    expect(formatearFecha('2026-03-01')).toBe('01/03/2026')
  })

  it('acepta un objeto Date', () => {
    expect(formatearFecha(new Date(2026, 11, 31))).toBe('31/12/2026')
  })
})

describe('fechasDePreset', () => {
  it('devuelve null para "todo" y "personalizado"', () => {
    expect(fechasDePreset('todo')).toBeNull()
    expect(fechasDePreset('personalizado')).toBeNull()
  })

  it('devuelve null para un preset desconocido', () => {
    expect(fechasDePreset('inventado')).toBeNull()
  })

  it('el rango de "mes" termina hoy y abarca 30 días', () => {
    const rango = fechasDePreset('mes')
    expect(rango).toHaveProperty('desde')
    expect(rango).toHaveProperty('hasta')
    const dias = (new Date(rango.hasta) - new Date(rango.desde)) / 86400000
    expect(dias).toBe(30)
  })

  it('el rango de "3m" abarca más días que el de "mes"', () => {
    const mes = new Date(fechasDePreset('mes').desde)
    const tresMeses = new Date(fechasDePreset('3m').desde)
    expect(tresMeses < mes).toBe(true)
  })
})
