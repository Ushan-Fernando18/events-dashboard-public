import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authorizeHandler } from '../server/routes/authorize'
import { callbackHandler } from '../server/routes/callback'
import { refreshHandler } from '../server/routes/refresh'
import { analyticsHandler } from '../server/routes/analytics'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}))
app.use(express.json())

// Routes
app.get('/api/authorize', authorizeHandler)
app.get('/api/callback', callbackHandler)
app.post('/api/refresh', refreshHandler)
app.post('/api/analytics', analyticsHandler)

export default app
