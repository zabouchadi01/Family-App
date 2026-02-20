import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export interface UnsplashPhoto {
  imageUrl: string;
  thumbUrl: string;
  photographerName: string;
  photographerUrl: string;
  unsplashLink: string;
}

export async function searchPhoto(queryText: string): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

  try {
    const response = await axios.get(UNSPLASH_API_URL, {
      params: {
        query: queryText,
        per_page: 1,
        orientation: 'landscape',
        content_filter: 'high',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 5000,
    });

    const results = response.data?.results;
    if (!results || results.length === 0) {
      return null;
    }

    const photo = results[0];
    return {
      imageUrl: photo.urls?.regular || '',
      thumbUrl: photo.urls?.small || '',
      photographerName: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || '',
      unsplashLink: photo.links?.html || '',
    };
  } catch (error) {
    console.error('Unsplash search failed:', (error as Error).message);
    return null;
  }
}
