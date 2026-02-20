import { query } from '../connection';

export const name = '004_create_event_images';

export async function up(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS event_images (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(255) NOT NULL,
      title_hash VARCHAR(64) NOT NULL,
      search_query TEXT,
      image_url TEXT,
      image_thumb_url TEXT,
      photographer_name TEXT,
      photographer_url TEXT,
      unsplash_link TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (event_id, title_hash)
    );
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images (event_id);
  `);
  console.log('Created event_images table');
}

export async function down(): Promise<void> {
  await query('DROP TABLE IF EXISTS event_images;');
  console.log('Dropped event_images table');
}
