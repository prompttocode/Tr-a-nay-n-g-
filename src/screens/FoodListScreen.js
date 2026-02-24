import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const FoodListScreen = ({ names, setNames }) => {
  const removeName = useCallback(index => {
    setNames(currentNames => currentNames.filter((_, i) => i !== index));
  }, [setNames]);

  const NameItem = React.memo(({ item, index }) => {
    return (
      <View style={styles.nameItemWrapper}>
        <View style={styles.nameItem}>
            <Text style={styles.nameText}>{item}</Text>
            <TouchableOpacity onPress={() => removeName(index)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
        </View>
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
        marginBottom: 10,
      },
      nameItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
      nameText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
      },
      deleteButton: {
          backgroundColor: '#FF4757',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 10,
      },
      deleteButtonText: {
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
      }
});
