import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text } from 'react-native';
import Home from './screens/Schedules';
import Home2 from './screens/Queue';
import Zones from './screens/Zones';
import IrrigationPage from './components/IrrigationPage/IrrigationPage'
import { WebSocketProvider } from './context/WebSocketContext';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
		<WebSocketProvider>
			<IrrigationPage />
		</WebSocketProvider>
    
  );
};

export default App;
