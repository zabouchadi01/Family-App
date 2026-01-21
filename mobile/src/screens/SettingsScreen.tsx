import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { checkAuthStatus, getAuthUrl, logout } from '../services/api';
import { getLastRefreshTime, clearAllCache } from '../services/storage';

export function SettingsScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [status, refreshTime] = await Promise.all([
        checkAuthStatus(),
        getLastRefreshTime(),
      ]);

      setIsAuthenticated(status.authenticated);

      if (refreshTime) {
        setLastRefresh(
          refreshTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        );
      }
    } catch (error) {
      console.error('Failed to load settings data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignIn = useCallback(() => {
    const authUrl = getAuthUrl();
    Linking.openURL(authUrl);
  }, []);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your cached data will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setIsAuthenticated(false);
            } catch (error) {
              console.error('Failed to sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app will refetch data on the next refresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllCache();
              setLastRefresh(null);
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              console.error('Failed to clear cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Google Account</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  isAuthenticated ? styles.statusConnected : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {isAuthenticated ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
              <Text style={styles.buttonTextDanger}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonTextPrimary}>Sign In with Google</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Last Refresh</Text>
            <Text style={styles.value}>{lastRefresh || 'Never'}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleClearCache}>
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Refresh Interval</Text>
            <Text style={styles.value}>15 minutes</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonTextPrimary: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  buttonTextDanger: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
  },
});
