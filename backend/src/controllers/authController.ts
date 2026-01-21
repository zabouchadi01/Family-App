import { Request, Response } from 'express';
import { getOAuth2Client, getAuthUrl, storeToken, isAuthenticated, clearTokens } from '../services/tokenManager';
import { env } from '../config/env';

export function initiateGoogleAuth(req: Request, res: Response): void {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
}

export async function handleGoogleCallback(
  req: Request,
  res: Response
): Promise<void> {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      res.status(400).json({ error: 'Failed to obtain tokens' });
      return;
    }

    const expiresAt = new Date(tokens.expiry_date);
    await storeToken(tokens.access_token, tokens.refresh_token, expiresAt);

    // Redirect to frontend or show success message
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #4CAF50; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Authentication Successful!</h1>
            <p>You can now close this window and return to the app.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function getAuthStatus(req: Request, res: Response): Promise<void> {
  const authenticated = await isAuthenticated();
  res.json({ authenticated });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await clearTokens();
  res.json({ message: 'Logged out successfully' });
}
