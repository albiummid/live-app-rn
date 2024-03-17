import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import DiamondWalletScreen from './DiamondWalletScreen';
import BeanWalletScreen from './BeanWalletScreen';

export default function WalletScreen() {
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator>
      <TopTab.Screen name="Diamonds" component={DiamondWalletScreen} />
      <TopTab.Screen name="Beans" component={BeanWalletScreen} />
    </TopTab.Navigator>
  );
}
