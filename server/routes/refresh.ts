import type { Request, Response } from 'express'

export async function refreshHandler(req: Request, res: Response) {
  const { refresh_token } = req.body as { refresh_token: string }
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!refresh_token) {
    res.status(400).json({ error: 'Missing refresh_token' })
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'refresh_token',
      }),
    })

    const data = await tokenRes.json() as {
      access_token: string
      expires_in: number
      error?: string
    }

    if (data.error) {
      res.status(401).json({ error: data.error })
      return
    }

    res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    })
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
}
