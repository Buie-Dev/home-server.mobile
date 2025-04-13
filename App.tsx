import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text } from 'react-native';
import Home from './screens/Schedules';
import Home2 from './screens/Queue';
import Zones from './screens/Zones';
import NavigationLayout from './components/NavigationLayout/NavigationLayout'
import { WebSocketProvider } from './context/WebSocketContext';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
		<WebSocketProvider>
			<NavigationLayout />
		</WebSocketProvider>
    
  );
};

export default App;
