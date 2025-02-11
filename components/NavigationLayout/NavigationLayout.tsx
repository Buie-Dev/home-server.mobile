import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text } from 'react-native';
import Home from '../../screens/Schedules';
import Home2 from '../../screens/Queue';
import Zones from '../../screens/Zones';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
	
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = 'Irrigation'

            if (route.name === 'Irrigation') {
              iconName = 'Irrigation';
            } else if (route.name === 'Schedules') {
              iconName = 'Schedules';
            } else if (route.name === 'Queue') {
              iconName = 'Queue';
            }

            return <Text>{iconName}</Text>;
          },
        })}
      >
        <Tab.Screen name="Irr" component={Home} />
        <Tab.Screen name="Schedules" component={Home2} />
        <Tab.Screen name="Queue" component={Zones} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
