import { Router } from 'express'
import { pool } from '../db.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, colour, total_cells
       FROM users ORDER BY total_cells DESC LIMIT 100`
    )
    res.json({ data: result.rows })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})
