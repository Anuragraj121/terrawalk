import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { authRouter } from './routes/auth.js'
import { sessionsRouter } from './routes/sessions.js'
import { cellsRouter } from './routes/cells.js'
import { usersRouter } from './routes/users.js'
import { leaderboardRouter } from './routes/leaderboard.js'
import { postsRouter } from './routes/posts.js'
import { setupSocket } from './socket.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    const { pool } = await import('./db.js')
    await pool.query('SELECT 1')
    res.json({ data: { status: 'ok', db: 'connected' } })
  } catch (e: any) {
    res.json({ data: { status: 'ok', db: 'disconnected', error: e.message } })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/cells', cellsRouter)
app.use('/api/users', usersRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/posts', postsRouter)
app.use('/uploads', express.static('uploads'))

// Serve frontend in production
const clientDist = join(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('{*path}', (_req, res) => {
  res.sendFile(join(clientDist, 'index.html'))
})

setupSocket(io)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`))
