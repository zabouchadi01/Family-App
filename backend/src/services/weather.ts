import axios from 'axios';
import { env } from '../config/env';
import { WEATHER_LOCATION, CACHE_TTL_MS } from '../config/constants';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  condition: string;
  icon: string;
  windSpeed: number;
  location: string;
}

interface CachedResponse {
  data: WeatherData;
  timestamp: number;
}

let cachedWeather: CachedResponse | null = null;

export async function getCurrentWeather(): Promise<WeatherData> {
  // Return cached data if still valid
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_TTL_MS) {
    console.log('Returning cached weather data');
    return cachedWeather.data;
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat: WEATHER_LOCATION.lat,
          lon: WEATHER_LOCATION.lon,
          appid: env.OPENWEATHER_API_KEY,
          units: 'imperial', // Use Fahrenheit
        },
      }
    );

    const data = response.data;

    const weather: WeatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description || 'Unknown',
      condition: data.weather[0]?.main || 'Clear',
      icon: data.weather[0]?.icon || '01d',
      windSpeed: Math.round(data.wind.speed),
      location: WEATHER_LOCATION.name,
    };

    // Cache the successful response
    cachedWeather = {
      data: weather,
      timestamp: Date.now(),
    };

    return weather;
  } catch (error) {
    console.error('Error fetching weather:', error);

    // Return cached data if available (even if stale)
    if (cachedWeather) {
      console.log('Returning stale cached weather data due to error');
      return cachedWeather.data;
    }

    throw error;
  }
}
