import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCapacitor } from '../../../app/composables/useCapacitor'

describe('ILocationProvider — getCurrentPosition', () => {
  it('resuelve con lat y lng cuando geolocation tiene éxito', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({ coords: { latitude: 41.39, longitude: 2.154 } } as GeolocationPosition),
        ),
      },
      configurable: true,
    })
    const { getCurrentPosition } = useCapacitor()
    const pos = await getCurrentPosition()
    expect(pos).toEqual({ lat: 41.39, lng: 2.154 })
  })

  it('rechaza cuando geolocation falla', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_: PositionCallback, error: PositionErrorCallback) =>
          error({ code: 1, message: 'Permission denied' } as GeolocationPositionError),
        ),
      },
      configurable: true,
    })
    const { getCurrentPosition } = useCapacitor()
    await expect(getCurrentPosition()).rejects.toBeDefined()
  })

  it('mapea correctamente latitude→lat y longitude→lng', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({ coords: { latitude: 51.5074, longitude: -0.1278 } } as GeolocationPosition),
        ),
      },
      configurable: true,
    })
    const { getCurrentPosition } = useCapacitor()
    const pos = await getCurrentPosition()
    expect(pos.lat).toBe(51.5074)
    expect(pos.lng).toBe(-0.1278)
  })
})

describe('IFileSaver — saveFile', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('dispara el click en el enlace de descarga', async () => {
    const anchor = document.createElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

    const { saveFile } = useCapacitor()
    await saveFile('ruta.gpx', '<gpx/>')
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('asigna el nombre de archivo al atributo download', async () => {
    const anchor = document.createElement('a')
    vi.spyOn(anchor, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

    const { saveFile } = useCapacitor()
    await saveFile('mi-ruta.gpx', 'contenido')
    expect(anchor.download).toBe('mi-ruta.gpx')
  })

  it('revoca la URL del objeto tras la descarga', async () => {
    const anchor = document.createElement('a')
    vi.spyOn(anchor, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

    const { saveFile } = useCapacitor()
    await saveFile('ruta.gpx', 'contenido')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

describe('IShareProvider — shareRoute', () => {
  it('usa navigator.share cuando está disponible', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true })

    const { shareRoute } = useCapacitor()
    await shareRoute('Ruta del Tibidabo', 'https://ruteo.app/routes/1')
    expect(shareMock).toHaveBeenCalledWith({
      title: 'Ruta del Tibidabo',
      url: 'https://ruteo.app/routes/1',
    })
  })

  it('usa clipboard.writeText como fallback cuando navigator.share no existe', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    })

    const { shareRoute } = useCapacitor()
    await shareRoute('Ruta', 'https://ruteo.app/routes/2')
    expect(writeTextMock).toHaveBeenCalledWith('https://ruteo.app/routes/2')
  })

  it('propaga el error si navigator.share falla', async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error('Share cancelled'))
    Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true })

    const { shareRoute } = useCapacitor()
    await expect(shareRoute('Ruta', 'https://ruteo.app/routes/3')).rejects.toThrow('Share cancelled')
  })
})

describe('IHapticsProvider — hapticSuccess', () => {
  it('es callable sin lanzar errores', () => {
    const { hapticSuccess } = useCapacitor()
    expect(() => hapticSuccess()).not.toThrow()
  })

  it('devuelve undefined (no-op)', () => {
    const { hapticSuccess } = useCapacitor()
    expect(hapticSuccess()).toBeUndefined()
  })

  it('puede llamarse múltiples veces sin efectos secundarios', () => {
    const { hapticSuccess } = useCapacitor()
    expect(() => {
      hapticSuccess()
      hapticSuccess()
      hapticSuccess()
    }).not.toThrow()
  })
})
