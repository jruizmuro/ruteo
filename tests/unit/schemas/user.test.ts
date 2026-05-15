import { describe, expect, it } from 'vitest'
import { AuthProviderSchema, UserSchema } from '../../../shared/schemas/user'

describe('AuthProviderSchema', () => {
  it('acepta proveedores válidos', () => {
    const proveedores = ['google', 'strava', 'apple']
    for (const p of proveedores) {
      expect(AuthProviderSchema.parse(p)).toBe(p)
    }
  })

  it('rechaza un proveedor desconocido', () => {
    expect(() => AuthProviderSchema.parse('facebook')).toThrow()
  })
})

describe('UserSchema', () => {
  const base = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    displayName: 'Javier',
    provider: 'google' as const,
    createdAt: '2025-01-01T00:00:00.000Z',
  }

  it('acepta un usuario válido sin avatarUrl', () => {
    expect(UserSchema.parse(base)).toEqual(base)
  })

  it('acepta un usuario válido con avatarUrl', () => {
    const conAvatar = { ...base, avatarUrl: 'https://example.com/avatar.jpg' }
    expect(UserSchema.parse(conAvatar)).toEqual(conAvatar)
  })

  it('rechaza un UUID inválido', () => {
    expect(() => UserSchema.parse({ ...base, id: 'no-es-uuid' })).toThrow()
  })

  it('rechaza un email inválido', () => {
    expect(() => UserSchema.parse({ ...base, email: 'no-es-email' })).toThrow()
  })

  it('rechaza displayName vacío', () => {
    expect(() => UserSchema.parse({ ...base, displayName: '' })).toThrow()
  })

  it('rechaza avatarUrl con formato inválido', () => {
    expect(() => UserSchema.parse({ ...base, avatarUrl: 'no-es-url' })).toThrow()
  })

  it('rechaza proveedor desconocido', () => {
    expect(() => UserSchema.parse({ ...base, provider: 'twitter' })).toThrow()
  })
})
