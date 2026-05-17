// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { GenerateRouteInputSchema } from '../../../shared/schemas/route'
import { OrsApiError } from '../../../server/utils/ors'

vi.mock('h3', () => ({
  defineEventHandler: vi.fn((fn: unknown) => fn),
  readBody: vi.fn(),
  createError: vi.fn((opts: { statusCode: number; message: string }) =>
    Object.assign(new Error(opts.message), { statusCode: opts.statusCode }),
  ),
}))

const { generateRouteVariants } = await import('../../../server/api/routes/generate.post')

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions'

function makeOrsCollection(distance = 10000, duration = 3600, ascent = 200) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-3.703, 40.416],
            [-3.71, 40.42],
            [-3.703, 40.416],
          ],
        },
        properties: {
          summary: { distance, duration },
          segments: [{ ascent, descent: ascent }],
        },
      },
    ],
  }
}

const VALID_INPUT = GenerateRouteInputSchema.parse({
  profile: 'foot-walking',
  startPoint: [-3.703, 40.416],
  distanceKm: 10,
  elevationM: 200,
})

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('generateRouteVariants', () => {
  it('devuelve exactamente 3 variantes tipadas como IRoute[]', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () => HttpResponse.json(makeOrsCollection())),
    )

    const routes = await generateRouteVariants('test-key', VALID_INPUT)

    expect(routes).toHaveLength(3)
    expect(routes[0]!.name).toBe('Variante 1')
    expect(routes[1]!.name).toBe('Variante 2')
    expect(routes[2]!.name).toBe('Variante 3')
    expect(routes[0]!.profile).toBe('foot-walking')
    expect(routes[0]!.geometry.length).toBeGreaterThan(0)
  })

  it('mapea las stats de ORS correctamente a IRoute', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () =>
        HttpResponse.json(makeOrsCollection(15000, 5400, 350)),
      ),
    )

    const routes = await generateRouteVariants('test-key', VALID_INPUT)

    expect(routes[0]!.stats.distanceKm).toBeCloseTo(15)
    expect(routes[0]!.stats.estimatedMinutes).toBe(90)
    expect(routes[0]!.stats.elevationGainM).toBe(350)
  })

  it('propaga OrsApiError cuando ORS responde con 401', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )

    await expect(generateRouteVariants('bad-key', VALID_INPUT)).rejects.toBeInstanceOf(OrsApiError)
  })

  it('propaga OrsApiError cuando ORS responde con 500', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () =>
        HttpResponse.json({ error: 'Server Error' }, { status: 500 }),
      ),
    )

    let caught: unknown
    try {
      await generateRouteVariants('key', VALID_INPUT)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(OrsApiError)
    expect((caught as OrsApiError).status).toBe(500)
  })

  it('cada variante tiene un UUID único como id', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () => HttpResponse.json(makeOrsCollection())),
    )

    const routes = await generateRouteVariants('key', VALID_INPUT)

    const ids = routes.map((r) => r.id)
    expect(new Set(ids).size).toBe(3)
    ids.forEach((id) => expect(id).toMatch(/^[0-9a-f-]{36}$/))
  })
})

describe('GenerateRouteInputSchema — validación de input', () => {
  it('rechaza distancia fuera de rango', () => {
    expect(() =>
      GenerateRouteInputSchema.parse({
        profile: 'foot-walking',
        startPoint: [-3.703, 40.416],
        distanceKm: 0,
        elevationM: 200,
      }),
    ).toThrow()
  })

  it('rechaza perfil desconocido', () => {
    expect(() =>
      GenerateRouteInputSchema.parse({
        profile: 'skateboard',
        startPoint: [-3.703, 40.416],
        distanceKm: 10,
        elevationM: 200,
      }),
    ).toThrow()
  })

  it('rechaza coordenada fuera de rango', () => {
    expect(() =>
      GenerateRouteInputSchema.parse({
        profile: 'foot-walking',
        startPoint: [200, 40.416],
        distanceKm: 10,
        elevationM: 200,
      }),
    ).toThrow()
  })
})
