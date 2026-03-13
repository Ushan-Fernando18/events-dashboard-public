import type { Request, Response } from 'express'

export async function callbackHandler(req: Request, res: Response) {
  const { code, state: frontendUrl } = req.query as { code: string; state: string }
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/callback`

  if (!code) {
    res.status(400).send('Missing authorization code')
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token: string
      expires_in: number
      error?: string
    }

    if (tokens.error) {
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(tokens.error)}`)
      return
    }

    const params = new URLSearchParams({
      ga_auth_success: 'true',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: String(tokens.expires_in),
    })

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`)
  } catch (err) {
    console.error('Callback error:', err)
    res.redirect(`${frontendUrl}/login?error=callback_failed`)
  }
}
