import { View, Text } from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

export default function SplashScreen() {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
      <Text className="text-red-400 text-2xl text-center my-auto">SplashScreen</Text>
    </SafeAreaView>
  )
}