import React, {Component} from 'react';
import {StyleSheet, Text, FlatList, TouchableHighlight} from 'react-native';
import {connect} from 'react-redux';
import Sound from 'react-native-sound';
// import Speech from '@google-cloud/speech';
import fs from 'react-native-fs';

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

  const speechToText = async () => {
    console.log('fileName:', props.item.location);
    const file = await fs.readFile(props.item.location, 'base64');
    const audioBytes = file.toString('base64');

    // Make API call to nodejs server
    return fetch('http://192.168.225.89:5000/getTranscripts', {
      method: 'POST',
      body: JSON.stringify({
        audio: audioBytes,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.log('error', error));
  };

  const getTranscripts = () => {
    const response = speechToText();

    return <Text>{'YAYY'}</Text>;
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
