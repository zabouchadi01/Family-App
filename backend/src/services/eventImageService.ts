import crypto from 'crypto';
import { query } from '../db/connection';
import { generateSearchQuery } from './queryGenerator';
import { searchPhoto, UnsplashPhoto } from './unsplash';

export interface EventImageData {
  imageUrl: string;
  thumbUrl: string;
  photographerName: string;
  photographerUrl: string;
  unsplashLink: string;
}

interface CachedRow {
  event_id: string;
  title_hash: string;
  image_url: string | null;
  image_thumb_url: string | null;
  photographer_name: string | null;
  photographer_url: string | null;
  unsplash_link: string | null;
}

export function computeTitleHash(title: string, location?: string): string {
  const input = `${title}|${location || ''}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

async function getCachedImages(
  eventIds: string[],
  titleHashes: Map<string, string>,
): Promise<Map<string, EventImageData | null>> {
  const result = new Map<string, EventImageData | null>();
  if (eventIds.length === 0) return result;

  const placeholders = eventIds.map((_, i) => `$${i + 1}`).join(', ');
  const rows = await query<CachedRow>(
    `SELECT event_id, title_hash, image_url, image_thumb_url,
            photographer_name, photographer_url, unsplash_link
     FROM event_images WHERE event_id IN (${placeholders})`,
    eventIds,
  );

  for (const row of rows.rows) {
    const expectedHash = titleHashes.get(row.event_id);
    if (row.title_hash !== expectedHash) continue;

    if (row.image_url) {
      result.set(row.event_id, {
        imageUrl: row.image_url,
        thumbUrl: row.image_thumb_url || '',
        photographerName: row.photographer_name || '',
        photographerUrl: row.photographer_url || '',
        unsplashLink: row.unsplash_link || '',
      });
    } else {
      // Cached as failed — mark with null so we don't retry
      result.set(row.event_id, null);
    }
  }

  return result;
}

async function saveImageToDb(
  eventId: string,
  titleHash: string,
  searchQueryText: string,
  photo: UnsplashPhoto | null,
): Promise<void> {
  await query(
    `INSERT INTO event_images
       (event_id, title_hash, search_query, image_url, image_thumb_url,
        photographer_name, photographer_url, unsplash_link, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
     ON CONFLICT (event_id, title_hash)
     DO UPDATE SET
       search_query = $3, image_url = $4, image_thumb_url = $5,
       photographer_name = $6, photographer_url = $7, unsplash_link = $8,
       updated_at = CURRENT_TIMESTAMP`,
    [
      eventId,
      titleHash,
      searchQueryText,
      photo?.imageUrl || null,
      photo?.thumbUrl || null,
      photo?.photographerName || null,
      photo?.photographerUrl || null,
      photo?.unsplashLink || null,
    ],
  );
}

interface EventInput {
  id: string;
  title: string;
  location?: string;
}

async function fetchAndCacheImage(
  event: EventInput,
  titleHash: string,
): Promise<EventImageData | null> {
  const searchQueryText = await generateSearchQuery(event.title, event.location);
  const photo = await searchPhoto(searchQueryText);

  await saveImageToDb(event.id, titleHash, searchQueryText, photo);

  if (!photo) return null;

  return {
    imageUrl: photo.imageUrl,
    thumbUrl: photo.thumbUrl,
    photographerName: photo.photographerName,
    photographerUrl: photo.photographerUrl,
    unsplashLink: photo.unsplashLink,
  };
}

/**
 * Enrich a batch of events with stock photo images.
 * Returns a map from eventId to image data (or null if no image found).
 *
 * Cached events are served from PostgreSQL. Cache misses are fetched
 * in parallel with a concurrency limit of 3.
 */
export async function enrichEventsWithImages(
  events: EventInput[],
): Promise<Map<string, EventImageData | null>> {
  const titleHashes = new Map<string, string>();
  for (const event of events) {
    titleHashes.set(event.id, computeTitleHash(event.title, event.location));
  }

  // Pass 1: check cache
  const cached = await getCachedImages(
    events.map(e => e.id),
    titleHashes,
  );

  // Pass 2: fetch missing
  const uncached = events.filter(e => !cached.has(e.id));

  if (uncached.length > 0) {
    const CONCURRENCY = 3;
    for (let i = 0; i < uncached.length; i += CONCURRENCY) {
      const batch = uncached.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(async (event) => {
          const titleHash = titleHashes.get(event.id)!;
          const imageData = await fetchAndCacheImage(event, titleHash);
          return { eventId: event.id, imageData };
        }),
      );
      for (const { eventId, imageData } of results) {
        cached.set(eventId, imageData);
      }
    }
  }

  return cached;
}

/**
 * Remove cached images older than the specified number of days.
 */
export async function cleanupOldImages(daysOld: number): Promise<void> {
  try {
    const result = await query(
      `DELETE FROM event_images WHERE updated_at < NOW() - INTERVAL '1 day' * $1`,
      [daysOld],
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} old event images`);
    }
  } catch (error) {
    console.error('Failed to cleanup old event images:', (error as Error).message);
  }
}
