import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerNavigation } from '../../types/navigation';

const Header = () => {
  const navigation = useNavigation<DrawerNavigation>();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={styles.menuButton}
      >
        <Icon name="menu" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuButton: {
    padding: 8,
  },
});

export default Header; 