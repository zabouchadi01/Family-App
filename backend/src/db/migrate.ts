import dotenv from 'dotenv';
dotenv.config();

import { query } from './connection';
import * as migration001 from './migrations/001_create_auth_tokens';
import * as migration002 from './migrations/002_create_config';
import * as migration003 from './migrations/003_add_calendar_config';

interface Migration {
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: Migration[] = [
  migration001,
  migration002,
  migration003,
];

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
  return result.rows.map((row) => row.name);
}

async function recordMigration(name: string): Promise<void> {
  await query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function runMigrations(): Promise<void> {
  console.log('Starting migrations...');

  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();

  for (const migration of migrations) {
    if (!executed.includes(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up();
      await recordMigration(migration.name);
      console.log(`Completed migration: ${migration.name}`);
    } else {
      console.log(`Skipping already executed migration: ${migration.name}`);
    }
  }

  console.log('All migrations completed successfully');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
