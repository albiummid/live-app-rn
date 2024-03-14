import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {deviceInit, getAuth} from '../libs/appInit';
import LoginScreen from '../screens/auth/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';
import WalletScreen from '../screens/wallet';
import {ldb} from '../libs/ldb';
import config from '../../configs/app.config';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import FriendScreen from '../screens/friend';
import ConversationSearchScreen from '../screens/Conversation/ConversationSearch';
import ChatScreen from '../screens/Conversation/ChatScreen';

export default function MainStack() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let timer;
    if (!started) {
      timer = setTimeout(async () => {
        await deviceInit();
        setStarted(true);
      }, config.splashTime * 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!started) {
    return <SplashScreen />;
  }

  const MainStack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <MainStack.Navigator
        initialRouteName={getAuth().isAuthenticated ? 'Tab' : 'Login'}>
        <MainStack.Screen
          component={TabNavigator}
          name="Tab"
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          component={LoginScreen}
          name="Login"
          options={{
            headerBackVisible: false,
            headerTitleAlign: 'center',
            headerTitle: 'Login',
          }}
        />
        <MainStack.Screen
          component={WalletScreen}
          name="Wallet"
          options={{
            headerTitleAlign: 'center',
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={PublicProfileScreen}
          name="PublicProfile"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerTitle: 'Profile',
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={FriendScreen}
          name="Friends"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerTitle: 'Friends',
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={ConversationSearchScreen}
          name="ConversationSearch"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerTitle: 'Search for chat',
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={ChatScreen}
          name="Chat"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerShadowVisible: false,
          }}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
