import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import {appInit} from './libs/appInit';

export default function App() {
  useEffect(() => {
    appInit();
  }, []);
  return (
    <View>
      <Text className="bg-red-300 text-2xl text-center">App</Text>
    </View>
  );
}
