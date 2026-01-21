import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { DriveTime, LoadingState } from '../types';

interface Props {
  driveTimes: DriveTime[];
  state: LoadingState;
  error?: string;
}

function DriveTimeItem({ driveTime }: { driveTime: DriveTime }) {
  const hasTraffic = driveTime.durationInTraffic &&
    driveTime.durationInTraffic !== driveTime.duration;

  return (
    <View style={styles.driveTimeItem}>
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{driveTime.destination}</Text>
        <Text style={styles.distance}>{driveTime.distance}</Text>
      </View>
      <View style={styles.durationInfo}>
        {hasTraffic ? (
          <>
            <Text style={styles.trafficDuration}>{driveTime.durationInTraffic}</Text>
            <Text style={styles.normalDuration}>Usually {driveTime.duration}</Text>
          </>
        ) : (
          <Text style={styles.duration}>{driveTime.duration}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  driveTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  distance: {
    fontSize: 13,
    color: '#888',
  },
  durationInfo: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  trafficDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
  },
  normalDuration: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  centerContent: {
    height: 100,
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
