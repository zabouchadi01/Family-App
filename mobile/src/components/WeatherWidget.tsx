import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { WeatherData, LoadingState } from '../types';
import { WEATHER_ICON_URL } from '../config/constants';
import { colors, typography, WEATHER_CONDITIONS, shadows, borderRadius } from '../theme/colors';

interface Props {
  data: WeatherData | null;
  state: LoadingState;
  error?: string;
}

function getWeatherIconUrl(icon: string): string {
  return `${WEATHER_ICON_URL}/${icon}@2x.png`;
}

function getWeatherBackground(condition: string): string {
  const weatherInfo = WEATHER_CONDITIONS[condition];
  return weatherInfo ? weatherInfo.background : colors.weatherDefault;
}

export function WeatherWidget({ data, state, error }: Props) {
  if (state === 'loading' && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF9800" />
        </View>
      </View>
    );
  }

  if (state === 'error' && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Failed to load weather'}</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No weather data</Text>
        </View>
      </View>
    );
  }

  const backgroundColor = getWeatherBackground(data.condition);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.location}>{data.location}</Text>
        {state === 'loading' && (
          <ActivityIndicator size="small" color="#FF9800" />
        )}
      </View>

      <View style={styles.mainContent}>
        <View style={styles.iconOuterCircle}>
          <View style={styles.iconInnerCircle}>
            <Image
              source={{ uri: getWeatherIconUrl(data.icon) }}
              style={styles.weatherIcon}
            />
          </View>
        </View>
        <Text style={styles.temperature}>{data.temperature}°F</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    ...shadows.card,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    ...typography.weatherLocation,
    color: colors.textSecondary,
  },
  mainContent: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconOuterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.card,
  },
  iconInnerCircle: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: '#B3E5FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: typography.weatherIcon.size,
    height: typography.weatherIcon.size,
  },
  temperature: {
    ...typography.weatherTemp,
    color: colors.textPrimary,
  },
  centerContent: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
