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
import { calculateTrafficDelay, getTrafficColor } from '../utils/durationParser';

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
  const trafficColor = getTrafficColor(delayMinutes);
  const shouldShowUsually = delayMinutes !== null && delayMinutes > 1;

  return (
    <View style={styles.driveTimeItem}>
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{driveTime.destination}</Text>
      </View>
      <View style={styles.durationInfo}>
        {shouldShowUsually ? (
          <>
            <Text style={[styles.duration, { color: trafficColor }]}>
              {driveTime.durationInTraffic}
            </Text>
            <Text style={styles.normalDuration}>Usually {driveTime.duration}</Text>
          </>
        ) : (
          <Text style={[styles.duration, { color: trafficColor }]}>
            {driveTime.duration}
          </Text>
        )}
      </View>
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
      <FlatList
        data={driveTimes}
        keyExtractor={(item) => item.destination}
        renderItem={({ item }) => <DriveTimeItem driveTime={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drive Times</Text>
        {state === 'loading' && driveTimes.length > 0 && (
          <ActivityIndicator size="small" color="#34A853" />
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
  driveTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    ...typography.driveDestination,
    color: colors.textPrimary,
  },
  durationInfo: {
    alignItems: 'flex-end',
  },
  duration: {
    ...typography.driveTime,
    color: colors.textPrimary,
  },
  trafficDuration: {
    ...typography.driveTime,
    color: colors.trafficRed,
  },
  normalDuration: {
    ...typography.driveUsually,
    color: colors.textSecondary,
    marginTop: 2,
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
