import type { Ref } from 'vue'

interface MapLike {
  zoomIn(): unknown
  zoomOut(): unknown
  panTo(lngLat: [number, number]): unknown
  fitBounds(bounds: [[number, number], [number, number]]): unknown
}

export function useMapControls(map: Ref<MapLike | null>) {
  function zoomIn(): void {
    map.value?.zoomIn()
  }

  function zoomOut(): void {
    map.value?.zoomOut()
  }

  function panTo(lng: number, lat: number): void {
    map.value?.panTo([lng, lat])
  }

  function fitBounds(bounds: [[number, number], [number, number]]): void {
    map.value?.fitBounds(bounds)
  }

  return { zoomIn, zoomOut, panTo, fitBounds }
}
