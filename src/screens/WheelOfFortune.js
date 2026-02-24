import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
} from 'react-native';
import  QuaCam  from '../lottie/quacam.json';
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Food from '../lottie/food.json'
import FoodListScreen from './FoodListScreen';

const { width, height } = Dimensions.get('window');
const wheelSize = Math.min(width, height) * 0.7;

const initialNames = [
  'PHỞ',
  'BÚN SƯỜN',
  'BÁNH MÌ',
  'CHẢ CÁ',
  'CUỐN THỊT HEO',
  'BÚN CÁ',
  'BÚN CHẢ',
  'SÚP CUA',
  'SUSHI',
  'MÌ',
  'BÁNH CUỐN',
  'BÚN RIÊU',
  'BÚN TRỘN',
  'CƠM RANG',
  'GÀ RÁN',
  'BÚN BÒ',
  'NEM NƯỚNG',
  'BÁNH CANH',
  'MIẾN LƯƠN',
  'CƠM TẤM',
  'CƠM VP',
  'ĂN SẠCH',
];

const WheelOfFortune = ({ navigation }) => {
  const [names, setNames] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const [winnerText, setWinnerText] = useState('');
  const [winnerIndex, setWinnerIndex] = useState(null);

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
        console.error('Failed to load names from storage', e);
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
        console.error('Failed to save names to storage', e);
      }
    };
    saveNames();
  }, [names]);

  useEffect(() => {
    // Hiệu ứng lấp lánh liên tục
    sparkleAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true,
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
      { rotate: `${rotation.value}deg` },
      { scale: scaleAnimation.value },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      sparkleAnimation.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3],
    );
    return { opacity };
  });

  const spinWheel = () => {
    if (!isSpinning.value) {
      isSpinning.value = true;
      scaleAnimation.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 }),
      );
      const randomRotation =
        rotation.value + Math.floor(Math.random() * 360) + 2160;
      rotation.value = withSpring(
        randomRotation,
        { damping: 10, stiffness: 1, mass: 0.1 },
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
    const winnerIdx = Math.floor(adjustedRotation / sliceAngle);
    const safeWinnerIndex = (names.length - 1 - winnerIdx) % names.length;
    setWinnerIndex(safeWinnerIndex);
    setWinnerText(names[safeWinnerIndex]);
    setShowWinner(true);
  };

  const handleCloseModal = () => {
    setShowWinner(false);
    setWinnerIndex(null);
  };

  const removeWinner = () => {
    if (winnerIndex !== null) {
      setNames(currentNames =>
        currentNames.filter((_, index) => index !== winnerIndex),
      );
    }
    handleCloseModal();
  };

  const createWheelPaths = () => {
    const total = names.length;
    const angleSize = 360 / (total || 1);

    if (total === 0) {
      return [
        {
          path: `M${wheelSize / 2},${wheelSize / 2} m-${wheelSize / 2}, 0 a${
            wheelSize / 2
          },${wheelSize / 2} 0 1,0 ${wheelSize},0 a${wheelSize / 2},${
            wheelSize / 2
          } 0 1,0 -${wheelSize},0`,
          color: ['#333', '#555'],
          name: '',
          angle: 0,
          isSingle: false,
          index: 0,
        },
      ];
    }

    if (total === 1) {
      return [
        {
          path: `M${wheelSize / 2},${wheelSize / 2} m-${wheelSize / 2}, 0 a${
            wheelSize / 2
          },${wheelSize / 2} 0 1,0 ${wheelSize},0 a${wheelSize / 2},${
            wheelSize / 2
          } 0 1,0 -${wheelSize},0`,
          color: colors[0 % colors.length],
          name: names[0],
          angle: 0,
          isSingle: true,
          index: 0,
        },
      ];
    }

    return names.map((name, index) => {
      const angle = index * angleSize;
      const x1 =
        (Math.cos(((angle - 90) * Math.PI) / 180) * wheelSize) / 2 +
        wheelSize / 2;
      const y1 =
        (Math.sin(((angle - 90) * Math.PI) / 180) * wheelSize) / 2 +
        wheelSize / 2;
      const x2 =
        (Math.cos(((angle + angleSize - 90) * Math.PI) / 180) * wheelSize) / 2 +
        wheelSize / 2;
      const y2 =
        (Math.sin(((angle + angleSize - 90) * Math.PI) / 180) * wheelSize) / 2 +
        wheelSize / 2;
      const path = `M${wheelSize / 2},${wheelSize / 2} L${x1},${y1} A${
        wheelSize / 2
      },${wheelSize / 2} 0 0,1 ${x2},${y2} Z`;
      return {
        path,
        color: colors[index % colors.length],
        name,
        angle,
        isSingle: false,
        index,
      };
    });
  };



  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          style={styles.backgroundImage}
          source={require('../images/foodback.png')}
        >
          <View style={styles.header}>
            <Text style={styles.heading}>🍽️ Hôm nay ăn gì? 🍽️</Text>
            <Text style={styles.subHeading}>
              Xoay bánh xe để khám phá món ngon!
            </Text>
          </View>

          <View style={styles.wheelWrapper}>
            <Animated.View style={sparkleStyle}>
              <View style={styles.sparkleContainer}>
                <Text style={styles.sparkle}>✨</Text>
                <Text
                  style={[
                    styles.sparkle,
                    { position: 'absolute', top: 20, right: 10 },
                  ]}
                >
                  ⭐
                </Text>
                <Text
                  style={[
                    styles.sparkle,
                    { position: 'absolute', bottom: 20, left: 10 },
                  ]}
                >
                  💫
                </Text>
                <Text
                  style={[
                    styles.sparkle,
                    { position: 'absolute', top: 50, left: -10 },
                  ]}
                >
                  🌟
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.wheelContainer, wheelStyle]}>
              <View style={styles.wheelShadow} />
              <Svg
                height={wheelSize}
                width={wheelSize}
                viewBox={`0 0 ${wheelSize} ${wheelSize}`}
              >
                <Defs>
                  {createWheelPaths().map((segment, index) => (
                    <LinearGradient
                      key={index}
                      id={`grad${index}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
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
                      fontSize={names.length > 15 ? '10' : '14'}
                      fill="#fff"
                      fontWeight="bold"
                      textAnchor="middle"
                      stroke="#ffffffff"
                      strokeWidth="0.5"
                      transform={`rotate(${
                        segment.angle + 180 / (names.length || 1)
                      }, ${wheelSize / 2}, ${wheelSize / 2}) translate(0, -${
                        wheelSize / 3
                      }) rotate(90, ${wheelSize / 2}, ${wheelSize / 2})`}
                    >
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
                {/* <SvgText
                  x={wheelSize / 2}
                  y={wheelSize / 2}
                  fontSize="12"
                  fill="#fff"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  SPIN
                </SvgText> */}
                <LottieView
                  source={Food}
                  autoPlay
                  loop
                  style={{
                    width: 60,
                    height: 60,
                    position: 'absolute',
                    top: wheelSize / 2 - 30,
                    left: wheelSize / 2 - 30,
                  }}
                  
                />
              </Svg>
            </Animated.View>

            <Svg height="50" width="40" style={styles.pointerSvg}>
              <Defs>
                <LinearGradient
                  id="pointerGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
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

          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFood', { names, setNames })}
          >
            <Text style={styles.buttonText}>Thêm món ăn</Text>
          </TouchableOpacity>
        </ImageBackground>
      </ScrollView>

      {/* Custom Winner Modal */}
      <Modal
        visible={showWinner}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={Food}
              autoPlay
              loop
              style={styles.winnerLottie}
            />
            
            <Text style={styles.congratsText}>🎉 Chúc mừng! 🎉</Text>
            
            <View style={styles.winnerTextContainer}>
              <Text style={styles.winnerMainText}>Bạn sẽ ăn</Text>
              <Text style={styles.winnerFoodText}>{winnerText}</Text>
              <Text style={styles.winnerMainText}>vào hôm nay!</Text>
            </View>
            
            <View style={styles.celebrationEmojis}>
              <Text style={styles.emoji}>🍽️</Text>
              <Text style={styles.emoji}>✨</Text>
              <Text style={styles.emoji}>🥳</Text>
            </View>
            
            <Text style={styles.deleteQuestionText}>Xóa món này khỏi vòng quay?</Text>

            <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.deleteModalButton]}
                    onPress={removeWinner}>
                    <Text style={styles.modalButtonText}>Xóa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.closeModalButton]}
                    onPress={handleCloseModal}>
                    <Text style={styles.modalButtonText}>Để lại</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WheelOfFortune;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subHeading: {
    color: '#FFE4B5',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 15,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    width: '85%',
    maxWidth: 350,
  },
  winnerLottie: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  winnerTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  winnerMainText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  winnerFoodText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginVertical: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 107, 107, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  celebrationEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
  },
  emoji: {
    fontSize: 30,
  },
  deleteQuestionText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteModalButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  closeModalButton: {
    backgroundColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
  },
});
