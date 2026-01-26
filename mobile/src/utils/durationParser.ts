import { colors } from '../theme/colors';

/**
 * Parse Google Maps duration strings to total minutes
 * Handles formats: "10 mins", "1 hour", "1 hour 5 mins", "2 hours 30 mins"
 * Returns null for "Unavailable", undefined, empty, or malformed strings
 */
export function parseDurationToMinutes(durationText: string | undefined): number | null {
  if (!durationText || durationText === 'Unavailable' || durationText.trim() === '') {
    return null;
  }

  const text = durationText.toLowerCase();

  // Extract hours and minutes using regex
  const hourMatch = text.match(/(\d+)\s*hours?/);
  const minMatch = text.match(/(\d+)\s*mins?/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

  // If we found neither hours nor minutes, the format is malformed
  if (!hourMatch && !minMatch) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Calculate traffic delay by comparing actual time to usual time
 * Returns null if either parse fails or durationInTraffic is missing
 * Returns the difference in minutes (can be negative if faster than usual)
 */
export function calculateTrafficDelay(
  duration: string,
  durationInTraffic?: string
): number | null {
  if (!durationInTraffic) {
    return null;
  }

  const usualMinutes = parseDurationToMinutes(duration);
  const actualMinutes = parseDurationToMinutes(durationInTraffic);

  if (usualMinutes === null || actualMinutes === null) {
    return null;
  }

  return actualMinutes - usualMinutes;
}

/**
 * Get traffic color based on delay thresholds:
 * - null → textPrimary (fallback)
 * - <= 1 minute → trafficNormal (green)
 * - 1-5 minutes → textSecondary (grey)
 * - > 5 minutes → trafficRed (red)
 */
export function getTrafficColor(delayMinutes: number | null): string {
  if (delayMinutes === null) {
    return colors.textPrimary;
  }

  if (delayMinutes <= 1) {
    return colors.trafficNormal;
  }

  if (delayMinutes <= 5) {
    return colors.textSecondary;
  }

  return colors.trafficRed;
}

/**
 * Get traffic background color based on delay thresholds:
 * - null → neutral (light gray)
 * - <= 1 minute → normal (light green)
 * - 1-5 minutes → caution (light orange)
 * - > 5 minutes → alert (light red)
 */
export function getTrafficBackground(delayMinutes: number | null): string {
  if (delayMinutes === null) {
    return colors.statusBackgrounds.neutral;
  }

  if (delayMinutes <= 1) {
    return colors.statusBackgrounds.normal;
  }

  if (delayMinutes <= 5) {
    return colors.statusBackgrounds.caution;
  }

  return colors.statusBackgrounds.alert;
}
