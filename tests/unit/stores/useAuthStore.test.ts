import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useAuthStore } from '../../../app/stores/useAuthStore'

const MOCK_SESSION = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' },
    app_metadata: { provider: 'google' },
    created_at: '2024-01-01T00:00:00.000Z',
  },
}

function makeSupabase(
  overrides: {
    signInWithOAuth?: ReturnType<typeof vi.fn>
    signOut?: ReturnType<typeof vi.fn>
    getSession?: ReturnType<typeof vi.fn>
  } = {},
): SupabaseClient {
  return {
    auth: {
      signInWithOAuth: overrides.signInWithOAuth ?? vi.fn().mockResolvedValue({ error: null }),
      signOut: overrides.signOut ?? vi.fn().mockResolvedValue({ error: null }),
      getSession:
        overrides.getSession ?? vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  } as unknown as SupabaseClient
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('signInWithGoogle', () => {
  it('llama a signInWithOAuth con provider google y resetea loading', async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ error: null })
    const supabase = makeSupabase({ signInWithOAuth })
    const store = useAuthStore()

    await store.signInWithGoogle(supabase)

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({ redirectTo: expect.stringContaining('/auth/callback') }),
    })
    expect(store.loading).toBe(false)
  })

  it('lanza error cuando Supabase devuelve error y resetea loading', async () => {
    const authError = new Error('OAuth failed')
    const supabase = makeSupabase({
      signInWithOAuth: vi.fn().mockResolvedValue({ error: authError }),
    })
    const store = useAuthStore()

    await expect(store.signInWithGoogle(supabase)).rejects.toThrow('OAuth failed')
    expect(store.loading).toBe(false)
  })
})

describe('signOut', () => {
  it('limpia el usuario y resetea loading tras cerrar sesión', async () => {
    const supabase = makeSupabase()
    const store = useAuthStore()
    store.user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'x@x.com',
      displayName: 'X',
      provider: 'google',
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    await store.signOut(supabase)

    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('lanza error cuando Supabase devuelve error y resetea loading', async () => {
    const supabase = makeSupabase({
      signOut: vi.fn().mockResolvedValue({ error: new Error('signOut failed') }),
    })
    const store = useAuthStore()

    await expect(store.signOut(supabase)).rejects.toThrow('signOut failed')
    expect(store.loading).toBe(false)
  })
})

describe('fetchUser', () => {
  it('asigna el usuario mapeado cuando existe sesión activa', async () => {
    const supabase = makeSupabase({
      getSession: vi.fn().mockResolvedValue({ data: { session: MOCK_SESSION }, error: null }),
    })
    const store = useAuthStore()

    await store.fetchUser(supabase)

    expect(store.user).toMatchObject({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      provider: 'google',
    })
    expect(store.isAuthenticated).toBe(true)
    expect(store.loading).toBe(false)
  })

  it('deja user null cuando no hay sesión activa', async () => {
    const supabase = makeSupabase({
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    })
    const store = useAuthStore()

    await store.fetchUser(supabase)

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.loading).toBe(false)
  })

  it('deja user null cuando Supabase devuelve error', async () => {
    const supabase = makeSupabase({
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: new Error('network') }),
    })
    const store = useAuthStore()

    await store.fetchUser(supabase)

    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('usa email como displayName cuando full_name no está en metadata', async () => {
    const sessionSinNombre = {
      user: {
        ...MOCK_SESSION.user,
        user_metadata: { avatar_url: undefined },
      },
    }
    const supabase = makeSupabase({
      getSession: vi.fn().mockResolvedValue({ data: { session: sessionSinNombre }, error: null }),
    })
    const store = useAuthStore()

    await store.fetchUser(supabase)

    expect(store.user?.displayName).toBe('test@example.com')
  })
})
