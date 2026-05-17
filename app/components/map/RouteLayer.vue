<script setup lang="ts">
import { onMounted, onUnmounted, useId, watch } from 'vue'
import type { GeoJSONSource, Map } from 'maplibre-gl'

interface Props {
  map: Map
  coordinates: [number, number][]
  color?: string
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6',
  width: 4,
})

const id = useId()
const sourceId = `route-source-${id}`
const layerId = `route-layer-${id}`

function buildFeature() {
  return {
    type: 'Feature' as const,
    properties: null,
    geometry: { type: 'LineString' as const, coordinates: props.coordinates },
  }
}

function cleanup() {
  if (props.map.getLayer(layerId)) props.map.removeLayer(layerId)
  if (props.map.getSource(sourceId)) props.map.removeSource(sourceId)
}

onMounted(() => {
  cleanup()
  props.map.addSource(sourceId, { type: 'geojson', data: buildFeature() })
  props.map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': props.color,
      'line-width': props.width,
    },
  })
})

watch(
  () => props.coordinates,
  (coords) => {
    const source = props.map.getSource(sourceId) as GeoJSONSource | undefined
    source?.setData({
      type: 'Feature',
      properties: null,
      geometry: { type: 'LineString', coordinates: coords },
    })
  },
)

onUnmounted(cleanup)
</script>
