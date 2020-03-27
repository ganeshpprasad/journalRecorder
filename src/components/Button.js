import React from 'react';
import {Image, TouchableHighlight, Text, StyleSheet} from 'react-native';

export const Button = ({title, callback}) => (
  <TouchableHighlight onPress={callback} style={styles.playerButton}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  playerButton: {
    margin: 50,
    flex: 1,
    padding: 30,
    borderColor: '#919',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonText: {
    fontSize: 20,
  },
  img: {width: 50, height: 50, alignSelf: 'flex-start'},
});
