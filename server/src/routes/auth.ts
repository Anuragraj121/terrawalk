import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

export const authRouter = Router()

const signTokens = (userId: string) => {
  const access = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  const refresh = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })
  return { access, refresh }
}

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const colour = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    const result = await pool.query(
      'INSERT INTO users (id, username, email, password_hash, colour) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id, username, email, colour',
      [username, email, hash, colour]
    )
    const user = result.rows[0]
    const tokens = signTokens(user.id)
    res.status(201).json({ data: { user, tokens } })
  } catch (e: any) {
    if (e.code === '23505') return res.status(409).json({ error: { code: 'CONFLICT', message: 'Username or email already exists' } })
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await pool.query('SELECT id, username, email, colour, password_hash FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } })
    }
    const tokens = signTokens(user.id)
    const { password_hash, ...safeUser } = user
    res.json({ data: { user: safeUser, tokens } })
  } catch (e: any) {
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

authRouter.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: string }
    const tokens = signTokens(payload.sub)
    res.json({ data: { tokens } })
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } })
  }
})
