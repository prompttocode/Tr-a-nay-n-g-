import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import QuaCam from '../lottie/quacam.json';
import FoodListScreen from './FoodListScreen';

const AddFoodScreen = ({ navigation, route }) => {
  const [newName, setNewName] = useState('');
  const [internalNames, setInternalNames] = useState(route.params.names);
  const { setNames: setParentNames } = route.params;

  const updateNames = namesUpdater => {
    setInternalNames(namesUpdater);
    setParentNames(namesUpdater);
  };

  const addName = () => {
    if (newName.trim() !== '') {
      updateNames(currentNames => [...currentNames, newName.trim()]);
      setNewName('');
    }
  };

  return (
    <ImageBackground
      style={styles.backgroundImage}
      source={require('../images/foodback.png')}
    >
      <View style={{flex: 1, width: '100%'}}>
        <ScrollView style={styles.container}>
          <View style={styles.inputSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <LottieView
                source={QuaCam}
                autoPlay
                loop
                style={{ width: 70, height: 70, backgroundColor: 'transparent' }}
              />
              <Text style={styles.inputLabel}>Thêm món ăn mới</Text>
            </View>
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
          <FoodListScreen names={internalNames} setNames={updateNames} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default AddFoodScreen;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      container: {
        flex: 1,
        width: '100%',
      },
      inputSection: {
        marginTop: 50,
        width: '90%',
        alignSelf: 'center',
        marginBottom: 25,
      },
      inputLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      inputContainer: {
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
      buttonText: {
        fontSize: 20,
      },
});
