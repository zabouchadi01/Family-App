import { google } from 'googleapis';
import { query } from '../db/connection';
import { env } from '../config/env';
import { TOKEN_REFRESH_BUFFER_MS, CALENDAR_SCOPE } from '../config/constants';

interface StoredToken {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [CALENDAR_SCOPE],
    prompt: 'consent',
  });
}

export async function storeToken(
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  // Single-user app: delete existing tokens first
  await query('DELETE FROM auth_tokens');

  await query(
    `INSERT INTO auth_tokens (access_token, refresh_token, expires_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [accessToken, refreshToken, expiresAt]
  );
}

async function getStoredToken(): Promise<StoredToken | null> {
  const result = await query<StoredToken>(
    'SELECT id, access_token, refresh_token, expires_at FROM auth_tokens LIMIT 1'
  );
  return result.rows[0] || null;
}

async function updateToken(
  id: number,
  accessToken: string,
  expiresAt: Date
): Promise<void> {
  await query(
    `UPDATE auth_tokens
     SET access_token = $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [accessToken, expiresAt, id]
  );
}

export async function refreshToken(storedToken: StoredToken): Promise<string> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: storedToken.refresh_token,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token || !credentials.expiry_date) {
    throw new Error('Failed to refresh token: missing credentials');
  }

  const newExpiresAt = new Date(credentials.expiry_date);
  await updateToken(storedToken.id, credentials.access_token, newExpiresAt);

  return credentials.access_token;
}

export async function getValidToken(): Promise<string> {
  const storedToken = await getStoredToken();

  if (!storedToken) {
    throw new Error('No authentication token found. Please sign in.');
  }

  const now = Date.now();
  const expiresAt = new Date(storedToken.expires_at).getTime();

  // Refresh if token expires within the buffer period
  if (expiresAt - now < TOKEN_REFRESH_BUFFER_MS) {
    console.log('Token expiring soon, refreshing...');
    return refreshToken(storedToken);
  }

  return storedToken.access_token;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const storedToken = await getStoredToken();
    if (!storedToken) {
      return false;
    }

    // Check if we can get a valid token (will refresh if needed)
    await getValidToken();
    return true;
  } catch {
    return false;
  }
}

export async function clearTokens(): Promise<void> {
  await query('DELETE FROM auth_tokens');
}
