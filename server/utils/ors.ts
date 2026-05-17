import type { TransportProfile } from '#shared/schemas/route'

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions'

interface OrsSegment {
  ascent: number
  descent: number
}

interface OrsProperties {
  summary: {
    distance: number
    duration: number
  }
  segments: OrsSegment[]
}

interface OrsFeature {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][] | [number, number, number][]
  }
  properties: OrsProperties
}

export interface OrsFeatureCollection {
  type: 'FeatureCollection'
  features: OrsFeature[]
}

export class OrsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'OrsApiError'
  }
}

export async function fetchOrsRoute(
  apiKey: string,
  profile: TransportProfile,
  coordinates: [number, number][],
): Promise<OrsFeatureCollection> {
  const url = `${ORS_BASE}/${profile}/geojson`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ coordinates }),
  })

  if (!response.ok) {
    throw new OrsApiError(
      response.status,
      `ORS request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<OrsFeatureCollection>
}
