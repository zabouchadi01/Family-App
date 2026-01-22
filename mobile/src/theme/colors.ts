/**
 * Family Calendar Design System
 * Optimized for wall-mounted tablet viewing (6-8 feet distance)
 */

// Base Colors
export const colors = {
  // App backgrounds
  appBackground: '#FBF8F3',      // Soft warm cream
  cardBackground: '#FFFFFF',      // Pure white

  // Temporal accents (day-based visual hierarchy)
  todayAccent: '#FF8C42',         // Warm orange
  todayBackground: '#FFF4ED',     // Light orange tint
  tomorrowAccent: '#5B9BD5',      // Cool blue
  tomorrowBackground: '#EFF6FC',  // Light blue tint
  upcomingAccent: '#757575',      // Neutral gray
  upcomingBackground: '#FFFFFF',  // White (no tint)

  // Weather condition backgrounds
  weatherSunny: '#FFF9E6',        // Pale yellow
  weatherRainy: '#E8F4F8',        // Pale blue
  weatherCloudy: '#F5F5F5',       // Pale gray
  weatherSnowy: '#F0F8FF',        // Alice blue
  weatherDefault: '#FFFFFF',      // Default white

  // Text hierarchy
  textPrimary: '#1A1A1A',         // Near black
  textSecondary: '#666666',       // Medium gray
  textLight: '#999999',           // Light gray

  // Status colors
  trafficRed: '#E84C3D',          // Traffic delay indicator
  trafficNormal: '#4CAF50',       // Normal traffic (green)

  // Dividers and borders
  divider: '#E8E4DF',             // Warm gray divider
  border: '#D0CCC7',              // Subtle border

  // Settings icon
  settingsIcon: '#999999',        // Subtle gray for gear icon
};

// Typography Scale (optimized for distance viewing)
export const typography = {
  // Event card text
  eventTitle: {
    fontSize: 26,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  eventTime: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 29,
  },
  eventLocation: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 25,
  },

  // Weather widget
  weatherTemp: {
    fontSize: 84,
    fontWeight: '200' as const,
    lineHeight: 100,
  },
  weatherIcon: {
    size: 120,
  },
  weatherLocation: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
  },
  weatherDescription: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 30,
  },

  // Drive time widget
  driveTime: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  driveDestination: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  driveUsually: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },

  // Widget headers
  widgetHeader: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },

  // Day section headers
  dayHeader: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },

  // Settings icon
  settingsIcon: {
    size: 32,
  },
};

// Weather condition mapping
export const WEATHER_CONDITIONS: {
  [key: string]: { background: string; name: string };
} = {
  Clear: { background: colors.weatherSunny, name: 'Clear' },
  Clouds: { background: colors.weatherCloudy, name: 'Cloudy' },
  Rain: { background: colors.weatherRainy, name: 'Rainy' },
  Drizzle: { background: colors.weatherRainy, name: 'Drizzly' },
  Snow: { background: colors.weatherSnowy, name: 'Snowy' },
  Thunderstorm: { background: colors.weatherRainy, name: 'Stormy' },
  Mist: { background: colors.weatherCloudy, name: 'Misty' },
  Fog: { background: colors.weatherCloudy, name: 'Foggy' },
  Haze: { background: colors.weatherCloudy, name: 'Hazy' },
};

// Day type classification
export type DayType = 'today' | 'tomorrow' | 'upcoming';

// Helper function to get accent colors by day type
export const getAccentColors = (dayType: DayType) => {
  switch (dayType) {
    case 'today':
      return {
        accent: colors.todayAccent,
        background: colors.todayBackground,
      };
    case 'tomorrow':
      return {
        accent: colors.tomorrowAccent,
        background: colors.tomorrowBackground,
      };
    case 'upcoming':
      return {
        accent: colors.upcomingAccent,
        background: colors.upcomingBackground,
      };
  }
};

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// Shadows
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
};
