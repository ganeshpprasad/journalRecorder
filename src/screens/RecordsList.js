import React, { Component, useState } from 'react';
import { StyleSheet, Text, FlatList, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import Sound from 'react-native-sound';
// import Speech from '@google-cloud/speech';
import { speechToText } from '../services/speechToTextAPI';

const Item = props => {
  const [transcript, set] = useState('');

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

  const getTranscripts = () => {
    const { location } = props.item;
    const response = speechToText(location);
    response
      .then(data => {
        console.log('res done', data);
        set(data);
      })
      .catch(e => console.log('error in response data', e));

    return <Text>{transcript}</Text>;
  };

  return (
    <TouchableHighlight onPress={() => playRecording()}>
      <>
        <Text style={styles.item}>{props.item.name}</Text>
        {getTranscripts()}
      </>
    </TouchableHighlight>
  );
};

export class RecordsList extends Component {
  render() {
    const elementToRender =
      this.props.audioFiles.length > 0 ? (
        <FlatList
          style={styles.listCon}
          data={this.props.audioFiles}
          renderItem={({ item }) => <Item item={item} />}
        />
      ) : (
        <Text>No items here</Text>
      );
    return elementToRender;
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

const mapStateToProps = state => ({
  audioFiles: state.audioFileName,
});

const mapDispatchToProps = {};

// eslint-disable-next-line prettier/prettier
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecordsList);
