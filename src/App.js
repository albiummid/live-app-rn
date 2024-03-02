import { View, Text } from 'react-native'
import React,{useEffect,useState} from 'react'
import SplashScreen from './screens/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/auth/LoginScreen';
import { ldb } from './libs/ldb';
import { ldbKeys } from './constants/keys';
import dInfo from 'react-native-device-info'
import { appInit, deviceInit } from './libs/appInit';
import HomeTabScreen from './screens/HomeTabScreen';
export default function App() {
  const [started,setStarted] = useState(false);
  const splashTime = 2000;
  useEffect(()=>{
    let timer
    if(!started){
      timer = setTimeout( async()=>{
      await  deviceInit();
        setStarted(true);
      },splashTime)
    }
      return ()=>{
      clearTimeout(timer);
    }
  },[])

  
if(!started ){
  return <SplashScreen/>
}


const MainStack = createNativeStackNavigator();
return (
    <SafeAreaView style={{flex:1}}>
        <NavigationContainer >
          <MainStack.Navigator initialRouteName={appInit().isAuthenticated?"/home":'/login'}  >
            <MainStack.Screen  component={HomeTabScreen} name='/home' options={{
                  headerShown:false
                }}/>
           <MainStack.Screen component={LoginScreen} name='/login' options={{
                headerBackVisible:false,
                headerTitleAlign:"center",
                headerTitle:"Login"
              }}/>
          </MainStack.Navigator>
        </NavigationContainer>
    </SafeAreaView>
    )
 
}