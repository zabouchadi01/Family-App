import axios from 'axios';
import { env } from '../config/env';
import { DESTINATIONS, HOME_ADDRESS, CACHE_TTL_MS } from '../config/constants';

export interface DriveTime {
  destination: string;
  address: string;
  duration: string;
  durationInTraffic?: string;
  distance: string;
}

interface CachedResponse {
  data: DriveTime[];
  timestamp: number;
}

let cachedDriveTimes: CachedResponse | null = null;

export async function getDriveTimes(): Promise<DriveTime[]> {
  // Return cached data if still valid
  if (cachedDriveTimes && Date.now() - cachedDriveTimes.timestamp < CACHE_TTL_MS) {
    console.log('Returning cached drive times');
    return cachedDriveTimes.data;
  }

  try {
    const origin = HOME_ADDRESS;
    const destinations = DESTINATIONS.map((d) => d.address).join('|');

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: origin,
          destinations: destinations,
          key: env.GOOGLE_MAPS_API_KEY,
          departure_time: 'now',
          traffic_model: 'best_guess',
        },
      }
    );

    const data = response.data;

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API error: ${data.status}`);
    }

    const elements = data.rows[0]?.elements || [];

    const driveTimes: DriveTime[] = DESTINATIONS.map((destination, index) => {
      const element = elements[index];

      if (!element || element.status !== 'OK') {
        return {
          destination: destination.name,
          address: destination.address,
          duration: 'Unavailable',
          distance: 'Unavailable',
        };
      }

      return {
        destination: destination.name,
        address: destination.address,
        duration: element.duration?.text || 'Unavailable',
        durationInTraffic: element.duration_in_traffic?.text,
        distance: element.distance?.text || 'Unavailable',
      };
    });

    // Cache the successful response
    cachedDriveTimes = {
      data: driveTimes,
      timestamp: Date.now(),
    };

    return driveTimes;
  } catch (error) {
    console.error('Error fetching drive times:', error);

    // Return cached data if available (even if stale)
    if (cachedDriveTimes) {
      console.log('Returning stale cached drive times due to error');
      return cachedDriveTimes.data;
    }

    throw error;
  }
}
