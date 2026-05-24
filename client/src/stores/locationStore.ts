import { create } from 'zustand'

interface LocationState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  watching: boolean
  watchId: number | null
  start: () => void
  stop: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  lat: null,
  lng: null,
  accuracy: null,
  watching: false,
  watchId: null,

  start: () => {
    if (get().watching) return
    const id = navigator.geolocation.watchPosition(
      (pos) => set({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => console.error('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    set({ watching: true, watchId: id })
  },

  stop: () => {
    const { watchId } = get()
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    set({ watching: false, watchId: null })
  },
}))
