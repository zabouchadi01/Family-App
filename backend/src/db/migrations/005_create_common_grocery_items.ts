import { query } from '../connection';

export const name = '005_create_common_grocery_items';

export async function up(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS common_grocery_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(50),
      usage_count INTEGER DEFAULT 0,
      last_added TIMESTAMP WITH TIME ZONE,
      typical_frequency_days INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_common_items_name ON common_grocery_items (name);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_common_items_usage ON common_grocery_items (usage_count DESC);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_common_items_category ON common_grocery_items (category);
  `);

  console.log('Created common_grocery_items table');
}

export async function down(): Promise<void> {
  await query('DROP TABLE IF EXISTS common_grocery_items;');
  console.log('Dropped common_grocery_items table');
}
