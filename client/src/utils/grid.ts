const CELL_SIZE = 0.01 // ~1km²

export function getCellKey(lat: number, lng: number): string {
  const cellLat = Math.floor(lat / CELL_SIZE) * CELL_SIZE
  const cellLng = Math.floor(lng / CELL_SIZE) * CELL_SIZE
  return `${cellLat.toFixed(2)}:${cellLng.toFixed(2)}`
}

export function getCellPolygon(lat: number, lng: number): [number, number][] {
  const cellLat = Math.floor(lat / CELL_SIZE) * CELL_SIZE
  const cellLng = Math.floor(lng / CELL_SIZE) * CELL_SIZE
  return [
    [cellLat, cellLng],
    [cellLat + CELL_SIZE, cellLng],
    [cellLat + CELL_SIZE, cellLng + CELL_SIZE],
    [cellLat, cellLng + CELL_SIZE],
  ]
}
