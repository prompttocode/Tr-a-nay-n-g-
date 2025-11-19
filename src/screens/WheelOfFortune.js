import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Easing,
  ImageBackground,
} from 'react-native';
import Svg, {Path, Circle, G, Text as SvgText, Polygon, Defs, LinearGradient, Stop} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
  interpolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');
const wheelSize = Math.min(width, height) * 0.7;
const SWIPE_THRESHOLD = -200;

const initialNames = [
  'PHỞ', 'BÚN SƯỜN', 'BÁNH MÌ', 'CHẢ CÁ', 'CUỐN THỊT HEO', 'BÚN CÁ',
  'BÚN CHẢ', 'SÚP CUA', 'SUSHI', 'MÌ', 'BÁNH CUỐN', 'BÚN RIÊU',
  'BÚN TRỘN', 'CƠM RANG', 'GÀ RÁN', 'BÚN BÒ', 'NEM NƯỚNG', 'BÁNH CANH',
  'MIẾN LƯƠN', 'CƠM TẤM', 'CƠM VP', 'ĂN SẠCH',
];

const WheelOfFortune = () => {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');

  const rotation = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const isInitialMount = useRef(true);
  const sparkleAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  // Load names from storage on mount
  useEffect(() => {
    const loadNames = async () => {
      try {
        const storedNames = await AsyncStorage.getItem('names');
        if (storedNames !== null) {
          setNames(JSON.parse(storedNames));
        } else {
          setNames(initialNames);
        }
      } catch (e) {
        console.error("Failed to load names from storage", e);
        setNames(initialNames); // Fallback to initial names on error
      }
    };
    loadNames();
  }, []);

  // Save names to storage on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const saveNames = async () => {
      try {
        await AsyncStorage.setItem('names', JSON.stringify(names));
      } catch (e) {
        console.error("Failed to save names to storage", e);
      }
    };
    saveNames();
  }, [names]);

  useEffect(() => {
    // Hiệu ứng lấp lánh liên tục
    sparkleAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const colors = [
    ['#FF6B6B', '#FF8E53'], // Gradient đỏ cam
    ['#4ECDC4', '#44A08D'], // Gradient xanh
    ['#45B7D1', '#96C93D'], // Gradient xanh lá
    ['#FFA726', '#FB8C00'], // Gradient cam
    ['#AB47BC', '#8E24AA'], // Gradient tím
    ['#26A69A', '#00ACC1'], // Gradient xanh cyan
    ['#66BB6A', '#43A047'], // Gradient xanh lá đậm
    ['#EF5350', '#E53935'], // Gradient đỏ
    ['#5C6BC0', '#3F51B5'], // Gradient xanh đậm
    ['#FFCA28', '#FFC107'], // Gradient vàng
  ];

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${rotation.value}deg`},
      {scale: scaleAnimation.value}
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      sparkleAnimation.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3]
    );
    return { opacity };
  });

  const addName = () => {
    if (newName.trim() !== '') {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const spinWheel = () => {
    if (!isSpinning.value) {
      isSpinning.value = true;
      scaleAnimation.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      const randomRotation =
        rotation.value + Math.floor(Math.random() * 360) + 2160;
      rotation.value = withSpring(
        randomRotation,
        {damping: 10, stiffness: 1, mass: 0.1},
        () => {
          runOnJS(setIsSpinning)(false);
          runOnJS(determineWinner)(randomRotation);
        },
      );
    }
  };

  const setIsSpinning = value => {
    isSpinning.value = value;
  };

  const determineWinner = finalRotation => {
    const sliceAngle = 360 / names.length;
    const adjustedRotation = (finalRotation - 90) % 360;
    const winnerIndex = Math.floor(adjustedRotation / sliceAngle);
    const safeWinnerIndex = (names.length - 1 - winnerIndex) % names.length;
    Alert.alert(`Bạn sẽ ăn ${names[safeWinnerIndex]} vào trưa nay!`);
  };

  const createWheelPaths = () => {
    const total = names.length;
    const angleSize = 360 / (total || 1);

    if (total === 0) {
      return [
        {
          path: `M${wheelSize / 2},${wheelSize / 2} m-${wheelSize / 2}, 0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 ${wheelSize},0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 -${wheelSize},0`,
          color: ['#333', '#555'], name: '', angle: 0, isSingle: false, index: 0
        },
      ];
    }

    if (total === 1) {
      return [
        {
          path: `M${wheelSize / 2},${wheelSize / 2} m-${wheelSize / 2}, 0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 ${wheelSize},0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 -${wheelSize},0`,
          color: colors[0 % colors.length], name: names[0], angle: 0, isSingle: true, index: 0
        },
      ];
    }

    return names.map((name, index) => {
      const angle = index * angleSize;
      const x1 = (Math.cos(((angle - 90) * Math.PI) / 180) * wheelSize) / 2 + wheelSize / 2;
      const y1 = (Math.sin(((angle - 90) * Math.PI) / 180) * wheelSize) / 2 + wheelSize / 2;
      const x2 = (Math.cos(((angle + angleSize - 90) * Math.PI) / 180) * wheelSize) / 2 + wheelSize / 2;
      const y2 = (Math.sin(((angle + angleSize - 90) * Math.PI) / 180) * wheelSize) / 2 + wheelSize / 2;
      const path = `M${wheelSize / 2},${wheelSize / 2} L${x1},${y1} A${wheelSize / 2},${wheelSize / 2} 0 0,1 ${x2},${y2} Z`;
      return { path, color: colors[index % colors.length], name, angle, isSingle: false, index };
    });
  };

  const removeName = useCallback(index => {
    setNames(currentNames => currentNames.filter((_, i) => i !== index));
  }, []);

  const NameItem = React.memo(({item, index}) => {
    const translateX = useSharedValue(0);
    const panGesture = Gesture.Pan()
      .onUpdate(event => {
        translateX.value = event.translationX;
      })
      .onEnd(() => {
        const deleteWidth = -width;
        if (translateX.value < SWIPE_THRESHOLD) {
          translateX.value = withTiming(
            deleteWidth,
            { duration: 250 },
            () => { runOnJS(removeName)(index); },
          );
        } else {
          translateX.value = withTiming(0);
        }
      });

    const rStyle = useAnimatedStyle(() => ({
      transform: [{translateX: translateX.value}],
    }));

    const deleteIconStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD / 2],
        [0, 1]
      ),
      transform: [{
        translateX: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [50, 0]
        )
      }]
    }));

    return (
      <View style={styles.nameItemWrapper}>
        <Animated.View style={[styles.deleteBackground, deleteIconStyle]}>
          <Svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none">
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
    <ScrollView
      contentContainerStyle={styles.container}>
      <ImageBackground
        style={styles.backgroundImage}
        source={require('../images/foodback.png')}>
        
        <View style={styles.header}>
          <Text style={styles.heading}>🍽️ Trưa nay ăn gì? 🍽️</Text>
          <Text style={styles.subHeading}>Xoay bánh xe để khám phá món ngon!</Text>
        </View>

        <View style={styles.wheelWrapper}>
          <Animated.View style={sparkleStyle}>
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={[styles.sparkle, {position: 'absolute', top: 20, right: 10}]}>⭐</Text>
              <Text style={[styles.sparkle, {position: 'absolute', bottom: 20, left: 10}]}>💫</Text>
              <Text style={[styles.sparkle, {position: 'absolute', top: 50, left: -10}]}>🌟</Text>
            </View>
          </Animated.View>
          
          <Animated.View style={[styles.wheelContainer, wheelStyle]}>
            <View style={styles.wheelShadow} />
            <Svg
              height={wheelSize}
              width={wheelSize}
              viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
              <Defs>
                {createWheelPaths().map((segment, index) => (
                  <LinearGradient key={index} id={`grad${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={segment.color[0]} />
                    <Stop offset="100%" stopColor={segment.color[1]} />
                  </LinearGradient>
                ))}
              </Defs>
              {createWheelPaths().map((segment, index) => (
                <G key={index}>
                  <Path 
                    d={segment.path} 
                    fill={`url(#grad${index})`}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <SvgText
                    x={wheelSize / 2}
                    y={wheelSize / 2}
                    fontSize={names.length > 15 ? "10" : "14"}
                    fill="#fff"
                    fontWeight="bold"
                    textAnchor="middle"
                    stroke="#ffffffff"
                    strokeWidth="0.5"
                    transform={
                      `rotate(${segment.angle + (180 / (names.length || 1))}, ${wheelSize / 2}, ${wheelSize / 2}) translate(0, -${wheelSize / 3}) rotate(90, ${wheelSize / 2}, ${wheelSize / 2})`
                    }>
                    {segment.name}
                  </SvgText>
                </G>
              ))}
              <Circle
                cx={wheelSize / 2}
                cy={wheelSize / 2}
                r="30"
                fill="url(#centerGrad)"
                stroke="#FFD700"
                strokeWidth="3"
                onPress={spinWheel}
              />
              <SvgText
                x={wheelSize / 2}
                y={wheelSize / 2}
                fontSize="12"
                fill="#fff"
                fontWeight="bold"
                textAnchor="middle">
                SPIN
              </SvgText>
            </Svg>
          </Animated.View>
          
          <Svg
            height="50"
            width="40"
            style={styles.pointerSvg}>
            <Defs>
              <LinearGradient id="pointerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFD700" />
                <Stop offset="100%" stopColor="#FFA000" />
              </LinearGradient>
            </Defs>
            <Polygon
              points="30,5 50,60 10,60"
              fill="url(#pointerGrad)"
              stroke="#fff"
              strokeWidth="2"
              transform={`rotate(270, 30, 32.5)`}
            />
          </Svg>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Thêm món ăn mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              cursorColor="#FF6B6B"
              selectionColor="#FF6B6B"
              placeholder="Nhập tên món ăn..."
              placeholderTextColor="#999"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <TouchableOpacity style={styles.addButton} onPress={addName}>
              <Text style={styles.buttonText}>➕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Danh sách món ăn ({names.length})</Text>
          <ScrollView style={styles.listContainer}>
            {names.map((item, index) => (
              <NameItem key={index.toString()} item={item} index={index} />
            ))}
          </ScrollView>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

export default WheelOfFortune

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
  },
  backgroundImage: {
    flex: 1, 
    width: '100%', 
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  subHeading: {
    color: '#FFE4B5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  wheelWrapper: {
    position: 'relative',
    marginBottom: 30,
  },
  sparkleContainer: {
    position: 'absolute',
    width: wheelSize + 60,
    height: wheelSize + 60,
    top: -30,
    left: -30,
    zIndex: 1,
  },
  sparkle: {
    fontSize: 20,
    position: 'absolute',
  },
  wheelContainer: {
    width: wheelSize,
    height: wheelSize,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  wheelShadow: {
    position: 'absolute',
    width: wheelSize + 10,
    height: wheelSize + 10,
    borderRadius: (wheelSize + 10) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    top: 1,
    left: 1,
  },
  pointerSvg: {
    position: 'absolute',
    top: wheelSize / 2 - 25,
    right: -15,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 15,
  },
  inputSection: {
    width: '90%',
    marginBottom: 25,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 25,
    shadowColor: '#FF6B6B',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
  },
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
    textShadowOffset: {width: 1, height: 1},
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
    shadowOffset: {width: 0, height: 2},
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
  winnerContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  winnerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});