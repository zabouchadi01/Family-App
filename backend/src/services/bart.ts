import axios from 'axios';
import {
  BART_API_KEY,
  BART_STATION,
  BART_SF_DIRECTION,
  BART_MAX_DEPARTURES,
  CACHE_TTL_MS,
} from '../config/constants';

export interface BartDeparture {
  destination: string;
  minutes: number;
  departing: boolean;
  platform: string;
  color: string;
  length: string;
  delay: number;
}

export interface BartAdvisory {
  id: string;
  type: string;
  description: string;
  posted: string;
  station: string;
}

export interface BartData {
  departures: BartDeparture[];
  advisories: BartAdvisory[];
  fetchedAt: string;
  stationName: string;
}

interface CachedResponse {
  data: BartData;
  timestamp: number;
}

let cachedBart: CachedResponse | null = null;

export async function getBartDepartures(): Promise<BartData> {
  // Return cached data if still valid
  if (cachedBart && Date.now() - cachedBart.timestamp < CACHE_TTL_MS) {
    console.log('Returning cached BART data');
    return cachedBart.data;
  }

  try {
    const [etdResponse, bsaResponse] = await Promise.all([
      axios.get('https://api.bart.gov/api/etd.aspx', {
        params: {
          cmd: 'etd',
          orig: BART_STATION,
          key: BART_API_KEY,
          json: 'y',
        },
      }),
      axios.get('https://api.bart.gov/api/bsa.aspx', {
        params: {
          cmd: 'bsa',
          orig: 'ORIN',
          key: BART_API_KEY,
          json: 'y',
        },
      }),
    ]);

    // Parse departures
    const stationData = etdResponse.data?.root?.station;
    const stations = Array.isArray(stationData) ? stationData : stationData ? [stationData] : [];
    const station = stations[0];
    const stationName = station?.name || 'Orinda';

    const departures: BartDeparture[] = [];

    if (station?.etd) {
      const etdList = Array.isArray(station.etd) ? station.etd : [station.etd];

      for (const etd of etdList) {
        const estimates = Array.isArray(etd.estimate) ? etd.estimate : [etd.estimate];

        for (const est of estimates) {
          // Filter to SF-bound trains only
          if (est.direction !== BART_SF_DIRECTION) continue;

          const isLeaving = est.minutes === 'Leaving';
          const minutes = isLeaving ? 0 : parseInt(est.minutes, 10);

          if (isNaN(minutes) && !isLeaving) continue;

          departures.push({
            destination: etd.destination,
            minutes,
            departing: isLeaving,
            platform: est.platform || '',
            color: est.color || '',
            length: est.length ? `${est.length} car` : '',
            delay: parseInt(est.delay, 10) || 0,
          });
        }
      }
    }

    // Sort by minutes ascending, take top N
    departures.sort((a, b) => a.minutes - b.minutes);
    const topDepartures = departures.slice(0, BART_MAX_DEPARTURES);

    // Parse advisories
    const bsaData = bsaResponse.data?.root?.bsa;
    const bsaList = Array.isArray(bsaData) ? bsaData : bsaData ? [bsaData] : [];

    const advisories: BartAdvisory[] = bsaList
      .filter((bsa: any) => {
        // Only show DELAY-type advisories, filter out placeholders
        const desc = bsa.description?.['#cdata-section'] || bsa.description || '';
        if (desc === 'No delays reported.' || desc === '') return false;
        const type = (bsa.type || '').toUpperCase();
        return type === 'DELAY';
      })
      .map((bsa: any) => ({
        id: bsa['@id'] || bsa.id || '',
        type: bsa.type || 'DELAY',
        description: bsa.description?.['#cdata-section'] || bsa.description || '',
        posted: bsa.posted || '',
        station: bsa.station || '',
      }));

    const bartData: BartData = {
      departures: topDepartures,
      advisories,
      fetchedAt: new Date().toISOString(),
      stationName,
    };

    // Cache the successful response
    cachedBart = {
      data: bartData,
      timestamp: Date.now(),
    };

    return bartData;
  } catch (error) {
    console.error('Error fetching BART data:', error);

    // Return cached data if available (even if stale)
    if (cachedBart) {
      console.log('Returning stale cached BART data due to error');
      return cachedBart.data;
    }

    throw error;
  }
}
