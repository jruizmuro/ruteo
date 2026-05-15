import { describe, expect, it } from 'vitest'
import { DISTANCE, ELEVATION, TRANSPORT_PROFILES } from '../../../shared/constants/transport'

describe('TRANSPORT_PROFILES', () => {
  it('contiene los 4 perfiles de transporte', () => {
    expect(TRANSPORT_PROFILES).toHaveLength(4)
    expect(TRANSPORT_PROFILES).toContain('foot-walking')
    expect(TRANSPORT_PROFILES).toContain('cycling-road')
    expect(TRANSPORT_PROFILES).toContain('cycling-mountain')
    expect(TRANSPORT_PROFILES).toContain('cycling-electric')
  })

  it('contiene exactamente los 4 perfiles en el orden definido', () => {
    expect([...TRANSPORT_PROFILES]).toEqual([
      'foot-walking',
      'cycling-road',
      'cycling-mountain',
      'cycling-electric',
    ])
  })
})

describe('DISTANCE', () => {
  it('tiene los límites correctos', () => {
    expect(DISTANCE.MIN_KM).toBe(1)
    expect(DISTANCE.MAX_KM).toBe(200)
  })

  it('el mínimo es menor que el máximo', () => {
    expect(DISTANCE.MIN_KM).toBeLessThan(DISTANCE.MAX_KM)
  })
})

describe('ELEVATION', () => {
  it('tiene los límites correctos', () => {
    expect(ELEVATION.MIN_M).toBe(0)
    expect(ELEVATION.MAX_M).toBe(5000)
  })

  it('el mínimo es menor que el máximo', () => {
    expect(ELEVATION.MIN_M).toBeLessThan(ELEVATION.MAX_M)
  })
})
