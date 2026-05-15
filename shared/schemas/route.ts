import { z } from 'zod'
import { DISTANCE, ELEVATION, TRANSPORT_PROFILES } from '../constants/transport'

export const TransportProfileSchema = z.enum(TRANSPORT_PROFILES)

export const CoordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])

export const GenerateRouteInputSchema = z.object({
  profile: TransportProfileSchema,
  startPoint: CoordinateSchema,
  distanceKm: z.number().min(DISTANCE.MIN_KM).max(DISTANCE.MAX_KM),
  elevationM: z.number().min(ELEVATION.MIN_M).max(ELEVATION.MAX_M),
})

export const RouteStatsSchema = z.object({
  distanceKm: z.number().nonnegative(),
  elevationGainM: z.number().nonnegative(),
  estimatedMinutes: z.number().nonnegative(),
})

export const RouteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  profile: TransportProfileSchema,
  geometry: z.array(CoordinateSchema).min(2),
  stats: RouteStatsSchema,
  createdAt: z.string().datetime(),
})

export const RouteFiltersSchema = z.object({
  profile: TransportProfileSchema.optional(),
  minDistanceKm: z.number().min(DISTANCE.MIN_KM).optional(),
  maxDistanceKm: z.number().max(DISTANCE.MAX_KM).optional(),
  minElevationM: z.number().min(ELEVATION.MIN_M).optional(),
  maxElevationM: z.number().max(ELEVATION.MAX_M).optional(),
})

export type TransportProfile = z.infer<typeof TransportProfileSchema>
export type Coordinate = z.infer<typeof CoordinateSchema>
export type GenerateRouteInput = z.infer<typeof GenerateRouteInputSchema>
export type RouteStats = z.infer<typeof RouteStatsSchema>
export type Route = z.infer<typeof RouteSchema>
export type RouteFilters = z.infer<typeof RouteFiltersSchema>
