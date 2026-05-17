import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRouteStore } from '../../../app/stores/useRouteStore'
import type { IRoute } from '../../../shared/types'

function makeRoute(overrides: Partial<IRoute> = {}): IRoute {
  return {
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
    ...overrides,
  }
}

const VARIANTS: IRoute[] = [
  makeRoute({ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Variante 1' }),
  makeRoute({ id: '550e8400-e29b-41d4-a716-446655440001', name: 'Variante 2' }),
  makeRoute({ id: '550e8400-e29b-41d4-a716-446655440002', name: 'Variante 3' }),
]

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('setVariants', () => {
  it('almacena las variantes y resetea la selección', () => {
    const store = useRouteStore()
    store.selectVariant(0)

    store.setVariants(VARIANTS)

    expect(store.variants).toHaveLength(3)
    expect(store.selectedIndex).toBeNull()
    expect(store.selectedRoute).toBeNull()
  })

  it('acepta un array vacío sin errores', () => {
    const store = useRouteStore()
    store.setVariants([])

    expect(store.variants).toHaveLength(0)
    expect(store.selectedRoute).toBeNull()
  })
})

describe('selectVariant', () => {
  it('selectedRoute devuelve la variante correcta al seleccionar por índice', () => {
    const store = useRouteStore()
    store.setVariants(VARIANTS)

    store.selectVariant(1)

    expect(store.selectedIndex).toBe(1)
    expect(store.selectedRoute?.name).toBe('Variante 2')
  })

  it('selectedRoute es null antes de cualquier selección', () => {
    const store = useRouteStore()
    store.setVariants(VARIANTS)

    expect(store.selectedRoute).toBeNull()
  })

  it('selectedRoute es null cuando el índice está fuera de rango', () => {
    const store = useRouteStore()
    store.setVariants(VARIANTS)

    store.selectVariant(99)

    expect(store.selectedRoute).toBeNull()
  })
})

describe('reset', () => {
  it('limpia variantes, selección y computed', () => {
    const store = useRouteStore()
    store.setVariants(VARIANTS)
    store.selectVariant(0)

    store.reset()

    expect(store.variants).toHaveLength(0)
    expect(store.selectedIndex).toBeNull()
    expect(store.selectedRoute).toBeNull()
  })
})
