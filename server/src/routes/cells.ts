import { Router } from 'express'
import { pool } from '../db.js'

export const cellsRouter = Router()

cellsRouter.get('/', async (req, res) => {
  try {
    const { bbox } = req.query
    if (!bbox || typeof bbox !== 'string') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'bbox required: minLat,minLng,maxLat,maxLng' } })
    }
    const [minLat, minLng, maxLat, maxLng] = bbox.split(',').map(Number)
    const result = await pool.query(
      `SELECT tc.cell_key, tc.owner_id, u.colour, u.username,
              ST_AsGeoJSON(tc.geom)::json as geojson
       FROM territory_cells tc
       JOIN users u ON u.id = tc.owner_id
       WHERE tc.geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)`,
      [minLng, minLat, maxLng, maxLat]
    )
    res.json({ data: result.rows })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})
