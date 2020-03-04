import React, {Component} from 'react';
import {StyleSheet, Text, FlatList, TouchableHighlight} from 'react-native';
import {connect} from 'react-redux';
import Sound from 'react-native-sound';

const Item = props => {
  const playRecording = () => {
    const sound = new Sound(props.item.location, '', () => {});
    setTimeout(() => {
      sound.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }, 100);
  };

  return (
    <TouchableHighlight onPress={() => playRecording()}>
      <Text style={styles.item}>{props.item.name}</Text>
    </TouchableHighlight>
  );
};

export class RecordsList extends Component {
  render() {
    return (
      <FlatList
        style={styles.listCon}
        data={this.props.audioFiles}
        renderItem={({item}) => <Item item={item} />}
      />
    );
  }
}

const styles = StyleSheet.create({
  listCon: {
    margin: 10,
  },
  item: {
    padding: 10,
    fontSize: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 2,
  },
});

const mapStateToProps = ({audioFileNames}) => ({
  audioFiles: audioFileNames,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RecordsList);
