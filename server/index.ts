import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { authorizeHandler } from './routes/authorize'
import { callbackHandler } from './routes/callback'
import { refreshHandler } from './routes/refresh'
import { analyticsHandler } from './routes/analytics'
import { publicStatsHandler } from './routes/publicStats'

dotenv.config()

// process.cwd() returns the project root — works in both ESM and CJS
const rootDir = process.cwd()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// API routes
app.get('/api/authorize', authorizeHandler)
app.get('/api/callback', callbackHandler)
app.post('/api/refresh', refreshHandler)
app.post('/api/analytics', analyticsHandler)
app.get('/api/public-stats', publicStatsHandler)

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(rootDir, 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
