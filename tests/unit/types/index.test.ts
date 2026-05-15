import { describe, expect, it } from 'vitest'
import type { IRoute, IRouteFilters, IRouteStats } from '../../../shared/types'

describe('IRouteStats', () => {
  it('acepta un objeto con la forma correcta', () => {
    const stats: IRouteStats = { distanceKm: 10, elevationGainM: 200, estimatedMinutes: 60 }
    expect(stats.distanceKm).toBe(10)
    expect(stats.elevationGainM).toBe(200)
    expect(stats.estimatedMinutes).toBe(60)
  })
})

describe('IRoute', () => {
  it('acepta una ruta completa', () => {
    const route: IRoute = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Ruta del Tibidabo',
      profile: 'cycling-road',
      geometry: [
        [2.154, 41.39],
        [2.16, 41.4],
      ],
      stats: { distanceKm: 10, elevationGainM: 200, estimatedMinutes: 40 },
      createdAt: '2025-01-01T00:00:00.000Z',
    }
    expect(route.id).toBeDefined()
    expect(route.geometry).toHaveLength(2)
  })
})

describe('IRouteFilters', () => {
  it('acepta un objeto vacío (todos los campos opcionales)', () => {
    const filters: IRouteFilters = {}
    expect(filters).toEqual({})
  })

  it('acepta filtros parciales', () => {
    const filters: IRouteFilters = { profile: 'foot-walking', minDistanceKm: 5 }
    expect(filters.profile).toBe('foot-walking')
  })

  it('acepta todos los filtros a la vez', () => {
    const filters: IRouteFilters = {
      profile: 'cycling-mountain',
      minDistanceKm: 10,
      maxDistanceKm: 100,
      minElevationM: 200,
      maxElevationM: 2000,
    }
    expect(Object.keys(filters)).toHaveLength(5)
  })
})
