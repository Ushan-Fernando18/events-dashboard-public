import type { Request, Response } from 'express'

export function authorizeHandler(_req: Request, res: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.REDIRECT_URI

  if (!clientId || !redirectUri) {
    res.status(500).send('GOOGLE_CLIENT_ID or REDIRECT_URI not configured in .env')
    return
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.append('client_id', clientId)
  url.searchParams.append('redirect_uri', redirectUri)
  url.searchParams.append('response_type', 'code')
  url.searchParams.append('access_type', 'offline')
  url.searchParams.append('prompt', 'consent') // Force consent window to ensure a refresh token is provided
  url.searchParams.append('scope', 'https://www.googleapis.com/auth/analytics.readonly')

  res.redirect(url.toString())
}
