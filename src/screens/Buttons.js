import React, {Component} from 'react';
import {connect} from 'react-redux';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {audioListAction} from '../actions/addAudio';

const IDLE = 'idle';
const PLAYING = 'play';
const PAUSED = 'pause';
const RECORD = 'record';
const AUDIO_BASE = AudioUtils.DocumentDirectoryPath;

export class Buttons extends Component {
  state = {
    recordingState: IDLE,
    hasPermission: false,
    currentTime: 0,
  };

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 44100,
      Channels: 1,
      AudioQuality: 'Medium',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({
        hasPermission: isAuthorised,
      });

      if (!isAuthorised) {
        return;
      }

      // this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = data => {
        this.setState({
          currentTime: Math.floor(data.currentTime),
        });
      };

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
        <Text>{title}</Text>
      </TouchableHighlight>
    );
  }

  renderButton(recordingState) {
    if (recordingState == IDLE) {
      // render record
      return (
        <>
          {this.getButton('record', () => this.record())}
          {this.getButton('Playrecord', () => this.play())}
        </>
      );
    } else if (recordingState == RECORD) {
      // render Stop button and pause
      return (
        <>
          <Text>{this.state.currentTime}</Text>
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
      this.setState({paused: true});
    } catch (error) {
      console.error(error);
    }
  }

  async resume() {
    if (!this.state.recordingState == PAUSED) {
      console.warn("Can't resume, not paused!");
      return;
    }

    try {
      await AudioRecorder.resumeRecording();
      this.setState({paused: false});
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
      var sound = new Sound(this.state.audioPath, '', error => {
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
    const date = new Date().toLocaleDateString();
    this.prepareRecordingPath(this.state.audioPath + date);

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
    this.setState({finished: didSucceed});
    this.props.addRecording(filePath);
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    );
  }

  render() {
    return <>{this.renderButton()}</>;
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
  playerButton: {
    margin: 50,
    flex: 1,
    padding: 15,
    backgroundColor: '#919',
  },
});

// eslint-disable-next-line prettier/prettier
export default connect(null, mapDispatchToProps)(Buttons);
