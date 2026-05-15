import { z } from 'zod'

export const AuthProviderSchema = z.enum(['google', 'strava', 'apple'])

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  provider: AuthProviderSchema,
  createdAt: z.string().datetime(),
})

export type AuthProvider = z.infer<typeof AuthProviderSchema>
export type User = z.infer<typeof UserSchema>
