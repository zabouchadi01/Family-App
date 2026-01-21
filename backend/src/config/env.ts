import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env = {
  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Google OAuth
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: requireEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: requireEnv('GOOGLE_REDIRECT_URI'),

  // External APIs
  OPENWEATHER_API_KEY: requireEnv('OPENWEATHER_API_KEY'),
  GOOGLE_MAPS_API_KEY: requireEnv('GOOGLE_MAPS_API_KEY'),

  // Server
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:8081'),
};
