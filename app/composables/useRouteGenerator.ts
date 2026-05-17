import { ref } from 'vue'
import type { GenerateRouteInput } from '#shared/schemas/route'
import type { IRoute } from '#shared/types'

type FetchFn = (url: string, options?: { method?: string; body?: unknown }) => Promise<unknown>

export function useRouteGenerator(fetchFn: FetchFn) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function generate(input: GenerateRouteInput): Promise<IRoute[]> {
    loading.value = true
    error.value = null
    try {
      const data = await fetchFn('/api/routes/generate', { method: 'POST', body: input })
      return data as IRoute[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { generate, loading, error }
}
