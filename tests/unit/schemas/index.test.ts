import { describe, expect, it } from 'vitest'
import {
  AuthProviderSchema,
  CoordinateSchema,
  GenerateRouteInputSchema,
  RouteFiltersSchema,
  RouteSchema,
  RouteStatsSchema,
  TransportProfileSchema,
  UserSchema,
} from '../../../shared/schemas/index'

describe('shared/schemas barrel export', () => {
  it('exporta los schemas de route', () => {
    expect(TransportProfileSchema).toBeDefined()
    expect(CoordinateSchema).toBeDefined()
    expect(GenerateRouteInputSchema).toBeDefined()
    expect(RouteStatsSchema).toBeDefined()
    expect(RouteSchema).toBeDefined()
    expect(RouteFiltersSchema).toBeDefined()
  })

  it('exporta los schemas de user', () => {
    expect(AuthProviderSchema).toBeDefined()
    expect(UserSchema).toBeDefined()
  })

  it('los schemas exportados son funcionales', () => {
    expect(TransportProfileSchema.parse('foot-walking')).toBe('foot-walking')
    expect(AuthProviderSchema.parse('google')).toBe('google')
  })
})
