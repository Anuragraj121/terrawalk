import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationStore } from '../stores/locationStore'
import { getCellPolygon } from '../utils/grid'

const API = import.meta.env.VITE_API_URL

interface TerritoryCell {
  cell_key: string
  colour: string
  polygon: [number, number][]
}

export default function LeafletMap({ cells }: { cells: TerritoryCell[] }) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const accuracyRef = useRef<L.Circle | null>(null)
  const cellLayerRef = useRef<L.LayerGroup | null>(null)
  const apiCellLayerRef = useRef<L.LayerGroup | null>(null)
  const currentCellRef = useRef<L.Polygon | null>(null)

  const { lat, lng, accuracy } = useLocationStore()

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false }).setView([20, 78], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    cellLayerRef.current = L.layerGroup().addTo(map)
    apiCellLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map;
    (window as any)._terrawalkMap = map

    // Load cells on viewport change
    const loadCells = () => {
      const bounds = map.getBounds()
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
      fetch(`${API}/cells?bbox=${bbox}`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.data || !apiCellLayerRef.current) return
          apiCellLayerRef.current.clearLayers()
          json.data.forEach((cell: any) => {
            const coords = cell.geojson.coordinates[0].map((c: number[]) => [c[1], c[0]] as [number, number])
            L.polygon(coords, { color: cell.colour, fillColor: cell.colour, fillOpacity: 0.35, weight: 1 })
              .addTo(apiCellLayerRef.current!)
          })
        })
    }
    map.on('moveend', loadCells)

    return () => { map.remove(); mapRef.current = null; (window as any)._terrawalkMap = null }
  }, [])

  // Update user location dot + accuracy circle
  useEffect(() => {
    const map = mapRef.current
    if (!map || lat === null || lng === null) return

    if (!markerRef.current) {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 8, fillColor: '#10b981', fillOpacity: 1, color: '#fff', weight: 3,
        className: 'user-dot',
      }).addTo(map)
      map.setView([lat, lng], 16)
    } else {
      markerRef.current.setLatLng([lat, lng])
    }

    if (accuracy) {
      if (!accuracyRef.current) {
        accuracyRef.current = L.circle([lat, lng], {
          radius: accuracy, fillColor: '#10b981', fillOpacity: 0.1, color: '#10b981', weight: 1,
        }).addTo(map)
      } else {
        accuracyRef.current.setLatLng([lat, lng]).setRadius(accuracy)
      }
    }

    // Show current cell highlight
    const poly = getCellPolygon(lat, lng)
    if (currentCellRef.current) {
      currentCellRef.current.setLatLngs(poly)
    } else {
      currentCellRef.current = L.polygon(poly, {
        color: '#10b981', weight: 2, fillOpacity: 0.15, dashArray: '5,5',
      }).addTo(map)
    }
  }, [lat, lng, accuracy])

  // Render territory cells
  useEffect(() => {
    const layer = cellLayerRef.current
    if (!layer) return
    layer.clearLayers()
    cells.forEach((cell) => {
      L.polygon(cell.polygon, {
        color: cell.colour, fillColor: cell.colour, fillOpacity: 0.35, weight: 1,
      }).addTo(layer)
    })
  }, [cells])

  return <div ref={containerRef} className="absolute inset-0" />
}
