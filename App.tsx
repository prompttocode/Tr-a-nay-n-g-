import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import WheelOfFortune from './src/screens/WheelOfFortune'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
const App = () => {
  return (
    <GestureHandlerRootView>
      <WheelOfFortune />
    </GestureHandlerRootView>
    
  )
}

export default App

const styles = StyleSheet.create({})