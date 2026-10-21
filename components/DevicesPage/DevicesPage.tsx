import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const DevicesPage = () => {
  return (
    <View style={styles.container}>
      <Text>Devices Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DevicesPage;
