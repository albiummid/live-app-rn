import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/Conversation/ChatScreen';
import VectorIcon, {Icons} from '../components/VectorIcon';

export default function TabNavigator() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      }}>
      <Tab.Screen
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon type={Icons.Feather} name={'home'} color={color} />
          ),
        }}
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon
              type={Icons.MaterialIcons}
              name={focused ? 'chat-bubble' : 'chat-bubble-outline'}
              color={color}
            />
          ),
        }}
        name="Chat"
        component={ChatScreen}
      />
      <Tab.Screen
        name="Profle"
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon
              type={Icons.Ionicons}
              name={'person-outline'}
              color={color}
            />
          ),
        }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}
