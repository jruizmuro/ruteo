import { describe, expect, it, vi } from 'vitest'
import { useRouteGenerator } from '../../../app/composables/useRouteGenerator'
import type { IRoute } from '../../../shared/types'

const MOCK_ROUTE: IRoute = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Variante 1',
  profile: 'foot-walking',
  geometry: [
    [-3.703, 40.416],
    [-3.71, 40.42],
    [-3.703, 40.416],
  ],
  stats: { distanceKm: 10, elevationGainM: 200, estimatedMinutes: 90 },
  createdAt: '2024-01-01T00:00:00.000Z',
}

const VALID_INPUT = {
  profile: 'foot-walking' as const,
  startPoint: [-3.703, 40.416] as [number, number],
  distanceKm: 10,
  elevationM: 200,
}

describe('useRouteGenerator', () => {
  it('devuelve IRoute[] y resetea loading en happy path', async () => {
    const variants = [
      MOCK_ROUTE,
      { ...MOCK_ROUTE, id: '550e8400-e29b-41d4-a716-446655440001', name: 'Variante 2' },
      { ...MOCK_ROUTE, id: '550e8400-e29b-41d4-a716-446655440002', name: 'Variante 3' },
    ]
    const fetchFn = vi.fn().mockResolvedValue(variants)
    const { generate, loading, error } = useRouteGenerator(fetchFn)

    const result = await generate(VALID_INPUT)

    expect(result).toHaveLength(3)
    expect(result[0]!.name).toBe('Variante 1')
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('llama a $fetch con el endpoint correcto y el body del input', async () => {
    const fetchFn = vi.fn().mockResolvedValue([MOCK_ROUTE])
    const { generate } = useRouteGenerator(fetchFn)

    await generate(VALID_INPUT)

    expect(fetchFn).toHaveBeenCalledWith('/api/routes/generate', {
      method: 'POST',
      body: VALID_INPUT,
    })
  })

  it('devuelve array vacío cuando el servidor responde con []', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])
    const { generate, loading, error } = useRouteGenerator(fetchFn)

    const result = await generate(VALID_INPUT)

    expect(result).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('establece error y rethrow cuando $fetch lanza un Error', async () => {
    const networkError = new Error('Network failure')
    const fetchFn = vi.fn().mockRejectedValue(networkError)
    const { generate, loading, error } = useRouteGenerator(fetchFn)

    await expect(generate(VALID_INPUT)).rejects.toThrow('Network failure')

    expect(error.value).toBe('Network failure')
    expect(loading.value).toBe(false)
  })

  it('establece error genérico cuando $fetch lanza un valor no-Error', async () => {
    const fetchFn = vi.fn().mockRejectedValue('timeout')
    const { generate, error } = useRouteGenerator(fetchFn)

    await expect(generate(VALID_INPUT)).rejects.toBe('timeout')

    expect(error.value).toBe('Error desconocido')
  })
})
