<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Map } from 'maplibre-gl'

interface Props {
  center?: [number, number]
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0] as [number, number],
  zoom: 12,
})

const emit = defineEmits<{
  ready: [map: Map]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const mapInstance = ref<Map | null>(null)

onMounted(async () => {
  if (!containerRef.value) return
  const { Map: MapGL } = await import('maplibre-gl')
  const map = new MapGL({
    container: containerRef.value,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: props.center,
    zoom: props.zoom,
  })
  map.on('load', () => {
    mapInstance.value = map
    emit('ready', map)
  })
})

watch(
  () => [props.center, props.zoom] as const,
  ([center, zoom]) => {
    if (!mapInstance.value) return
    mapInstance.value.flyTo({ center, zoom })
  },
)

onUnmounted(() => {
  mapInstance.value?.remove()
  mapInstance.value = null
})

defineExpose({ mapInstance })
</script>

<template>
  <div ref="containerRef" style="height: 100%; width: 100%">
    <slot />
  </div>
</template>
