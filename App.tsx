import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Wellcome from './src/screens/Wellcome';
import WheelOfFortune from './src/screens/WheelOfFortune';
import AddFoodScreen from './src/screens/AddFoodScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Alert, SafeAreaView } from 'react-native';
import WebView from 'react-native-webview';
import ConfigLoader from 'react-native-app-config-loader';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ConfigLoader appName="homnayangi">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={Wellcome} />
            <Stack.Screen name="WheelOfFortune" component={WheelOfFortune} />
            <Stack.Screen name="AddFood" component={AddFoodScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ConfigLoader>
  );
};

export default App;
