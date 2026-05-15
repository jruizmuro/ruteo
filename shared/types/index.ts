import type { z } from 'zod'
import type { RouteFiltersSchema, RouteSchema, RouteStatsSchema } from '../schemas'

export type IRouteStats = z.infer<typeof RouteStatsSchema>

export type IRoute = z.infer<typeof RouteSchema>

export type IRouteFilters = z.infer<typeof RouteFiltersSchema>
