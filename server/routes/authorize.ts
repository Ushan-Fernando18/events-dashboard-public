import type { Request, Response } from 'express'

export function authorizeHandler(req: Request, res: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/callback`
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  if (!clientId) {
    res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured' })
    return
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: frontendUrl,
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  res.redirect(authUrl)
}
