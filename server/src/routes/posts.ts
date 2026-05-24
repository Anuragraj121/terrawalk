import { Router } from 'express'
import multer from 'multer'
import { pool } from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } })

export const postsRouter = Router()

// Create post (with optional photo)
postsRouter.post('/', authMiddleware, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    const { caption, session_id, cells_claimed, distance_m, duration_s } = req.body
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null
    const result = await pool.query(
      `INSERT INTO posts (user_id, session_id, photo_url, caption, cells_claimed, distance_m, duration_s)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, session_id || null, photo_url, caption || null,
       Number(cells_claimed) || 0, Number(distance_m) || 0, Number(duration_s) || 0]
    )
    res.status(201).json({ data: result.rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

// Get feed (latest posts with user info + like count)
postsRouter.get('/feed', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.colour,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.userId]
    )
    res.json({ data: result.rows })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

// Like / unlike a post
postsRouter.post('/:id/like', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const existing = await pool.query('SELECT id FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.userId])
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.userId])
      res.json({ data: { liked: false } })
    } else {
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [id, req.userId])
      res.json({ data: { liked: true } })
    }
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})
