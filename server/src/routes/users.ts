import { Router } from 'express'
import { pool } from '../db.js'

export const usersRouter = Router()

usersRouter.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params
    const user = await pool.query(
      'SELECT id, username, colour, total_cells, created_at FROM users WHERE id = $1', [id]
    )
    if (user.rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } })
    }
    const sessions = await pool.query(
      `SELECT COUNT(*) as total_sessions,
              COALESCE(SUM(distance_m), 0) as total_distance_m,
              COALESCE(SUM(cells_claimed), 0) as total_claimed,
              COALESCE(SUM(cells_stolen), 0) as total_stolen
       FROM sessions WHERE user_id = $1 AND ended_at IS NOT NULL`, [id]
    )
    res.json({ data: { ...user.rows[0], ...sessions.rows[0] } })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})
