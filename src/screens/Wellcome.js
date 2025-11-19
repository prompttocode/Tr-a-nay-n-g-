import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Loading from '../lottie/loading.json'
import LottieView from 'lottie-react-native'

const Wellcome = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        source={Loading}
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  )
}

export default Wellcome

const styles = StyleSheet.create({})