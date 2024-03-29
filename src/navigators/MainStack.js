import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import config from '../../configs/app.config';
import {deviceInit, getAuth} from '../libs/appInit';
import LoginScreen from '../screens/auth/LoginScreen';
import BroadcastRoom from '../screens/BroadcastScreens/BroadcastRoom';
import SingleHost from '../screens/BroadcastScreens/SingleHost';
import ChatScreen from '../screens/Conversation/ChatScreen';
import ConversationSearchScreen from '../screens/Conversation/ConversationSearch';
import FriendScreen from '../screens/friend';
import HostFTMA from '../screens/GoBroadcast/HostFTMA';
import HostFTMAV from '../screens/GoBroadcast/HostFTMAV';
import HostOTMAV from '../screens/GoBroadcast/HostOTMAV';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import Reels from '../screens/Reels';
import SplashScreen from '../screens/SplashScreen';
import WalletScreen from '../screens/wallet';
import TabNavigator from './TabNavigator';
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
        <MainStack.Screen
          component={BroadcastRoom}
          name="BroadcastRoom"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={SingleHost}
          name="SingleHost"
          options={{
            headerTitleAlign: 'center',
            headerShown: true,
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={HostOTMAV}
          name="HostOTMAV"
          options={{
            headerTitleAlign: 'center',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />

        <MainStack.Screen
          component={HostFTMAV}
          name="HostFTMAV"
          options={{
            headerTitleAlign: 'center',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={HostFTMA}
          name="HostFTMA"
          options={{
            headerTitleAlign: 'center',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <MainStack.Screen
          component={Reels}
          name="Reels"
          options={{
            headerTitleAlign: 'center',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
