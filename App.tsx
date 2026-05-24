import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './screens/Login';
import Home from './screens/Home';
import IrrigationPage from './components/IrrigationPage/IrrigationPage';
import Ideas from './screens/megan/Ideas';
import ToDo from './screens/todo/ToDo';
import { WebSocketProvider } from './context/WebSocketContext';
import { UnitProvider } from './context/UnitContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from './lib/theme';

export type RootStackParamList = {
  Home: undefined;
  Irrigation: undefined;
  Megan: undefined;
  ToDo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <UnitProvider>
      <WebSocketProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Irrigation" component={IrrigationPage} />
            <Stack.Screen name="Megan" component={Ideas} />
            <Stack.Screen name="ToDo" component={ToDo} />
          </Stack.Navigator>
        </NavigationContainer>
      </WebSocketProvider>
    </UnitProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
