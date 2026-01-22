import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'modal',
            title: 'Settings',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
