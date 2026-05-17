import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useMapControls } from '../../../app/composables/useMapControls'

function makeMapMock() {
  return {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    panTo: vi.fn(),
    fitBounds: vi.fn(),
  }
}

describe('zoomIn', () => {
  it('delega a map.zoomIn() cuando el mapa existe', () => {
    const mockMap = makeMapMock()
    const { zoomIn } = useMapControls(ref(mockMap))
    zoomIn()
    expect(mockMap.zoomIn).toHaveBeenCalledOnce()
  })

  it('es no-op cuando map es null', () => {
    const { zoomIn } = useMapControls(ref(null))
    expect(() => zoomIn()).not.toThrow()
  })
})

describe('zoomOut', () => {
  it('delega a map.zoomOut() cuando el mapa existe', () => {
    const mockMap = makeMapMock()
    const { zoomOut } = useMapControls(ref(mockMap))
    zoomOut()
    expect(mockMap.zoomOut).toHaveBeenCalledOnce()
  })

  it('es no-op cuando map es null', () => {
    const { zoomOut } = useMapControls(ref(null))
    expect(() => zoomOut()).not.toThrow()
  })
})

describe('panTo', () => {
  it('delega a map.panTo() con la tupla [lng, lat] correcta', () => {
    const mockMap = makeMapMock()
    const { panTo } = useMapControls(ref(mockMap))
    panTo(2.154, 41.39)
    expect(mockMap.panTo).toHaveBeenCalledWith([2.154, 41.39])
  })

  it('es no-op cuando map es null', () => {
    const { panTo } = useMapControls(ref(null))
    expect(() => panTo(0, 0)).not.toThrow()
  })
})

describe('fitBounds', () => {
  it('delega a map.fitBounds() con los bounds correctos', () => {
    const mockMap = makeMapMock()
    const { fitBounds } = useMapControls(ref(mockMap))
    const bounds: [[number, number], [number, number]] = [
      [-0.1278, 51.5074],
      [2.154, 41.39],
    ]
    fitBounds(bounds)
    expect(mockMap.fitBounds).toHaveBeenCalledWith(bounds)
  })

  it('es no-op cuando map es null', () => {
    const { fitBounds } = useMapControls(ref(null))
    expect(() =>
      fitBounds([
        [-180, -90],
        [180, 90],
      ]),
    ).not.toThrow()
  })

  it('pasa los bounds exactos sin modificarlos', () => {
    const mockMap = makeMapMock()
    const { fitBounds } = useMapControls(ref(mockMap))
    const bounds: [[number, number], [number, number]] = [
      [10, 20],
      [30, 40],
    ]
    fitBounds(bounds)
    expect(mockMap.fitBounds).toHaveBeenCalledWith([
      [10, 20],
      [30, 40],
    ])
  })
})
