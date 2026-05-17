import { defineEventHandler, readBody, createError } from 'h3'
import { ZodError } from 'zod'
import { GenerateRouteInputSchema } from '#shared/schemas/route'
import type { GenerateRouteInput, TransportProfile } from '#shared/schemas/route'
import type { IRoute } from '#shared/types'
import { OrsApiError, fetchOrsRoute } from '../../utils/ors'
import type { OrsFeatureCollection } from '../../utils/ors'

const EARTH_RADIUS_KM = 6371
const VARIANT_ROTATIONS = [0, 45, 90] as const

function offsetPoint(
  start: [number, number],
  bearingDeg: number,
  distanceKm: number,
): [number, number] {
  const [lng, lat] = start
  const δ = distanceKm / EARTH_RADIUS_KM
  const θ = (bearingDeg * Math.PI) / 180
  const φ1 = (lat * Math.PI) / 180
  const λ1 = (lng * Math.PI) / 180
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ))
  const λ2 =
    λ1 +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2))
  return [(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI]
}

function buildWaypoints(
  startPoint: [number, number],
  distanceKm: number,
  rotationDeg: number,
): [number, number][] {
  const r = distanceKm / (2 * Math.PI)
  const wp1 = offsetPoint(startPoint, rotationDeg, r)
  const wp2 = offsetPoint(startPoint, rotationDeg + 120, r)
  const wp3 = offsetPoint(startPoint, rotationDeg + 240, r)
  return [startPoint, wp1, wp2, wp3, startPoint]
}

function orsCollectionToRoute(
  collection: OrsFeatureCollection,
  profile: TransportProfile,
  name: string,
): IRoute {
  const feature = collection.features[0]!
  const distanceKm = feature.properties.summary.distance / 1000
  const elevationGainM = feature.properties.segments.reduce((sum, s) => sum + s.ascent, 0)
  const estimatedMinutes = Math.round(feature.properties.summary.duration / 60)
  const geometry = feature.geometry.coordinates.map((c): [number, number] => [c[0]!, c[1]!])
  return {
    id: crypto.randomUUID(),
    name,
    profile,
    geometry,
    stats: { distanceKm, elevationGainM, estimatedMinutes },
    createdAt: new Date().toISOString(),
  }
}

export async function generateRouteVariants(
  apiKey: string,
  input: GenerateRouteInput,
): Promise<IRoute[]> {
  const results = await Promise.all(
    VARIANT_ROTATIONS.map((rotation, i) => {
      const waypoints = buildWaypoints(input.startPoint, input.distanceKm, rotation)
      return fetchOrsRoute(apiKey, input.profile, waypoints).then((collection) =>
        orsCollectionToRoute(collection, input.profile, `Variante ${i + 1}`),
      )
    }),
  )
  return results
}

export default defineEventHandler(async (event) => {
  let input: GenerateRouteInput
  try {
    const body = await readBody<unknown>(event)
    input = GenerateRouteInputSchema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      throw createError({ statusCode: 400, message: 'Invalid input', data: err.errors })
    }
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const { orsApiKey } = useRuntimeConfig(event)

  try {
    return await generateRouteVariants(orsApiKey, input)
  } catch (err) {
    if (err instanceof OrsApiError) {
      throw createError({ statusCode: 502, message: `ORS error: ${err.message}` })
    }
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
