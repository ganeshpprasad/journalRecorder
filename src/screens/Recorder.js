import React, { Component } from 'react';
import { connect } from 'react-redux';
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
} from 'react-native';

import { audioListAction } from '../actions/addAudio';

// const PLAYING = 'play';
const IDLE = 'idle';
const PAUSED = 'pause';
const RECORD = 'record';
const AUDIO_BASE = AudioUtils.DocumentDirectoryPath;

export class Buttons extends Component {
  state = {
    recordingState: IDLE,
    hasPermission: false,
    currentTime: 0,
    newRecord: null,
    finished: false,
    recordName: null,
  };

  componentDidMount() {
    console.log('recorder mount');
  }

  prepareRecordingPath(audioPath) {
    console.log('called');

    // TODO: Move this to helper
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 44100,
      Channels: 1,
      AudioQuality: 'Medium',
      AudioEncoding: 'amr_wb',
      AudioEncodingBitRate: 32000,
    });
  }

  componentDidMount() {
    // TODO: Move this to helper
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({
        hasPermission: isAuthorised,
      });

      if (!isAuthorised) {
        return;
      }

      // this.prepareRecordingPath(this.state.audioPath);
      // TODO: Move this to helper
      AudioRecorder.onProgress = data => {
        // FIXME Get the data and set state here
        this.setState({
          currentTime: Math.floor(data.currentTime),
        });
      };
      // TODO: Move this to helper
      AudioRecorder.onFinished = data => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this.finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          );
        }
      };
    });
  }

  getButton(title, callback) {
    return (
      <TouchableHighlight onPress={callback} style={styles.playerButton}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableHighlight>
    );
  }

  // Render different buttons based on recordingState
  renderButton(recordingState = this.state.recordingState) {
    if (recordingState == IDLE) {
      // render record
      return (
        <>
          {this.getButton('RECORD', () => this.record())}
          {this.getButton('Playrecord', () => this.play())}
        </>
      );
    } else if (recordingState == RECORD) {
      // render Stop button and pause
      return (
        <>
          <View style={styles.timerView}>
            <Text style={styles.timer}>{this.state.currentTime}</Text>
          </View>
          {this.getButton('stop', () => this.stop())}
          {this.getButton('pause', () => this.pause())}
        </>
      );
      // this.getButton('pause', () => this.pause()
    } else {
      // render Resume
      return this.getButton('resume', () => this.resume());
    }
  }

  async pause() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't pause, not recording!");
      return;
    }

    try {
      const filePath = await AudioRecorder.pauseRecording();
      this.setState({ recordingState: PAUSED });
    } catch (error) {
      console.error(error);
    }
  }

  async resume() {
    if (this.state.recordingState !== PAUSED) {
      console.warn("Can't resume, not paused!");
      return;
    }

    try {
      await AudioRecorder.resumeRecording();
      this.setState({ recordingState: RECORD });
    } catch (error) {
      console.error(error);
    }
  }

  async stop() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't stop, not recording!");
      return;
    }

    this.setState({
      recordingState: IDLE,
    });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        console.log('filePath at stops', filePath);

        this.finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async play() {
    if (this.state.recordingState == IDLE) {
      // await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.newRecord, '', error => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        sound.play(success => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }

  async record() {
    if (this.state.recordingState == RECORD) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    // TODO: Move this to helper
    const date = new Date();
    const date_foler = date
      .toDateString()
      .split(' ')
      .join('_');
    const time_file = new Date()
      .toLocaleTimeString()
      .split(':')
      .join('_');

    // check for duplicates and all

    const fileName = AUDIO_BASE + '/' + date_foler + '/' + time_file + '.amr';
    this.prepareRecordingPath(fileName);
    this.setState({
      newRecord: fileName,
      recordName: time_file,
    });

    this.setState({
      recordingState: RECORD,
    });

    try {
      const filePath = await AudioRecorder.startRecording();
      console.log('Recording', filePath);
    } catch (error) {
      console.error(error);
    }
  }

  finishRecording(didSucceed, filePath, fileSize) {
    console.log('file path at finish', this.state.newRecord, filePath);

    this.props.addRecording({
      location: this.state.newRecord,
      name: this.state.recordName,
    });
    this.setState({ finished: didSucceed });
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    );
  }

  render() {
    // console.log('t', this.state);
    return <View style={styles.mainCon}>{this.renderButton()}</View>;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecording: filePath => {
      dispatch(audioListAction(filePath));
    },
  };
};

const styles = StyleSheet.create({
  mainCon: {
    marginTop: 10,
  },
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
  timer: {
    fontSize: 20,
  },
  timerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 5,
    borderColor: '#333',
    borderRadius: 50,
    padding: 30,
  },
});

// eslint-disable-next-line prettier/prettier
export default connect(
  null,
  mapDispatchToProps,
)(Buttons);
