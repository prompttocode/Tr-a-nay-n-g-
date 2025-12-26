import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -200;

const FoodListScreen = ({ names, setNames }) => {
  const removeName = useCallback(index => {
    setNames(currentNames => currentNames.filter((_, i) => i !== index));
  }, [setNames]);

  const NameItem = React.memo(({ item, index }) => {
    const translateX = useSharedValue(0);
    const panGesture = Gesture.Pan()
      .onUpdate(event => {
        translateX.value = event.translationX;
      })
      .onEnd(() => {
        const deleteWidth = -width;
        if (translateX.value < SWIPE_THRESHOLD) {
          translateX.value = withTiming(deleteWidth, { duration: 250 }, () => {
            runOnJS(removeName)(index);
          });
        } else {
          translateX.value = withTiming(0);
        }
      });

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const deleteIconStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1]),
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [50, 0],
          ),
        },
      ],
    }));

    return (
      <View style={styles.nameItemWrapper}>
        <Animated.View style={[styles.deleteBackground, deleteIconStyle]}>
          <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.deleteText}>Xóa</Text>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.nameItem, rStyle]}>
            <View style={styles.nameItemContent}>
              <Text style={styles.nameText}>{item}</Text>
              <Text style={styles.swipeHint}>← Vuốt để xóa</Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  });

  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>
        Danh sách món ăn ({names.length})
      </Text>
      <View style={styles.listContainer}>
        {names.map((item, index) => (
          <NameItem key={index.toString()} item={item} index={index} />
        ))}
      </View>
    </View>
  );
};

export default FoodListScreen;

const styles = StyleSheet.create({
    listSection: {
        width: '100%',
        flex: 1,
      },
      listTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      listContainer: {
        paddingHorizontal: 50,
      },
      nameItemWrapper: {
        position: 'relative',
        marginBottom: 10,
      },
      deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 100,
        backgroundColor: '#FF4757',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        flexDirection: 'row',
      },
      deleteText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
      },
      nameItem: {
        justifyContent: 'center',
        height: 55,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
      },
      nameItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      nameText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
      },
      swipeHint: {
        color: '#999',
        fontSize: 10,
        fontStyle: 'italic',
      },
});
