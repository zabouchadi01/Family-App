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

  // Detect if request came from web browser (PC setup) or mobile app
  const userAgent = req.get('user-agent') || '';
  const isWebBrowser = !userAgent.toLowerCase().includes('okhttp'); // okhttp is used by React Native

  if (!code || typeof code !== 'string') {
    if (isWebBrowser) {
      res.status(400).send('<h1>Error: Missing authorization code</h1>');
    } else {
      res.redirect('familycalendar://oauth-callback?success=false&error=missing_code');
    }
    return;
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      if (isWebBrowser) {
        res.status(400).send('<h1>Error: Failed to obtain tokens</h1>');
      } else {
        res.redirect('familycalendar://oauth-callback?success=false&error=token_error');
      }
      return;
    }

    const expiresAt = new Date(tokens.expiry_date);
    await storeToken(tokens.access_token, tokens.refresh_token, expiresAt);

    if (isWebBrowser) {
      // Show success page for web browser (PC setup)
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Setup Complete</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              }
              h1 { color: #4CAF50; margin-bottom: 10px; }
              p { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Setup Complete!</h1>
              <p>Google Calendar access authorized successfully.</p>
              <p><strong>Your tablet can now display calendar events.</strong></p>
              <p style="font-size: 14px; color: #999;">You can close this window.</p>
            </div>
          </body>
        </html>
      `);
    } else {
      // Redirect to app for mobile
      res.redirect('familycalendar://oauth-callback?success=true');
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    if (isWebBrowser) {
      res.status(500).send('<h1>Authentication failed</h1><p>Please try again.</p>');
    } else {
      res.redirect('familycalendar://oauth-callback?success=false&error=auth_failed');
    }
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
