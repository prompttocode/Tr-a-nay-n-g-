import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import Loading from '../lottie/loading.json';
import LottieView from 'lottie-react-native';

const Wellcome = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('WheelOfFortune');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <LottieView
        source={Loading}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
};

export default Wellcome;

const styles = StyleSheet.create({});