import {View, Text, StatusBar} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import config from '../../configs/app.config';

export default function SplashScreen() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar hidden />
      <Text className="text-red-400 text-2xl text-center my-auto">
        SplashScreen
      </Text>
      {config.isDevENV && (
        <View className="mb-10 mx-auto">
          <Text className="text-base">Running on Development Environment</Text>
          <Text>API Base URL : {config.API_BASE_URL}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
