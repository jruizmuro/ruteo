import { describe, expect, it } from 'vitest'
import {
  CoordinateSchema,
  GenerateRouteInputSchema,
  RouteFiltersSchema,
  RouteSchema,
  RouteStatsSchema,
  TransportProfileSchema,
} from '../../../shared/schemas/route'

describe('TransportProfileSchema', () => {
  it('acepta perfiles válidos', () => {
    const perfiles = ['foot-walking', 'cycling-road', 'cycling-mountain', 'cycling-electric']
    for (const p of perfiles) {
      expect(TransportProfileSchema.parse(p)).toBe(p)
    }
  })

  it('rechaza un perfil desconocido', () => {
    expect(() => TransportProfileSchema.parse('running')).toThrow()
  })
})

describe('CoordinateSchema', () => {
  it('acepta una coordenada válida', () => {
    expect(CoordinateSchema.parse([2.154, 41.39])).toEqual([2.154, 41.39])
  })

  it('rechaza longitud fuera de rango', () => {
    expect(() => CoordinateSchema.parse([181, 41.39])).toThrow()
  })

  it('rechaza latitud fuera de rango', () => {
    expect(() => CoordinateSchema.parse([2.154, -91])).toThrow()
  })
})

describe('GenerateRouteInputSchema', () => {
  const base = {
    profile: 'foot-walking' as const,
    startPoint: [2.154, 41.39] as [number, number],
    distanceKm: 10,
    elevationM: 200,
  }

  it('acepta un input válido', () => {
    expect(GenerateRouteInputSchema.parse(base)).toEqual(base)
  })

  it('rechaza distancia por debajo del mínimo (< 1km)', () => {
    expect(() => GenerateRouteInputSchema.parse({ ...base, distanceKm: 0.5 })).toThrow()
  })

  it('rechaza distancia por encima del máximo (> 200km)', () => {
    expect(() => GenerateRouteInputSchema.parse({ ...base, distanceKm: 201 })).toThrow()
  })

  it('rechaza desnivel negativo', () => {
    expect(() => GenerateRouteInputSchema.parse({ ...base, elevationM: -1 })).toThrow()
  })

  it('rechaza desnivel por encima del máximo (> 5000m)', () => {
    expect(() => GenerateRouteInputSchema.parse({ ...base, elevationM: 5001 })).toThrow()
  })
})

describe('RouteStatsSchema', () => {
  it('acepta stats válidas', () => {
    const stats = { distanceKm: 10, elevationGainM: 200, estimatedMinutes: 90 }
    expect(RouteStatsSchema.parse(stats)).toEqual(stats)
  })

  it('rechaza valores negativos', () => {
    expect(() => RouteStatsSchema.parse({ distanceKm: -1, elevationGainM: 0, estimatedMinutes: 0 })).toThrow()
  })

  it('acepta valores en cero', () => {
    expect(RouteStatsSchema.parse({ distanceKm: 0, elevationGainM: 0, estimatedMinutes: 0 })).toBeDefined()
  })
})

describe('RouteSchema', () => {
  const base = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Ruta del Tibidabo',
    profile: 'cycling-road' as const,
    geometry: [
      [2.154, 41.39],
      [2.16, 41.4],
    ] as [number, number][],
    stats: { distanceKm: 10, elevationGainM: 200, estimatedMinutes: 40 },
    createdAt: '2025-01-01T00:00:00.000Z',
  }

  it('acepta una ruta válida', () => {
    expect(RouteSchema.parse(base)).toEqual(base)
  })

  it('rechaza un UUID inválido', () => {
    expect(() => RouteSchema.parse({ ...base, id: 'no-es-uuid' })).toThrow()
  })

  it('rechaza geometry con menos de 2 puntos', () => {
    expect(() => RouteSchema.parse({ ...base, geometry: [[2.154, 41.39]] })).toThrow()
  })

  it('rechaza nombre vacío', () => {
    expect(() => RouteSchema.parse({ ...base, name: '' })).toThrow()
  })
})

describe('RouteFiltersSchema', () => {
  it('acepta un objeto vacío (todos los campos son opcionales)', () => {
    expect(RouteFiltersSchema.parse({})).toEqual({})
  })

  it('acepta filtros válidos parciales', () => {
    const filtros = { profile: 'foot-walking' as const, minDistanceKm: 5 }
    expect(RouteFiltersSchema.parse(filtros)).toEqual(filtros)
  })

  it('rechaza maxDistanceKm por encima del límite', () => {
    expect(() => RouteFiltersSchema.parse({ maxDistanceKm: 201 })).toThrow()
  })
})
