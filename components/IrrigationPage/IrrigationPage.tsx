import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import Schedules from '../../screens/Schedules';
import Queue from '../../screens/Queue';
import Zones from '../../screens/Zones';


const Tab = createBottomTabNavigator();

const IrrigationPage = () => {
  return (
	
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon = <View></View>;

            if (route.name === 'Zones') {
              //icon = <MaterialIcons name="house" size={24} color="#2196f3" />
            } else if (route.name === 'Schedules') {
             // icon = <MaterialIcons name="house" size={24} color="#333" />
            } else if (route.name === 'Queue') {
              //icon = <MaterialIcons name="house" size={24} color="#333" />
            }

            return icon;
          },
        })}
      >
        <Tab.Screen name="Zones" component={Zones} />
        <Tab.Screen name="Schedules" component={Schedules} />
        <Tab.Screen name="Queue" component={Queue} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default IrrigationPage;
