import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import VectorIcon, {Icons} from '../components/VectorIcon';
import ConversationScreen from '../screens/Conversation';
import GoBroadcast from '../screens/GoBroadcast';
import HomeScreen from '../screens/HomeScreen';
import PeopleScreen from '../screens/people';
import ProfileScreen from '../screens/ProfileScreen';

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
            <VectorIcon
              type={Icons.MaterialCommunityIcons}
              name={focused ? 'access-point' : 'access-point'}
              color={color}
            />
          ),
        }}
        name="GoBroadcast"
        component={GoBroadcast}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon
              type={Icons.Ionicons}
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon
              type={Icons.Ionicons}
              name={focused ? 'people' : 'people-outline'}
              color={color}
            />
          ),
        }}
        name="People"
        component={PeopleScreen}
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
        name="Conversation"
        component={ConversationScreen}
      />
      <Tab.Screen
        name="Profle"
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <VectorIcon
              type={Icons.Ionicons}
              name={focused ? 'person' : 'person-outline'}
              color={color}
            />
          ),
        }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}
