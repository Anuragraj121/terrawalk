import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'

const CELL_SIZE = 0.01

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getCellKey(lat: number, lng: number) {
  return `${(Math.floor(lat / CELL_SIZE) * CELL_SIZE).toFixed(2)}:${(Math.floor(lng / CELL_SIZE) * CELL_SIZE).toFixed(2)}`
}

function getCellGeom(lat: number, lng: number) {
  const cLat = Math.floor(lat / CELL_SIZE) * CELL_SIZE
  const cLng = Math.floor(lng / CELL_SIZE) * CELL_SIZE
  return `SRID=4326;POLYGON((${cLng} ${cLat},${cLng + CELL_SIZE} ${cLat},${cLng + CELL_SIZE} ${cLat + CELL_SIZE},${cLng} ${cLat + CELL_SIZE},${cLng} ${cLat}))`
}

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
      socket.data.userId = payload.sub
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    let sessionId: string | null = null
    let lastPos: { lat: number; lng: number; time: number } | null = null

    socket.on('session-start', (id: string) => { sessionId = id; lastPos = null })
    socket.on('session-end', () => { sessionId = null; lastPos = null })

    socket.on('location-update', async ({ lat, lng }: { lat: number; lng: number }) => {
      if (!sessionId) return

      // Anti-cheat: speed check
      const now = Date.now()
      if (lastPos) {
        const dist = haversine(lastPos.lat, lastPos.lng, lat, lng)
        const dt = (now - lastPos.time) / 1000 // seconds
        if (dt > 0) {
          const speedKmh = (dist / 1000) / (dt / 3600)
          if (speedKmh > 60) {
            socket.emit('error', { code: 'SPEED_LIMIT', message: 'Movement too fast (>60 km/h)' })
            return
          }
        }
      }
      lastPos = { lat, lng, time: now }

      const cellKey = getCellKey(lat, lng)

      try {
        const existing = await pool.query('SELECT owner_id FROM territory_cells WHERE cell_key = $1', [cellKey])

        if (existing.rows.length === 0) {
          // Unclaimed — insert
          await pool.query(
            'INSERT INTO territory_cells (geom, cell_key, owner_id) VALUES (ST_GeomFromEWKT($1), $2, $3)',
            [getCellGeom(lat, lng), cellKey, userId]
          )
          await pool.query('UPDATE users SET total_cells = total_cells + 1 WHERE id = $1', [userId])
          await pool.query('UPDATE sessions SET cells_claimed = cells_claimed + 1 WHERE id = $1', [sessionId])

          const user = await pool.query('SELECT colour, username FROM users WHERE id = $1', [userId])
          io.emit('cell-claimed', { cell_key: cellKey, owner_id: userId, colour: user.rows[0].colour, username: user.rows[0].username, lat, lng })

        } else if (existing.rows[0].owner_id !== userId) {
          // Steal
          const prevOwner = existing.rows[0].owner_id
          await pool.query('UPDATE territory_cells SET owner_id = $1, last_contested_at = now() WHERE cell_key = $2', [userId, cellKey])
          await pool.query('UPDATE users SET total_cells = total_cells + 1 WHERE id = $1', [userId])
          await pool.query('UPDATE users SET total_cells = GREATEST(total_cells - 1, 0) WHERE id = $1', [prevOwner])
          await pool.query('UPDATE sessions SET cells_stolen = cells_stolen + 1 WHERE id = $1', [sessionId])

          const user = await pool.query('SELECT colour, username FROM users WHERE id = $1', [userId])
          io.emit('cell-stolen', { cell_key: cellKey, owner_id: userId, prev_owner_id: prevOwner, colour: user.rows[0].colour, username: user.rows[0].username, lat, lng })
        }
      } catch (e) {
        console.error('Cell claim error:', e)
      }
    })

    socket.on('disconnect', () => { sessionId = null; lastPos = null })
  })
}
