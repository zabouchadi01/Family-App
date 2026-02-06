import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeApiUrl } from './src/services/api';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApiUrl().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
