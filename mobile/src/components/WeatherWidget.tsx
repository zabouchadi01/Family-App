import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WeatherData, LoadingState } from '../types';
import { colors, typography, shadows, borderRadius } from '../theme/colors';

interface Props {
  data: WeatherData | null;
  state: LoadingState;
  error?: string;
}

export function WeatherWidget({ data, state, error }: Props) {
  const renderContent = () => {
    if (state === 'loading' && !data) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF9800" />
        </View>
      );
    }

    if (state === 'error' && !data) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Failed to load weather'}</Text>
        </View>
      );
    }

    if (!data) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No weather data</Text>
        </View>
      );
    }

    return (
      <View style={styles.weatherContent}>
        <Text style={styles.temperature}>{data.temperature}°F</Text>
        <Text style={styles.description}>{data.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather</Text>
        {state === 'loading' && data && (
          <ActivityIndicator size="small" color="#FF9800" />
        )}
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    ...shadows.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.widgetHeader,
    color: colors.textPrimary,
  },
  weatherContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 180,
  },
  temperature: {
    ...typography.weatherTemp,
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    ...typography.weatherDescription,
    color: colors.textSecondary,
    marginTop: 8,
    textTransform: 'capitalize',
    textAlign: 'center',
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
