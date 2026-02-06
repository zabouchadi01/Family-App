import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BartData, BartDeparture, LoadingState } from '../types';
import { colors, typography, shadows, borderRadius } from '../theme/colors';

interface Props {
  data: BartData | null;
  state: LoadingState;
  error?: string;
}

function useCountdownMinutes(fetchedAt: string | undefined): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!fetchedAt) {
      setElapsed(0);
      return;
    }

    const computeElapsed = () => {
      const fetchedTime = new Date(fetchedAt).getTime();
      return Math.floor((Date.now() - fetchedTime) / 60000);
    };

    setElapsed(computeElapsed());

    const interval = setInterval(() => {
      setElapsed(computeElapsed());
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchedAt]);

  return elapsed;
}

function DepartureRow({ departure, elapsed }: { departure: BartDeparture; elapsed: number }) {
  const adjustedMinutes = departure.minutes - elapsed;
  const isNow = departure.departing || adjustedMinutes <= 0;
  const displayTime = isNow ? 'Now' : `${adjustedMinutes} min`;
  const hasDelay = departure.delay > 0;

  return (
    <View style={[styles.departureItem, hasDelay && styles.departureDelayed]}>
      <Text style={styles.departureTime}>{displayTime}</Text>
      <Text style={styles.departureDestination}>
        {departure.destination}
      </Text>
    </View>
  );
}

export function BartWidget({ data, state, error }: Props) {
  const elapsed = useCountdownMinutes(data?.fetchedAt);

  const visibleDepartures = useMemo(() => {
    if (!data?.departures) return [];
    return data.departures
      .filter((d) => {
        if (d.departing) return false;
        const adjusted = d.minutes - elapsed;
        return adjusted >= 10;
      })
      .slice(0, 2);
  }, [data?.departures, elapsed]);

  const renderAdvisories = () => {
    if (!data?.advisories || data.advisories.length === 0) return null;

    return (
      <View style={styles.advisoryContainer}>
        {data.advisories.map((advisory) => (
          <View key={advisory.id || advisory.description} style={styles.advisoryBox}>
            <Text style={styles.advisoryText}>{advisory.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (state === 'loading' && !data) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0099D8" />
        </View>
      );
    }

    if (state === 'error' && !data) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Failed to load BART departures'}</Text>
        </View>
      );
    }

    if (visibleDepartures.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No upcoming trains</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {renderAdvisories()}
        {visibleDepartures.map((departure, index) => (
          <React.Fragment key={`${departure.destination}-${departure.minutes}-${index}`}>
            {index > 0 && <View style={styles.itemSeparator} />}
            <DepartureRow departure={departure} elapsed={elapsed} />
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>BART</Text>
        {state === 'loading' && data && (
          <ActivityIndicator size="small" color="#0099D8" style={styles.loadingIndicator} />
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
  labelContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    marginLeft: 6,
  },
  advisoryContainer: {
    marginBottom: 12,
  },
  advisoryBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  advisoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#E84C3D',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  departureItem: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.statusBackgrounds.neutral,
  },
  departureDelayed: {
    backgroundColor: '#FFEBEE',
  },
  departureTime: {
    ...typography.driveTime,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  departureDestination: {
    ...typography.driveDestination,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemSeparator: {
    height: 12,
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
