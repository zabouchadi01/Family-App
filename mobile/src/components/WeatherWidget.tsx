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

interface Props {
  data: WeatherData | null;
  state: LoadingState;
  error?: string;
}

function getWeatherIconUrl(icon: string): string {
  return `${WEATHER_ICON_URL}/${icon}@2x.png`;
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{data.location}</Text>
        {state === 'loading' && (
          <ActivityIndicator size="small" color="#FF9800" />
        )}
      </View>

      <View style={styles.mainContent}>
        <View style={styles.temperatureSection}>
          <Image
            source={{ uri: getWeatherIconUrl(data.icon) }}
            style={styles.weatherIcon}
          />
          <Text style={styles.temperature}>{data.temperature}°F</Text>
        </View>
        <Text style={styles.description}>{data.description}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Feels Like</Text>
          <Text style={styles.detailValue}>{data.feelsLike}°F</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{data.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>{data.windSpeed} mph</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  mainContent: {
    alignItems: 'center',
    marginVertical: 8,
  },
  temperatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 60,
    height: 60,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '300',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  centerContent: {
    height: 150,
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
    color: '#666',
    textAlign: 'center',
  },
});
