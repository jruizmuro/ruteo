import { z } from 'zod'

export const TransportProfileSchema = z.enum([
  'foot-walking',
  'cycling-road',
  'cycling-mountain',
  'cycling-electric',
])

export const CoordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])

export const GenerateRouteInputSchema = z.object({
  profile: TransportProfileSchema,
  startPoint: CoordinateSchema,
  distanceKm: z.number().min(1).max(200),
  elevationM: z.number().min(0).max(5000),
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
  minDistanceKm: z.number().min(1).optional(),
  maxDistanceKm: z.number().max(200).optional(),
  minElevationM: z.number().min(0).optional(),
  maxElevationM: z.number().max(5000).optional(),
})

export type TransportProfile = z.infer<typeof TransportProfileSchema>
export type Coordinate = z.infer<typeof CoordinateSchema>
export type GenerateRouteInput = z.infer<typeof GenerateRouteInputSchema>
export type RouteStats = z.infer<typeof RouteStatsSchema>
export type Route = z.infer<typeof RouteSchema>
export type RouteFilters = z.infer<typeof RouteFiltersSchema>
