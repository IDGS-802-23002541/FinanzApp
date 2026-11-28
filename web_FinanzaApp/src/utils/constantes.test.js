import { describe, expect, it } from 'vitest'
import {
  CONTRASENIA_VALIDA,
  CORREO_VALIDO,
  PANEL_POR_ROL,
  ROLES,
} from './constantes.js'

describe('CONTRASENIA_VALIDA', () => {
  it('acepta mayúscula, número y 8 caracteres', () => {
    expect(CONTRASENIA_VALIDA.test('Finanza1')).toBe(true)
  })

  it('rechaza sin mayúscula, sin número o corta', () => {
    expect(CONTRASENIA_VALIDA.test('finanza1')).toBe(false)
    expect(CONTRASENIA_VALIDA.test('Finanza')).toBe(false)
    expect(CONTRASENIA_VALIDA.test('Fin1')).toBe(false)
  })
})

describe('CORREO_VALIDO', () => {
  it('acepta correos con usuario, dominio y extensión', () => {
    expect(CORREO_VALIDO.test('alumno@escuela.edu.mx')).toBe(true)
  })

  it('rechaza correos incompletos', () => {
    expect(CORREO_VALIDO.test('alumno@escuela')).toBe(false)
    expect(CORREO_VALIDO.test('alumno escuela.mx')).toBe(false)
  })
})

describe('PANEL_POR_ROL', () => {
  it('tiene una pantalla de inicio para cada rol', () => {
    for (const rol of Object.values(ROLES)) {
      expect(PANEL_POR_ROL[rol]).toMatch(/^\//)
    }
  })
})
