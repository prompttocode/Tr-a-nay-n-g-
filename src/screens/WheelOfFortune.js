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
import Svg, {Path, Circle, G, Text as SvgText, Polygon} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
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

  const colors = [
    '#FF9999', '#9999FF', '#99FF99', '#FFFF99', '#FF99FF', '#99FFFF',
    '#FFCC99', '#CC99FF', '#99CCFF', '#CCFF99',
  ];

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const addName = () => {
    if (newName.trim() !== '') {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const spinWheel = () => {
    if (!isSpinning.value) {
      isSpinning.value = true;
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
          color: '#333', name: '', angle: 0, isSingle: false,
        },
      ];
    }

    if (total === 1) {
      return [
        {
          path: `M${wheelSize / 2},${wheelSize / 2} m-${wheelSize / 2}, 0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 ${wheelSize},0 a${wheelSize / 2},${wheelSize / 2} 0 1,0 -${wheelSize},0`,
          color: colors[0 % colors.length], name: names[0], angle: 0, isSingle: true,
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
      return { path, color: colors[index % colors.length], name, angle, isSingle: false };
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

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.nameItem, rStyle]}>
          <Text style={styles.nameText}>{item}</Text>
        </Animated.View>
      </GestureDetector>
    );
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}>
        <ImageBackground
        style={{flex: 1, width: '100%', alignItems: 'center'}}
        source={require('../images/foodback.png')}>

        
      <Text style={styles.heading}>Trưa nay ăn gì?</Text>
      <View>
        <Animated.View style={[styles.wheelContainer, wheelStyle]}>
          <Svg
            height={wheelSize}
            width={wheelSize}
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            {createWheelPaths().map((segment, index) => (
              <G key={index}>
                <Path d={segment.path} fill={segment.color} />
                <SvgText
                  x={wheelSize / 2}
                  y={wheelSize / 2}
                  fontSize="14"
                  fill="black"
                  textAnchor="middle"
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
              r="25"
              fill="white"
              stroke={'#999'}
              onPress={spinWheel}
            />
          </Svg>
        </Animated.View>
        <Svg
          height="40"
          width="30"
          style={[styles.pointerSvg, styles.pointerShadow]}>
          <Polygon
            points="25,0 50,50 0,50"
            fill="#eee"
            transform={`rotate(270, 25, 25)`}
          />
        </Svg>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          cursorColor="#fff"
          selectionColor="#fff"
          placeholder="Enter name"
          placeholderTextColor="#666"
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addName}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {names.map((item, index) => (
          <NameItem key={index.toString()} item={item} index={index} />
        ))}
      </View>
      </ImageBackground>
    </ScrollView>
  );
}

export default WheelOfFortune

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',

  },
  heading: {
    color: '#fff',
    marginBottom: 28,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wheelContainer: {
    width: wheelSize,
    height: wheelSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerSvg: {
    position: 'absolute',
    top: wheelSize / 2 - 24,
    right: -11,
    zIndex: 10,
  },
  pointerShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '90%',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffffff',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#ff1414ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    width: '90%',
    marginTop: 20,
    paddingHorizontal: 25,
  },
  nameItem: {
    justifyContent: 'center',
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#b7b7b7ff',
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5ff',
    color: '#fff',
    fontSize: 16,
  },
  nameText: {
    color: '#000000ff',
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