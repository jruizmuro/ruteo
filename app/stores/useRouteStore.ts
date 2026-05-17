import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { IRoute } from '#shared/types'

export const useRouteStore = defineStore('route', () => {
  const variants = ref<IRoute[]>([])
  const selectedIndex = ref<number | null>(null)

  const selectedRoute = computed<IRoute | null>(() => {
    if (selectedIndex.value === null) return null
    return variants.value[selectedIndex.value] ?? null
  })

  function setVariants(routes: IRoute[]): void {
    variants.value = routes
    selectedIndex.value = null
  }

  function selectVariant(index: number): void {
    selectedIndex.value = index
  }

  function reset(): void {
    variants.value = []
    selectedIndex.value = null
  }

  return { variants, selectedIndex, selectedRoute, setVariants, selectVariant, reset }
})
