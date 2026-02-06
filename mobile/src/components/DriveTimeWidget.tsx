import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { DriveTime, LoadingState } from '../types';
import { colors, typography, shadows, borderRadius } from '../theme/colors';
import { calculateTrafficDelay, getTrafficBackground } from '../utils/durationParser';

interface Props {
  driveTimes: DriveTime[];
  state: LoadingState;
  error?: string;
}

function DriveTimeItem({ driveTime }: { driveTime: DriveTime }) {
  const delayMinutes = calculateTrafficDelay(
    driveTime.duration,
    driveTime.durationInTraffic
  );
  const backgroundColor = getTrafficBackground(delayMinutes);
  const shouldShowUsually = delayMinutes !== null && delayMinutes > 1;
  const displayDuration = shouldShowUsually ? driveTime.durationInTraffic : driveTime.duration;

  return (
    <View style={[styles.driveTimeItem, { backgroundColor }]}>
      <Text style={styles.duration}>{displayDuration}</Text>
      <Text style={styles.destinationName}>
        {driveTime.destination}
        {shouldShowUsually && ` • Usually ${driveTime.duration}`}
      </Text>
    </View>
  );
}

export function DriveTimeWidget({ driveTimes, state, error }: Props) {
  const renderContent = () => {
    if (state === 'loading' && driveTimes.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#34A853" />
        </View>
      );
    }

    if (state === 'error' && driveTimes.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Failed to load drive times'}</Text>
        </View>
      );
    }

    if (driveTimes.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No destinations configured</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <FlatList
          data={driveTimes}
          keyExtractor={(item) => item.destination}
          renderItem={({ item }) => <DriveTimeItem driveTime={item} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Drive Times</Text>
        {state === 'loading' && driveTimes.length > 0 && (
          <ActivityIndicator size="small" color="#34A853" style={styles.loadingIndicator} />
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
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  driveTimeItem: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  itemSeparator: {
    height: 12,
  },
  destinationName: {
    ...typography.driveDestination,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  duration: {
    ...typography.driveTime,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
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
