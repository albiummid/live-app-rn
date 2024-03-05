import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {deviceInit, getAuth} from '../libs/appInit';
import LoginScreen from '../screens/auth/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';
import WalletScreen from '../screens/wallet';
import {ldb} from '../libs/ldb';

export default function MainStack() {
  const [started, setStarted] = useState(false);
  const splashTime = 2000;

  useEffect(() => {
    let timer;
    if (!started) {
      timer = setTimeout(async () => {
        await deviceInit();
        setStarted(true);
      }, splashTime);
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
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
