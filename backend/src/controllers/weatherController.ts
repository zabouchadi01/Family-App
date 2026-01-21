import { Request, Response } from 'express';
import { getCurrentWeather } from '../services/weather';

export async function getWeather(req: Request, res: Response): Promise<void> {
  try {
    const weather = await getCurrentWeather();
    res.json(weather);
  } catch (error) {
    console.error('Error in weather controller:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
