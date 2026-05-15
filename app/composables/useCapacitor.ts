export interface ILocationProvider {
  getCurrentPosition(): Promise<{ lat: number; lng: number }>
}

export interface IFileSaver {
  saveFile(filename: string, content: string): Promise<void>
}

export interface IShareProvider {
  shareRoute(title: string, url: string): Promise<void>
}

export interface IHapticsProvider {
  hapticSuccess(): void
}

export function useCapacitor(): ILocationProvider & IFileSaver & IShareProvider & IHapticsProvider {
  // [web] navigator.geolocation — [native] Fase 6: @capacitor/geolocation
  async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
      )
    })
  }

  // [web] blob + <a download> — [native] Fase 6: @capacitor/filesystem
  async function saveFile(filename: string, content: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // [web] navigator.share con fallback clipboard — [native] Fase 6: @capacitor/share
  async function shareRoute(title: string, url: string): Promise<void> {
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  // [web] no-op — [native] Fase 6: @capacitor/haptics
  function hapticSuccess(): void {}

  return { getCurrentPosition, saveFile, shareRoute, hapticSuccess }
}
