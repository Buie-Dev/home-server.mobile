import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from './context/AuthContext';
import Login from './screens/Login';
import Home from './screens/Home';
import IrrigationPage from './components/IrrigationPage/IrrigationPage';
import People from './screens/megan/People';
import ToDo from './screens/todo/ToDo';
import DevicesScreen from './screens/irrigation/Devices';
import Events from './screens/events/Events';
import Admin from './screens/admin/Admin';
import Rowing from './screens/rowing/Rowing';
import RaceTimer from './screens/rowing/RaceTimer';
import {WebSocketProvider} from './context/WebSocketContext';
import {UnitProvider} from './context/UnitContext';
import {ActivityIndicator, View} from 'react-native';
import {COLORS} from './lib/theme';

export type RootStackParamList = {
  Home: undefined;
  Irrigation: undefined;
  People: undefined;
  ToDo: undefined;
  Devices: undefined;
  Events: undefined;
  Admin: undefined;
  Rowing: undefined;
  RaceTimer: {raceId: number};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}>
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
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Irrigation" component={IrrigationPage} />
            <Stack.Screen name="People" component={People} />
            <Stack.Screen name="ToDo" component={ToDo} />
            <Stack.Screen name="Devices" component={DevicesScreen} />
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="Admin" component={Admin} />
            <Stack.Screen name="Rowing" component={Rowing} />
            <Stack.Screen name="RaceTimer" component={RaceTimer} />
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
