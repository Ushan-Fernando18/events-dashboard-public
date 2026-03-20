import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export async function callbackHandler(req: Request, res: Response) {
  const code = req.query.code as string
  if (!code) { res.status(400).send('No authorization code provided'); return }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    res.status(500).send('OAuth configuration missing inside .env')
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json() as Record<string, any>

    if (!tokenData.refresh_token) {
      if (tokenData.error) {
         return res.status(400).send(`OAuth Error: ${tokenData.error_description || tokenData.error}`)
      }
      return res.status(400).send('Google did not provide a refresh_token. You may have already authorized the app previously. Please visit https://myaccount.google.com/permissions to revoke access for "LankaPropertyWeb" or "Apartment Finder" and try navigating to /api/authorize again.')
    }

    // Save refresh_token to root folder as .ga4_token.json
    const rootDir = process.cwd()
    const tokenPath = path.join(rootDir, '.ga4_token.json')
    
    fs.writeFileSync(tokenPath, JSON.stringify({ refresh_token: tokenData.refresh_token }, null, 2))

    // Redirect user to the dashboard with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.send(`
      <html>
        <head><title>Success!</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1 style="color: #10B981;">Authentication Successful!</h1>
          <p>The <b>refresh_token</b> has been permanently saved to the server.</p>
          <p>You can now go back to the dashboard, and all viewers will see live stats!</p>
          <a href="${frontendUrl}" style="display: inline-block; padding: 10px 20px; background: #002686; color: white; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold;">Return to Dashboard</a>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    res.status(500).send('Failed to exchange authorization code.')
  }
}
