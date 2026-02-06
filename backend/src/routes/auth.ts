import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getAuthStatus,
  logout,
} from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Setup page for initial OAuth (access from PC browser)
router.get('/setup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Family Calendar Setup</title>
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
            max-width: 400px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 30px; }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: #4285F4;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.3s;
          }
          .button:hover { background: #357ae8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗓️ Family Calendar Setup</h1>
          <p>Sign in with your Google account to authorize calendar access. You only need to do this once.</p>
          <a href="/api/auth/google" class="button">Sign In with Google</a>
        </div>
      </body>
    </html>
  `);
});

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', asyncHandler(handleGoogleCallback));
router.get('/status', asyncHandler(getAuthStatus));
router.post('/logout', asyncHandler(logout));

export default router;
