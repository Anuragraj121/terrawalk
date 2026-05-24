import { Router } from 'express'
import { pool } from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const sessionsRouter = Router()

sessionsRouter.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO sessions (user_id) VALUES ($1) RETURNING id, started_at',
      [req.userId]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

sessionsRouter.post('/end/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE sessions SET ended_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, started_at, ended_at, distance_m, cells_claimed, cells_stolen, cells_lost,
                 EXTRACT(EPOCH FROM (ended_at - started_at)) as duration_s`,
      [id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found' } })
    }
    res.json({ data: result.rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})
