// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { OrsApiError, fetchOrsRoute } from '../../../server/utils/ors'

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions'

const MOCK_COLLECTION = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-3.703, 40.416],
          [-3.704, 40.417],
          [-3.703, 40.416],
        ],
      },
      properties: {
        summary: { distance: 10000, duration: 3600 },
        segments: [{ ascent: 200, descent: 200 }],
      },
    },
  ],
}

const COORDS: [number, number][] = [
  [-3.703, 40.416],
  [-3.704, 40.417],
]

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchOrsRoute', () => {
  it('devuelve FeatureCollection con geometría y stats para ruta válida', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () => HttpResponse.json(MOCK_COLLECTION)),
    )

    const result = await fetchOrsRoute('valid-key', 'foot-walking', COORDS)

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(1)
    expect(result.features[0]!.properties.summary.distance).toBe(10000)
    expect(result.features[0]!.properties.segments[0]!.ascent).toBe(200)
  })

  it('usa el perfil correcto en la URL de la petición', async () => {
    let requestedUrl = ''
    server.use(
      http.post(`${ORS_BASE}/cycling-road/geojson`, ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json(MOCK_COLLECTION)
      }),
    )

    await fetchOrsRoute('key', 'cycling-road', COORDS)

    expect(requestedUrl).toContain('cycling-road')
  })

  it('lanza OrsApiError con status 401 cuando la API key es inválida', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )

    let caught: unknown
    try {
      await fetchOrsRoute('bad-key', 'foot-walking', COORDS)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(OrsApiError)
    expect((caught as OrsApiError).status).toBe(401)
  })

  it('lanza OrsApiError con status 500 cuando ORS falla internamente', async () => {
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, () =>
        HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
      ),
    )

    let caught: unknown
    try {
      await fetchOrsRoute('key', 'foot-walking', COORDS)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(OrsApiError)
    expect((caught as OrsApiError).status).toBe(500)
    expect((caught as OrsApiError).name).toBe('OrsApiError')
  })

  it('envía las coordenadas en el body de la petición', async () => {
    let body: unknown
    server.use(
      http.post(`${ORS_BASE}/foot-walking/geojson`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(MOCK_COLLECTION)
      }),
    )

    await fetchOrsRoute('key', 'foot-walking', COORDS)

    expect(body).toEqual({ coordinates: COORDS })
  })
})
