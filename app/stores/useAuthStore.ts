import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UserSchema } from '#shared/schemas/user'
import type { User } from '#shared/schemas/user'
import { logger } from '#shared/utils/logger'

export type { User }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function signInWithGoogle(supabase: SupabaseClient): Promise<void> {
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err) {
      logger.error('signInWithGoogle failed', { error: String(err) })
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signOut(supabase: SupabaseClient): Promise<void> {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } catch (err) {
      logger.error('signOut failed', { error: String(err) })
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(supabase: SupabaseClient): Promise<void> {
    loading.value = true
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) throw error
      if (!session?.user) {
        user.value = null
        return
      }
      const meta = session.user.user_metadata as Record<string, unknown> | undefined
      const appMeta = session.user.app_metadata as Record<string, unknown> | undefined
      const raw = {
        id: session.user.id,
        email: session.user.email ?? '',
        displayName: (meta?.['full_name'] as string | undefined) ?? session.user.email ?? '',
        avatarUrl: meta?.['avatar_url'] as string | undefined,
        provider: ((appMeta?.['provider'] as string | undefined) ?? 'google') as User['provider'],
        createdAt: session.user.created_at,
      }
      user.value = UserSchema.parse(raw)
    } catch (err) {
      logger.error('fetchUser failed', { error: String(err) })
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return { user, loading, isAuthenticated, signInWithGoogle, signOut, fetchUser }
})
